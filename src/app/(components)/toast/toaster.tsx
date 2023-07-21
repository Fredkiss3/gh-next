import * as React from "react";

// utils
import { getSession } from "~/app/(actions)/auth";
import { Toast } from ".";

export async function Toaster() {
  const flashes = await getSession().then((session) => session.getFlash());
  console.log({
    flashes,
  });

  return (
    <>
      {flashes.length > 0 && (
        <ul className="flex flex-col gap-2 fixed bottom-10 right-10">
          {flashes.map((flash, index) => (
            <Toast
              type={flash.type}
              key={flash.type}
              delay={index * 500}
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
