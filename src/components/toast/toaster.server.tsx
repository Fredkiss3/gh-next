import * as React from "react";

// utils
import { getSession } from "~/actions/auth.action";
import { ToasterClient } from "./toaster.client";
import { headers } from "next/headers";

export async function Toaster() {
  // ignore HEAD requests because
  // next use them for redirects and rerender the page twice
  if (headers().get("x-method") === "HEAD") return null;

  const flashes = await getSession().then((session) => session.getFlash());

  return (
    <ToasterClient
      flashes={flashes.map((flash, index) => ({
        ...flash,
        id: Math.random().toString(),
        delay: index * 500
      }))}
    />
  );
}
