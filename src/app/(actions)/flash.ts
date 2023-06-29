"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { FLASH_COOKIE_KEY } from "~/lib/constants";

const flashSchema = z.object({
  type: z.enum(["success", "error"]),
  message: z.string(),
});

export type Flash = z.infer<typeof flashSchema>;

export async function getFlash() {
  const flashCookie = cookies().get(FLASH_COOKIE_KEY)?.value;
  if (!flashCookie) {
    return null;
  }

  try {
    return flashSchema.parse(JSON.parse(flashCookie));
  } catch (error) {
    // do nothing
    console.error((error as Error).message);
  } finally {
    if (flashCookie) {
      // delete flash cookie on read
      cookies().delete(FLASH_COOKIE_KEY);
    }
  }
  return null;
}

export async function setFlash(message: Flash) {
  cookies().set(FLASH_COOKIE_KEY, JSON.stringify(message));
}
