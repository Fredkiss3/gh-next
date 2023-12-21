"use client";

import * as React from "react";
import type { Theme } from "~/app/(actions)/theme";

function updateIcons(theme: Theme) {
  const userDefinedTheme = document.documentElement.dataset.theme !== "system";
  if (!userDefinedTheme) {
    const icons = document.querySelectorAll(
      "[data-favicon]"
    ) as NodeListOf<HTMLLinkElement>;
    icons.forEach((icon) => {
      const ext = icon.type === "image/svg+xml" ? "svg" : "png";
      icon.href = theme === "dark" ? `/favicon-dark.${ext}` : `/favicon.${ext}`;
    });
  }
}

export function IconSwitcher() {
  React.useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    updateIcons(darkQuery.matches ? "dark" : "light");
    const listenToDarkQuery = (e: MediaQueryListEvent) =>
      updateIcons(e.matches ? "dark" : "light");

    darkQuery.addEventListener("change", listenToDarkQuery);
    return () => darkQuery.removeEventListener("change", listenToDarkQuery);
  }, []);
  return null;
}
