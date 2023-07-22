/* eslint-disable @next/next/no-img-element */
"use client";
import * as React from "react";

// utils
import { clsx } from "~/lib/functions";

export type ThemeCardProps = {
  value: "light" | "dark" | "system";
  defaultSelected: boolean;
};

export function ThemeCard({ value, defaultSelected }: ThemeCardProps) {
  return (
    <label className="inline-flex flex-col items-start relative cursor-pointer">
      {value !== "system" ? (
        <img
          src={clsx({
            "/dark_theme_preview.svg": value === "dark",
            "/light_theme_preview.svg": value === "light",
          })}
          className="rounded-t-md"
          alt={`theme ${value}`}
        />
      ) : (
        <picture>
          <source
            media="(prefers-color-scheme: dark)"
            srcSet="/dark_theme_preview.svg"
            className="rounded-t-md"
          />
          <source
            media="(prefers-color-scheme: light)"
            srcSet="/light_theme_preview.svg"
            className="rounded-t-md"
          />
          <img
            src="/light_theme_preview.svg"
            alt="system theme"
            className="rounded-t-md"
          />
        </picture>
      )}

      <div className="p-3 flex items-center gap-1 border-t border-neutral w-full">
        <input
          type="radio"
          name="theme"
          className="peer"
          value={value}
          defaultChecked={defaultSelected}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />

        <div
          className={clsx(
            "after:absolute after:border after:border-neutral after:rounded-md after:inset-0",
            "peer-checked:after:border-accent"
          )}
        />

        <strong className="capitalize">{value}</strong>
      </div>
    </label>
  );
}
