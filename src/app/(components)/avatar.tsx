import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

export type AvatarProps = {
  username: string;
  src: string;
  className?: string;
  size?: "x-small" | "small" | "medium" | "large";
};

export function Avatar({
  username,
  className,
  src,
  size = "medium"
}: AvatarProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      loading="lazy"
      alt={`@${username}`}
      className={clsx(
        "flex-shrink-0 rounded-full bg-grey/60",
        {
          "h-3.5 w-3.5": size === "x-small",
          "h-5 w-5": size === "small",
          "h-14 w-14": size === "large",
          "h-8 w-8": size === "medium"
        },
        className
      )}
      width={size === "small" ? 64 : 128}
      height={size === "small" ? 64 : 128}
    />
  );
}
