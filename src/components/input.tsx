import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";
import { LoadingIndicator } from "./loading-indicator";
import { AlertFillIcon, CheckCircleFillIcon } from "@primer/octicons-react";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "defaultValue" | "value" | "name"
> & {
  label: React.ReactNode;
  defaultValue?: string | number | ReadonlyArray<string> | undefined | null;
  value?: string | number | ReadonlyArray<string> | undefined | null;
  inputClassName?: string;
  helpText?: string;
  name: string;
  renderLeadingIcon?: (classNames: string) => JSX.Element;
  renderTrailingIcon?: (classNames: string) => JSX.Element;
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  validationText?: React.ReactNode;
  validationStatus?: "error" | "success";
  hideLabel?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      className,
      validationText,
      validationStatus,
      helpText,
      inputClassName,
      hideLabel = false,
      renderLeadingIcon,
      renderTrailingIcon,
      required = false,
      autoComplete = "off",
      type = "text",
      size = "medium",
      isLoading,
      id: defaultId,
      disabled = false,
      ...otherProps
    },
    ref
  ) {
    const id = React.useId();
    const validationId = React.useId();
    const helpId = React.useId();

    return (
      <div className={clsx("flex w-full flex-col gap-1", className)}>
        <label
          htmlFor={defaultId ?? id}
          className={clsx("font-semibold", {
            "sr-only": hideLabel
          })}
        >
          {label}
          {required && (
            <span aria-label="this field is required" className="text-danger">
              *
            </span>
          )}
        </label>

        <div
          className={clsx(
            className,
            "flex w-full items-center gap-2 rounded-md border px-3",
            "bg-background shadow-sm focus-within:border",
            "ring-accent focus-within:border-accent focus-within:ring-1",
            {
              "border-neutral": !validationStatus,
              "border-danger": validationStatus === "error",
              "border-success": validationStatus === "success",
              "py-1.5": size === "medium",
              "py-1 text-sm": size === "small",
              "py-3": size === "large",
              "cursor-not-allowed bg-disabled": disabled
            }
          )}
        >
          {renderLeadingIcon?.(
            clsx("text-gray-500 flex-shrink-0", {
              "h-4 w-4": size === "small",
              "h-5 w-5": size === "medium"
            })
          )}

          {/* @ts-expect-error defaultValue also works with `null` but TS does not work */}
          <input
            {...otherProps}
            ref={ref}
            aria-describedby={`${validationId} ${helpId}`}
            id={defaultId ?? id}
            autoComplete={autoComplete}
            aria-invalid={validationStatus === "error"}
            type={type}
            disabled={disabled}
            required={required}
            className={clsx(
              "w-full bg-transparent focus:outline-none disabled:text-foreground/30 text-sm",
              inputClassName,
              {
                "cursor-not-allowed": disabled
              }
            )}
          />

          {isLoading ? (
            <LoadingIndicator
              className={clsx("pointer-events-none flex-shrink-0 text-grey", {
                "h-4 w-4": size === "small",
                "h-5 w-5": size === "medium"
              })}
            />
          ) : (
            renderTrailingIcon?.(
              clsx("text-grey flex-shrink-0", {
                "h-4 w-4": size === "small",
                "h-5 w-5": size === "medium"
              })
            )
          )}
        </div>

        {validationStatus && (
          <small
            id={validationId}
            aria-live="assertive"
            role="alert"
            className={clsx("flex gap-1", {
              "text-danger": validationStatus === "error",
              "text-success": validationStatus === "success"
            })}
          >
            {validationStatus === "error" && (
              <AlertFillIcon className="h-4 w-4" />
            )}
            {validationStatus === "success" && (
              <CheckCircleFillIcon className="h-4 w-4" />
            )}
            {validationText}
          </small>
        )}

        {helpText && (
          <small id={helpId} className="text-grey">
            {helpText}
          </small>
        )}
      </div>
    );
  }
);
