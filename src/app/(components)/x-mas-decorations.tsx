import * as React from "react";

export type XMasDecorationsProps = {};

export function XMasDecorations({}: XMasDecorationsProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none z-20 w-full fixed left-0"
        style={{
          background: "url(/guirlande1.png) repeat-x 300% top",
          top: "-30px",
          height: "120px"
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none z-20 w-full fixed left-0"
        style={{
          background: "url(/guirlande2.png) repeat-x 70% top",
          top: "-90px",
          height: "150px"
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none z-20 w-full fixed left-0"
        style={{
          background: "url(/guirlande1.png) repeat-x 10% top",
          top: "-50px",
          height: "150px"
        }}
      />
    </>
  );
}
