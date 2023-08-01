/* eslint-disable @next/next/no-img-element */
import { HomeIcon } from "@primer/octicons-react";
import { Button } from "~/app/(components)/button";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Page not found - Fredkiss3/gh-next",
};

export default function Page() {
  return (
    <>
      <section className="h-screen flex flex-col gap-6 items-center justify-center text-foreground">
        <div className="flex items-end gap-4 relative justify-center w-full">
          <img
            alt="404 “This is not the web page you are looking for”"
            src="/404-text.png"
            width="271"
            height="249"
            className="relative z-2 lg:bottom-20 lg:right-10"
          />

          <div className="relative z-2 bottom-20 right-10 hidden lg:block">
            <img
              alt=""
              src="/octostar.png"
              width="188"
              height="230"
              className="relative z-10"
            />

            <img
              alt=""
              src="/octoshadow.png"
              width="166"
              height="49"
              className="absolute -bottom-5 left-3"
            />
          </div>

          <div className="absolute z-1 bottom-24 left-1/2 translate-x-[20%] hidden lg:block">
            <img
              alt=""
              src="/spaceship.png"
              width="440"
              height="156"
              className="relative z-10"
            />
            <img
              alt=""
              src="/spaceship-shadow.png"
              width="430"
              height="75"
              className="absolute -bottom-8 left-3"
            />
          </div>
        </div>

        <Button
          href="/"
          className="inline-flex gap-2 items-center !text-foreground !border-foreground"
          variant="invisible"
        >
          <HomeIcon className="h-4 w-4" />
          Go home
        </Button>
      </section>
    </>
  );
}
