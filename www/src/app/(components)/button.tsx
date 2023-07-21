import * as React from "react";
import { LoadingIndicator } from "./loading-indicator";
import { clsx } from "../../lib/functions";
import Link from "next/link";

import type { Route } from "next";

export type CommonButtonProps = {
  renderLeadingIcon?: (classNames: string) => JSX.Element;
  renderTrailingIcon?: (classNames: string) => JSX.Element;
  variant?: "primary" | "secondary" | "danger" | "invisible" | "ghost";
  isSquared?: boolean;
  isBlock?: boolean;
};

export type BaseButtonProps = {
  loadingMessage?: string;
  isLoading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export type LinkButtonProps = {
  href: Route;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export type ButtonProps = CommonButtonProps &
  (LinkButtonProps | BaseButtonProps);

function isLink(
  props: LinkButtonProps | BaseButtonProps
): props is LinkButtonProps {
  return "href" in props;
}

function isButton(
  props: LinkButtonProps | BaseButtonProps
): props is BaseButtonProps {
  return !("href" in props);
}

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function ButtonOrLink(props, ref) {
  const {
    className,
    renderLeadingIcon,
    renderTrailingIcon,
    isSquared = false,
    isBlock = false,
    variant = "primary",
    ...restProps
  } = props;

  const commonClasses = clsx(
    className,
    "items-center justify-center gap-2 ",
    "rounded-md border-2 font-medium outline-accent border-gray-900/10",
    "transition duration-150",
    {
      "inline-flex": !isBlock,
      flex: isBlock,
      "p-2": isSquared,
      "py-1.5 px-3": !isSquared,
      "bg-success text-white shadow-subtle": variant === "primary",
      "bg-subtle text-danger hover:bg-danger hover:text-white border-neutral":
        variant === "danger",
      "bg-transparent text-grey border-neutral hover:bg-subtle !border hover:border-grey":
        variant === "invisible",
      "bg-ghost text-foreground/70 hover:border-grey border-neutral !border shadow-sm":
        variant === "ghost",
      "bg-subtle text-accent hover:bg-accent hover:text-white":
        variant === "secondary",
    }
  );

  if (isLink(restProps)) {
    const { href, children, ...linkProps } = restProps;

    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={commonClasses}
        {...linkProps}
      >
        {renderLeadingIcon?.("h-5 w-5 flex-shrink-0")}
        {children}
        {renderTrailingIcon?.("h-5 w-5 flex-shrink-0")}
      </Link>
    );
  } else if (isButton(restProps)) {
    const {
      loadingMessage = "Chargement, veuillez patientez...",
      isLoading = false,
      disabled = false,
      children,
      ...buttonProps
    } = restProps;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled || isLoading}
        className={clsx(commonClasses, {
          "focus-visible:outline focus-visible:-outline-offset-2":
            !isLoading && !disabled,
          "focus:outline focus:-outline-offset-2": !isLoading && !disabled,
          "[&[aria-pressed=true]]:outline [&[aria-pressed=true]]:-outline-offset-2":
            !isLoading && !disabled,
          "focus-visible:shadow-inset focus:shadow-inset [&[aria-pressed=true]]:shadow-inset":
            !isLoading && !disabled && variant === "primary",
          "cursor-default": isLoading || disabled,
        })}
        {...buttonProps}
      >
        <span className="sr-only" aria-live="assertive">
          {isLoading ? loadingMessage : ""}
        </span>
        {isLoading && <LoadingIndicator className="h-5 w-5 flex-shrink-0" />}
        {!isLoading && renderLeadingIcon?.("h-5 w-5 flex-shrink-0")}
        {children}
        {renderTrailingIcon?.("h-5 w-5 flex-shrink-0")}
      </button>
    );
  }

  throw new Error("Invalid call to the component");
});
