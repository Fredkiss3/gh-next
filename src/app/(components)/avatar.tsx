import * as React from "react";
import Image from "next/image";
import { clsx } from "~/lib/shared/utils.shared";

export type AvatarProps = {
  username: string;
  src: string;
  className?: string;
  size?: "small" | "medium" | "large";
};

export function Avatar({
  username,
  className,
  src,
  size = "medium"
}: AvatarProps) {
  return (
    <Image
      src={src}
      alt={`@${username}`}
      className={clsx(className, "flex-shrink-0 rounded-full", {
        "h-6 w-6": size === "small",
        "h-16 w-16": size === "large",
        "h-10 w-10": size === "medium"
      })}
      width={size === "small" ? 64 : 128}
      height={size === "small" ? 64 : 128}
    />
  );
}
