import "server-only";
import { kv } from "~/lib/server/kv/index.server";
import { preprocess, z } from "zod";

import {
  LOGGED_IN_SESSION_TTL,
  SESSION_COOKIE_KEY,
  LOGGED_OUT_SESSION_TTL
} from "~/lib/shared/constants";
import { _envObject as env } from "~/env-config.js";
import { nanoid } from "nanoid";
import { headers } from "next/headers";

import { users } from "~/lib/server/db/schema/user.sql";
import { createSelectSchema } from "drizzle-zod";

import type { User } from "~/lib/server/db/schema/user.sql";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const sessionSchema = z.object({
  id: z.string(),
  expiry: preprocess((arg) => new Date(arg as any), z.date()),
  user: createSelectSchema(users)
    .pick({
      id: true,
      preferred_theme: true,
      github_id: true
    })
    .nullish(),
  flashMessages: z
    .record(z.enum(["success", "error", "info", "warning"]), z.string())
    .optional(),
  signature: z.string(),
  additionnalData: z.record(z.string(), z.any()).nullish(),
  bot: z.boolean().optional().default(false)
});

export type SerializedSession = z.TypeOf<typeof sessionSchema>;

type DefinedSession = Required<SerializedSession>;
type DefinedSessionKeys = keyof DefinedSession["flashMessages"];

export type SessionFlash = {
  type: DefinedSessionKeys;
  message: Required<DefinedSession["flashMessages"]>[DefinedSessionKeys];
};

export class Session {
  #_session: SerializedSession;

  public static async get(signedSessionId: string) {
    try {
      const verifiedSessionId = await this.#verifySessionId(signedSessionId);

      const sessionObject = await kv.get(`session:${verifiedSessionId}`);
      if (sessionObject) {
        return this.#fromPayload(sessionSchema.parse(sessionObject));
      } else {
        return null;
      }
    } catch (error) {
      // In case of invalid Session ID, instruct the middleware to create a new one
      return null;
    }
  }

  private constructor(serializedPayload: SerializedSession) {
    this.#_session = serializedPayload;
  }

  static #fromPayload(serializedPayload: SerializedSession) {
    return new Session(serializedPayload);
  }

  public static async create(isBot = false) {
    return Session.#fromPayload(
      await Session.#create({
        isBot
      })
    );
  }

  public async extendValidity() {
    this.#_session.expiry = new Date(
      Date.now() +
        (this.#_session.user ? LOGGED_IN_SESSION_TTL : LOGGED_OUT_SESSION_TTL) *
          1000
    );
    // saving the session in the storage will reset the TTL
    await Session.#save(this.#_session);
  }

  public getCookie(): ResponseCookie {
    const headerStore = headers();
    return {
      name: SESSION_COOKIE_KEY,
      value: `${this.#_session.id}.${this.#_session.signature}`,
      expires: this.#_session.expiry,
      httpOnly: true,
      sameSite: !headerStore.get("Host")?.toString().startsWith("localhost")
        ? "lax"
        : "none",
      // when testing on local, the cookies should not be set to secure
      secure: !headerStore.get("Host")?.toString().startsWith("localhost")
        ? true
        : undefined
    };
  }

  async setUserTheme(theme: User["preferred_theme"]): Promise<this> {
    if (!this.#_session.user) {
      throw new Error("cannot set theme if the user is not set");
    }

    this.#_session.user["preferred_theme"] = theme;
    await Session.#save(this.#_session);
    return this;
  }

  async generateForUser(user: User): Promise<this> {
    // delete the old session
    await Session.#delete(this.#_session);

    // create a new one with a user
    this.#_session = await Session.#create({
      init: {
        flashMessages: this.#_session.flashMessages,
        additionnalData: this.#_session.additionnalData,
        user: {
          id: user.id,
          preferred_theme: user.preferred_theme,
          github_id: user.github_id
        }
      }
    });

    await Session.#save(this.#_session);
    return this;
  }

  public async invalidate(): Promise<this> {
    // delete the old session
    await Session.#delete(this.#_session);

    // create a new one
    this.#_session = await Session.#create({
      init: {
        flashMessages: this.#_session.flashMessages,
        additionnalData: this.#_session.additionnalData
      }
    });

    return this;
  }

  public async addFlash(flash: SessionFlash): Promise<this> {
    if (this.#_session.flashMessages) {
      this.#_session.flashMessages[flash.type] = flash.message;
    } else {
      this.#_session.flashMessages = { [flash.type]: flash.message };
    }

    await Session.#save(this.#_session);
    return this;
  }

  public async getFlash() {
    const flashes = this.#_session.flashMessages;

    if (!flashes) {
      return [];
    }

    // delete flashes
    this.#_session.flashMessages = {};
    await Session.#save(this.#_session);

    const flash = Object.entries(flashes).map(
      ([key, value]) =>
        ({
          type: key,
          message: value
        }) as SessionFlash
    );

    return flash;
  }

  public async addAdditionnalData(data: Record<string, any>): Promise<this> {
    for (const key in data) {
      if (!this.#_session.additionnalData) {
        this.#_session.additionnalData = {};
      }
      this.#_session.additionnalData[key] = data[key];
    }

    await Session.#save(this.#_session);
    return this;
  }

  public async popAdditionnalData() {
    const data = this.#_session.additionnalData;

    // remove data
    this.#_session.additionnalData = null;
    await Session.#save(this.#_session);

    return data;
  }

  public get user() {
    return this.#_session.user;
  }

  /***********************************/
  /*        PRIVATE METHODS          */
  /***********************************/

  static async #create(options?: {
    init?: Pick<
      SerializedSession,
      "flashMessages" | "additionnalData" | "user"
    >;
    isBot?: boolean;
  }) {
    const { sessionId, signature } = await Session.#generateSessionId();

    const sessionObject = {
      id: sessionId,
      expiry: options?.isBot
        ? new Date(Date.now() + 5 * 1000) // only five seconds for temporary session
        : options?.init?.user
        ? new Date(Date.now() + LOGGED_IN_SESSION_TTL * 1000)
        : new Date(Date.now() + LOGGED_OUT_SESSION_TTL * 1000),
      signature,
      flashMessages: options?.init?.flashMessages,
      additionnalData: options?.init?.additionnalData,
      bot: Boolean(options?.isBot),
      user: options?.init?.user
    } satisfies SerializedSession;

    await Session.#save(sessionObject);
    return sessionObject;
  }

  static async #save(session: SerializedSession) {
    await Session.#verifySessionId(`${session.id}.${session.signature}`);

    // don't store expiry as a date, but a timestamp instead
    const expiry = session.expiry.getTime();

    let sessionTTL = session.user
      ? LOGGED_IN_SESSION_TTL
      : LOGGED_OUT_SESSION_TTL;
    if (session.bot) {
      sessionTTL = 5; // only 5 seconds for bot sessions
    }

    await kv.set(`session:${session.id}`, { ...session, expiry }, sessionTTL);
  }

  static async #delete(session: SerializedSession) {
    const verifiedSessionId = await Session.#verifySessionId(
      `${session.id}.${session.signature}`
    );
    await kv.delete(`session:${verifiedSessionId}`);
  }

  static #arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  static async #sign(data: string, secret: string) {
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

  static async #generateSessionId() {
    const sessionId = nanoid();
    const signature = await this.#sign(sessionId, env.SESSION_SECRET);
    return {
      sessionId,
      signature
    };
  }

  static async #verifySessionId(signedSessionId: string) {
    const [sessionId, signature] = signedSessionId.split(".");
    const expectedSignature = await this.#sign(sessionId, env.SESSION_SECRET);
    if (signature === expectedSignature) {
      return sessionId;
    } else {
      throw new Error("Invalid session ID");
    }
  }
}
