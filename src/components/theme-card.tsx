/* eslint-disable @next/next/no-img-element */
"use client";
import * as React from "react";

// utils
import { clsx } from "~/lib/shared/utils.shared";

export type ThemeCardProps = {
  value: "light" | "dark" | "system";
  defaultSelected: boolean;
};

export function ThemeCard({ value, defaultSelected }: ThemeCardProps) {
  return (
    <label className="relative inline-flex cursor-pointer flex-col items-start">
      {value !== "system" ? (
        <img
          src={clsx({
            "/dark_theme_preview.svg": value === "dark",
            "/light_theme_preview.svg": value === "light"
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

      <div className="flex w-full items-center gap-1 border-t border-neutral p-3">
        <input
          type="radio"
          name="theme"
          className="peer"
          defaultValue={value}
          defaultChecked={defaultSelected}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />

        <div
          className={clsx(
            "after:absolute after:inset-0 after:rounded-md after:border after:border-neutral",
            "peer-checked:after:border-accent"
          )}
        />

        <strong className="capitalize">{value}</strong>
      </div>
    </label>
  );
}
