import { users } from "~/lib/db/schema/user";
import { kv } from "./kv";
import { preprocess, z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import {
  LOGGED_IN_SESSION_TTL,
  SESSION_COOKIE_KEY,
  LOGGED_OUT_SESSION_TTL,
} from "./constants";
import { env } from "~/env.mjs";
import { nanoid } from "nanoid";

import type { User } from "~/lib/db/schema/user";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const sessionSchema = z.object({
  id: z.string(),
  expiry: preprocess((arg) => new Date(arg as any), z.date()),
  user: createSelectSchema(users).optional(),
  flashMessages: z
    .record(z.enum(["success", "error", "info", "warning"]), z.string())
    .optional(),
  formErrors: z.record(z.string(), z.array(z.string())).optional(),
  signature: z.string(),
  additionnalData: z.record(z.string(), z.any()).nullish(),
});

export type SerializedSession = z.TypeOf<typeof sessionSchema>;

type DefinedSession = Required<SerializedSession>;
type DefinedSessionKeys = keyof DefinedSession["flashMessages"];

export type SessionFlash = {
  type: DefinedSessionKeys;
  message: Required<DefinedSession["flashMessages"]>[DefinedSessionKeys];
};

interface SessionStorage {
  /**
   * Invalidate the current session, and regenerate a new one for the user
   * while keeping flash messages intact
   * @param user
   * @param session
   */
  regenerateForUser(
    user: User,
    session: SerializedSession
  ): Promise<SerializedSession>;
  /**
   * Invalidate the current session, and regenerate a new one
   * while keeping flash messages intact
   * @param user
   * @param session
   */
  invalidate(session: SerializedSession): Promise<SerializedSession>;
  /**
   * Create a new session
   * @param user
   * @param session
   */
  create(
    init?: Pick<
      SerializedSession,
      "flashMessages" | "formErrors" | "additionnalData"
    >
  ): Promise<SerializedSession>;
  get(id: string): Promise<SerializedSession | null>;
  set(session: SerializedSession): Promise<void>;
  delete(id: string): Promise<void>;
  addFlash(
    sessionId: string,
    key: string,
    message: string
  ): Promise<SerializedSession>;
  getFlash(sessionId: string): Promise<{
    session: SerializedSession;
    flashes: SerializedSession["flashMessages"];
  }>;
}

export class KVSessionStorage implements SessionStorage {
  #arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async #sign(data: string, secret: string) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const dataToSign = encoder.encode(data);

    const importedKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", importedKey, dataToSign);

    return this.#arrayBufferToBase64(signature);
  }

  async #generateSessionId() {
    const sessionId = nanoid();
    const signature = await this.#sign(sessionId, env.SESSION_SECRET);
    return {
      sessionId,
      signature,
    };
  }

  async #verifySessionId(signedSessionId: string) {
    const [sessionId, signature] = signedSessionId.split(".");
    const expectedSignature = await this.#sign(sessionId, env.SESSION_SECRET);
    if (signature === expectedSignature) {
      return sessionId;
    } else {
      throw new Error("Invalid session ID");
    }
  }

  public async create(
    init?: Pick<
      SerializedSession,
      "flashMessages" | "formErrors" | "additionnalData"
    >
  ): Promise<SerializedSession> {
    const { sessionId, signature } = await this.#generateSessionId();
    const sessionObject = {
      id: sessionId,
      expiry: new Date(Date.now() + LOGGED_OUT_SESSION_TTL * 1000),
      signature,
      flashMessages: init?.flashMessages,
      formErrors: init?.formErrors,
      additionnalData: init?.additionnalData,
    } satisfies SerializedSession;

    await this.set(sessionObject);
    return sessionObject;
  }

  public async get(signedSessionId: string): Promise<SerializedSession | null> {
    const verifiedSessionId = await this.#verifySessionId(signedSessionId);

    const sessionObject = await kv.get(`session:${verifiedSessionId}`);
    if (sessionObject) {
      return sessionSchema.parse(sessionObject);
    } else {
      return null;
    }
  }

  public async set(session: SerializedSession): Promise<void> {
    await this.#verifySessionId(`${session.id}.${session.signature}`);

    // don't store expiry as a date, but a timestamp instead
    const expiry = session.expiry.getTime();
    await kv.set(
      `session:${session.id}`,
      { ...session, expiry },
      session.user ? LOGGED_IN_SESSION_TTL : LOGGED_OUT_SESSION_TTL
    );
  }

  public async delete(signedSessionId: string): Promise<void> {
    const verifiedSessionId = await this.#verifySessionId(signedSessionId);
    await kv.delete(`session:${verifiedSessionId}`);
  }

  public async addFlash(
    signedSessionId: string,
    key: string,
    message: string
  ): Promise<SerializedSession> {
    const session = await this.get(signedSessionId);
    if (!session) throw new Error("Session must be defined");

    const newSession = {
      ...session,
      flashMessages: {
        ...session.flashMessages,
        [key]: message,
      },
    } satisfies SerializedSession;

    await this.set(newSession);
    return newSession;
  }

  public async getFlash(signedSessionId: string): Promise<{
    session: SerializedSession;
    flashes: SerializedSession["flashMessages"];
  }> {
    const session = await this.get(signedSessionId);
    if (!session) throw new Error("Session must be defined");

    const flashes = { ...session.flashMessages };

    if (flashes) {
      delete session.flashMessages;
      await this.set(session);
    }

    return { session, flashes };
  }

  public async regenerateForUser(
    user: User,
    session: SerializedSession
  ): Promise<SerializedSession> {
    // delete the old session
    await this.delete(`${session.id}.${session.signature}`);

    const { sessionId, signature } = await this.#generateSessionId();
    // recreate a new session while conserving flash messages & adding user to it
    const sessionObject = {
      id: sessionId,
      expiry: new Date(Date.now() + LOGGED_IN_SESSION_TTL * 1000),
      signature,
      user,
      flashMessages: session.flashMessages,
      formErrors: session.formErrors,
      additionnalData: session.additionnalData,
    } satisfies SerializedSession;

    await this.set(sessionObject);
    return sessionObject;
  }

  public async invalidate(
    session: SerializedSession
  ): Promise<SerializedSession> {
    // delete the old session
    await this.delete(`${session.id}.${session.signature}`);

    // create a new one
    return await this.create({
      flashMessages: session.flashMessages,
      formErrors: session.formErrors,
      additionnalData: session.additionnalData,
    });
  }
}

export class Session {
  static #storage: SessionStorage = new KVSessionStorage();
  #internal: SerializedSession;

  private constructor(serializedPayload: SerializedSession) {
    this.#internal = serializedPayload;
  }

  public static fromPayload(serializedPayload: SerializedSession) {
    return new Session(serializedPayload);
  }

  public static async create() {
    return Session.fromPayload(await this.#storage.create());
  }

  public static async get(id: string) {
    const payload = await this.#storage.get(id);
    return payload ? Session.fromPayload(payload) : null;
  }

  public async extendValidity() {
    this.#internal.expiry = new Date(
      Date.now() +
        (this.user ? LOGGED_IN_SESSION_TTL : LOGGED_OUT_SESSION_TTL) * 1000
    );
    // setting the session in the storage will reset the TTL
    await Session.#storage.set(this.#internal);
  }

  public getCookie(): ResponseCookie {
    return {
      name: SESSION_COOKIE_KEY,
      value: `${this.#internal.id}.${this.#internal.signature}`,
      expires: this.#internal.expiry,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" ? true : undefined,
    };
  }

  async regenerateForUser(user: User): Promise<this> {
    this.#internal = await Session.#storage.regenerateForUser(
      user,
      this.#internal
    );
    return this;
  }

  async invalidate(): Promise<this> {
    this.#internal = await Session.#storage.invalidate(this.#internal);
    return this;
  }

  async addFlash(flash: SessionFlash): Promise<this> {
    this.#internal = await Session.#storage.addFlash(
      `${this.#internal.id}.${this.#internal.signature}`,
      flash.type,
      flash.message
    );

    return this;
  }

  async getFlash(): Promise<Array<SessionFlash>> {
    const { session, flashes } = await Session.#storage.getFlash(
      `${this.#internal.id}.${this.#internal.signature}`
    );

    this.#internal = session;

    if (!flashes) return [];

    const flash = Object.entries(flashes).map(
      ([key, value]) =>
        ({
          type: key,
          message: value,
        } as SessionFlash)
    );

    return flash;
  }

  async addData(data: Record<string, any>): Promise<this> {
    for (const key in data) {
      if (!this.#internal.additionnalData) {
        this.#internal.additionnalData = {};
      }
      this.#internal.additionnalData[key] = data[key];
    }

    await Session.#storage.set(this.#internal);
    return this;
  }

  async getData() {
    return this.#internal.additionnalData;
  }

  async popData() {
    const data = this.#internal.additionnalData;

    // remove data
    this.#internal.additionnalData = null;
    await Session.#storage.set(this.#internal);

    return data;
  }

  get user() {
    return this.#internal.user;
  }
}
