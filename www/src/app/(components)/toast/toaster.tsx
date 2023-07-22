import * as React from "react";

// utils
import { getSession } from "~/app/(actions)/auth";
import { ToasterClient } from "./toaster-client";

export async function Toaster() {
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
