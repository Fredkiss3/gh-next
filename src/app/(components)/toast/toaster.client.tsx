"use client";
import * as React from "react";

// components
import { Toast } from ".";

// types
import type { SessionFlash } from "~/lib/server/session.server";

export type ToasterClientProps = {
  flashes: (SessionFlash & { id: string; delay: number })[];
};

export function ToasterClient({ flashes }: ToasterClientProps) {
  const [allFlashes, setFlashes] = React.useState(flashes);

  React.useEffect(() => {
    // We can safely add the flashes to the state as when
    // flashes will change, it means new flashes are added
    // thoses flashes are guarranted to be new ones
    // the reference stays the same
    setFlashes((oldFlashes) => {
      if (oldFlashes === flashes) return oldFlashes;
      return [...oldFlashes, ...flashes];
    });
  }, [flashes]);

  return (
    <>
      {allFlashes.length > 0 && (
        <ul className="fixed bottom-10 right-10 flex flex-col items-end gap-2">
          {allFlashes.map((flash, index) => (
            <Toast
              type={flash.type}
              key={flash.id}
              delay={flash.delay}
              dismissable
            >
              {flash.message}
            </Toast>
          ))}
        </ul>
      )}
    </>
  );
}
