import * as React from "react";
import { LoadingIndicator } from "./loading-indicator";
import { clsx } from "~/lib/functions";

export type ButtonProps = {
  renderLeadingIcon?: (classNames: string) => JSX.Element;
  renderTrailingIcon?: (classNames: string) => JSX.Element;
  disabled?: boolean;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "invisible";
  loadingMessage?: string;
  isSquared?: boolean;
  className?: string;
  isLoading?: boolean;
  isBlock?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      renderTrailingIcon,
      renderLeadingIcon,
      className,
      loadingMessage = `Chargement, veuillez patientez...`,
      isLoading = false,
      disabled = false,
      isSquared = false,
      isBlock = false,
      variant = `primary`,
      ...buttonProps
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          className,
          "items-center justify-center gap-2 py-1",
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
            "px-1": isSquared,
            "px-3": !isSquared,
            "cursor-default": isLoading || disabled,
            "bg-success text-white shadow-subtle": variant === "primary",
            "bg-subtle text-danger hover:bg-danger hover:text-white":
              variant === "danger",
            "bg-transparent text-accent border-transparent hover:bg-subtle":
              variant === "invisible",
            "bg-subtle text-accent hover:bg-accent hover:text-white":
              variant === "secondary",
          }
        )}
        {...buttonProps}
      >
        <span className="sr-only" aria-live="assertive">
          {isLoading ? loadingMessage : ""}
        </span>
        {isLoading && <LoadingIndicator className={`h-5 w-5 flex-shrink-0`} />}
        {!isLoading &&
          renderLeadingIcon &&
          renderLeadingIcon(`h-5 w-5 flex-shrink-0`)}
        {children}
        {renderTrailingIcon && renderTrailingIcon(`h-5 w-5 flex-shrink-0`)}
      </button>
    );
  }
);
