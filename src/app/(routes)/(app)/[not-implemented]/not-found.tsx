/* eslint-disable @next/next/no-img-element */
import { HomeIcon } from "@primer/octicons-react";
import { Button } from "~/app/(components)/button";

// this is for the next version of next.js
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Segment Not found"
};

export default function Page() {
  return (
    <>
      <section className="flex h-[80vh] flex-col items-center justify-center gap-6 text-foreground">
        <div className="relative flex w-full items-end justify-center gap-4">
          <img
            alt="404 “This is not the web page you are looking for”"
            src="/404-text.png"
            width="271"
            height="249"
            className="z-2 relative bottom-20 right-10"
          />

          <div className="z-2 relative bottom-20 right-10">
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

          <div className="z-1 absolute bottom-24 left-1/2 translate-x-[20%]">
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
          className="inline-flex items-center gap-2 !border-foreground !text-foreground"
          variant="invisible"
        >
          <HomeIcon className="h-4 w-4" />
          Go home
        </Button>
      </section>
    </>
  );
}
