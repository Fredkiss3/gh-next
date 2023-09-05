import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";
import { AlertFillIcon, CheckCircleFillIcon } from "@primer/octicons-react";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLTextAreaElement>,
  "size"
> & {
  label: React.ReactNode;
  name: string;
  inputClassName?: string;
  helpText?: string;
  renderLeadingIcon?: (classNames: string) => JSX.Element;
  renderTrailingIcon?: (classNames: string) => JSX.Element;
  size?: "small" | "medium" | "large";
  validationText?: string;
  validationStatus?: "error" | "success";
  hideLabel?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, InputProps>(
  function Textarea(
    {
      onChange,
      name,
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
      <div className={clsx(className, "flex w-full flex-col gap-1")}>
        <label
          htmlFor={defaultId ?? id}
          className={clsx({
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
            "flex w-full items-center gap-2 rounded-md border",
            "bg-white shadow-sm focus-within:border",
            "ring-accent focus-within:border-accent focus-within:ring-1",
            {
              "border-gray-300": !validationStatus,
              "border-danger": validationStatus === "error",
              "border-success": validationStatus === "success",

              "cursor-not-allowed bg-gray-200": disabled
            }
          )}
        >
          {renderLeadingIcon?.("h-5 w-5 text-gray-500 flex-shrink-0")}

          <textarea
            {...otherProps}
            ref={ref}
            aria-describedby={`${validationId} ${helpId}`}
            id={defaultId ?? id}
            autoComplete={autoComplete}
            aria-invalid={validationStatus === "error"}
            disabled={disabled}
            required={required}
            className={clsx(
              "w-full bg-transparent px-3 focus:outline-none",
              inputClassName,
              {
                "py-1": size === "medium",
                "py-0": size === "small",
                "py-2": size === "large"
              }
            )}
          />

          {renderTrailingIcon?.("h-5 w-5 text-gray-500 flex-shrink-0")}
        </div>

        {validationStatus && (
          <small
            id={validationId}
            aria-live={"assertive"}
            role={"alert"}
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
          <small id={helpId} className="text-gray-400">
            {helpText}
          </small>
        )}
      </div>
    );
  }
);
