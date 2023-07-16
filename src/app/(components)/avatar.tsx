import * as React from "react";
import Image from "next/image";
import { clsx } from "~/lib/functions";

export type AvatarProps = {
  username: string;
  src: string;
  className?: string;
  size?: "small" | "large";
};

export function Avatar({
  username,
  className,
  src,
  size = "small",
}: AvatarProps) {
  return (
    <Image
      src={src}
      alt={`@${username}`}
      className={clsx(className, "rounded-full flex-shrink-0", {
        "h-8 w-8": size === "small",
        "h-16 w-16": size === "large",
      })}
      width={size === "small" ? 64 : 128}
      height={size === "small" ? 64 : 128}
    />
  );
}
