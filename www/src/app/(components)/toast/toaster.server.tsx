import * as React from "react";

// utils
import { getSession } from "~/app/(actions)/auth";
import { ToasterClient } from "./toaster.client";
import { headers } from "next/headers";

export async function Toaster() {
  const method = headers().get('x-method');
  // ignore HEAD requests because 
  // next use them for redirects
  if(method === 'HEAD') return null;

  const flashes = await getSession().then((session) => session.getFlash());

  return (
    <ToasterClient
      flashes={flashes.map((flash, index) => ({
        ...flash,
        id: Math.random().toString(),
        delay: index * 500,
      }))}
    />
  );
}
