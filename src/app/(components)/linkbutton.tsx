import * as React from "react";
// components
import Link from "next/link";

// utils
import { clsx } from "~/lib/functions";

// types
import type { Route } from "next";

export type LinkButtonProps = {
  renderLeadingIcon?: (classNames: string) => JSX.Element;
  renderTrailingIcon?: (classNames: string) => JSX.Element;
  disabled?: boolean;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "invisible" | "ghost";
  loadingMessage?: string;
  isSquared?: boolean;
  className?: string;
  isLoading?: boolean;
  isBlock?: boolean;
  href: Route;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function Button(
    {
      children,
      renderTrailingIcon,
      renderLeadingIcon,
      className,
      loadingMessage = "Chargement, veuillez patientez...",
      isLoading = false,
      disabled = false,
      isSquared = false,
      isBlock = false,
      variant = `primary`,
      href,
      ...buttonProps
    },
    ref
  ) {
    return (
      <Link
        href={href}
        ref={ref}
        className={clsx(
          className,
          "items-center justify-center gap-2 ",
          "rounded-md border-2 font-medium outline-accent border-gray-900/10",
          "transition duration-150",
          {
            "inline-flex": !isBlock,
            flex: isBlock,
            "focus-visible:outline focus-visible:-outline-offset-2":
              !isLoading && !disabled,
            "focus:outline focus:-outline-offset-2": !isLoading && !disabled,
            "[&[aria-pressed=true]]:outline [&[aria-pressed=true]]:-outline-offset-2":
              !isLoading && !disabled,
            "focus-visible:shadow-inset focus:shadow-inset [&[aria-pressed=true]]:shadow-inset":
              !isLoading && !disabled && variant === "primary",
            "p-1.5": isSquared,
            "py-1 px-3": !isSquared,
            "cursor-default": isLoading || disabled,
            "bg-success text-white shadow-subtle": variant === "primary",
            "bg-subtle text-danger hover:bg-danger hover:text-white":
              variant === "danger",
            "bg-transparent text-grey border-neutral hover:bg-subtle !border":
              variant === "invisible",
            "bg-ghost text-foreground/70 hover:border-grey border-neutral !border shadow-sm":
              variant === "ghost",
            "bg-subtle text-accent hover:bg-accent hover:text-white":
              variant === "secondary",
          }
        )}
        {...buttonProps}
      >
        {renderLeadingIcon && renderLeadingIcon("h-4 w-4 flex-shrink-0")}
        {children}
        {renderTrailingIcon && renderTrailingIcon("h-4 w-4 flex-shrink-0")}
      </Link>
    );
  }
);
