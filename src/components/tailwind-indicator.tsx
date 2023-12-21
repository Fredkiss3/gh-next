"use client";
import * as React from "react";

export function TailwindIndicator() {
  const [mediaSize, setMediaSize] = React.useState(0);
  React.useEffect(() => {
    const listener = () => setMediaSize(window.innerWidth);
    window.addEventListener("resize", listener);

    listener();
    return () => {
      window.removeEventListener("resize", listener);
    };
  }, []);

  return (
    <div className="fixed bottom-5 left-5 z-50 flex h-6 items-center justify-center gap-2 rounded-full bg-accent p-3 font-mono text-xs text-white">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="xxl:hidden hidden 2xl:block">2xl</div>| {mediaSize}px
    </div>
  );
}
