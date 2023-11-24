import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

export function SkipToMainButton() {
  return (
    <a
      className={clsx(
        "sr-only focus:not-sr-only text-white bg-accent",
        "focus:px-6 focus:py-4 outline-none focus:inline-flex",
        "focus:fixed focus:top-0 focus:left-0 focus:z-50",
        "focus:ring-accent/80 focus:ring-2"
      )}
      href="#main-content"
    >
      Skip to content
    </a>
  );
}
