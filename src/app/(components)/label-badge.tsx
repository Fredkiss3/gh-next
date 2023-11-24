import * as React from "react";
// utils
import { clsx, hexToRGBHSL } from "~/lib/shared/utils.shared";

// types
import type { RGBHSLColor } from "~/lib/shared/utils.shared";
export type LabelBadgeProps = {
  title: string;
  color: string;
  className?: string;
};

export function LabelBadge({ title, color, className }: LabelBadgeProps) {
  const { r, g, b, h, s, l }: RGBHSLColor = hexToRGBHSL(color) ?? {
    r: 255,
    g: 255,
    b: 255,
    h: 0,
    s: 0,
    l: 0
  };
  return (
    <span
      style={{
        // @ts-expect-error these are css variables and valid, but react complains
        "--label-r": r,
        "--label-g": g,
        "--label-b": b,
        "--label-h": h,
        "--label-s": s,
        "--label-l": l
      }}
      className={clsx(
        "label-badge rounded-full border px-2 text-xs font-normal",
        className
      )}
    >
      {title}
    </span>
  );
}
