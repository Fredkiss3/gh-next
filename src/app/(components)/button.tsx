import * as React from "react";

// components
import Link from "next/link";
import { LoadingIndicator } from "./loading-indicator";
import { ReactAriaButton } from "./react-aria-button";

// utils
import { clsx } from "~/lib/shared/utils.shared";

// types
export type CommonButtonProps = {
  renderLeadingIcon?: (classNames: string) => JSX.Element;
  renderTrailingIcon?: (classNames: string) => JSX.Element;
  variant?:
    | "primary"
    | "secondary"
    | "accent-ghost"
    | "ghost"
    | "danger"
    | "invisible"
    | "subtle";
  isSquared?: boolean;
  isBlock?: boolean;
};

export type BaseButtonProps = {
  loadingMessage?: string;
  isLoading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export type LinkButtonProps = {
  href: string;
  prefetch?: boolean;
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

  // we check disabled here because we want to apply a different styling
  const isDisabled =
    ("disabled" in restProps && restProps["disabled"] === true) ||
    ("aria-disabled" in restProps && restProps["aria-disabled"] === true);

  const commonClasses = clsx(
    "items-center justify-center gap-2 text-sm",
    "rounded-md border-2 font-medium outline-accent border-gray-900/10",
    "transition duration-150",
    "disabled:opacity-50 focus-visible:outline-none",
    {
      "inline-flex": !isBlock,
      flex: isBlock,
      "p-1.5": isSquared,
      "py-1.5 px-3": !isSquared,
      "bg-success text-white shadow-subtle": variant === "primary",
      "bg-subtle text-danger border-neutral": variant === "danger",
      "hover:bg-danger hover:text-white hover:border-danger aria-[current]:bg-danger aria-[current]:text-white aria-[current]:border-danger":
        variant === "danger" && !isDisabled,
      "bg-transparent text-grey border-neutral border": variant === "invisible",
      "hover:bg-subtle hover:border-grey aria-[current]:bg-subtle aria-[current]:border-grey focus-visible:ring-2 focus-visible:ring-accent focus:ring-2 focus:ring-accent":
        variant === "invisible" && !isDisabled,
      "bg-ghost text-foreground/70 border-neutral border shadow-sm":
        variant === "subtle",
      "hover:border-grey aria-[current]:border-grey":
        variant === "subtle" && !isDisabled,
      "bg-subtle text-accent border-neutral": variant === "secondary",
      "hover:bg-accent hover:text-white hover:border-accent aria-[current]:bg-accent aria-[current]:text-white aria-[current]:border-accent":
        variant === "secondary" && !isDisabled,
      "text-accent border-transparent border": variant === "accent-ghost",
      "text-grey": variant === "accent-ghost" && isDisabled,
      " hover:border-grey focus:border-transparent focus-visible:border-transparent focus:!ring-2 focus:ring-accent focus-visible:ring-accent aria-[current]:bg-accent aria-[current]:text-white aria-[current]:border-accent":
        variant === "accent-ghost" && !isDisabled,
      "!border text-foreground": variant === "ghost",
      "hover:border-neutral focus:border-neutral focus-visible:border-accent focus-visible:!border-2 focus-visible:outline-none":
        variant === "ghost" && !isDisabled,
      "aria-[current]:bg-accent aria-[current]:text-white aria-[current]:border-accent":
        variant === "ghost" && !isDisabled
    },
    className
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
        {renderLeadingIcon?.("h-4 w-4 flex-shrink-0")}
        {children}
        {renderTrailingIcon?.("h-4 w-4 flex-shrink-0")}
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
      // @ts-expect-error formAction is defined, but react aria don't take it as an argument
      <ReactAriaButton
        ref={ref as React.Ref<HTMLButtonElement>}
        isDisabled={disabled || isLoading}
        className={clsx(commonClasses, {
          "focus-visible:outline focus-visible:-outline-offset-2":
            !isLoading && !disabled,
          "focus:outline focus:-outline-offset-2": !isLoading && !disabled,
          "[&[aria-pressed=true]]:outline [&[aria-pressed=true]]:-outline-offset-2":
            !isLoading && !disabled,
          "focus:shadow-inset focus-visible:shadow-inset [&[aria-pressed=true]]:shadow-inset":
            !isLoading && !disabled && variant === "primary",
          "cursor-default": isLoading,
          "cursor-not-allowed": disabled
        })}
        {...buttonProps}
      >
        <span className="sr-only" aria-live="assertive">
          {isLoading ? loadingMessage : ""}
        </span>
        {isLoading && <LoadingIndicator className="h-4 w-4 flex-shrink-0" />}
        {!isLoading && renderLeadingIcon?.("h-4 w-4 flex-shrink-0")}
        {children}
        {renderTrailingIcon?.("h-4 w-4 flex-shrink-0")}
      </ReactAriaButton>
    );
  }

  throw new Error("Invalid call to the component");
});
