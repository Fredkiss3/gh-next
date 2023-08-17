"use client";
import * as React from "react";

// components
import { Button } from "./button";

// utils
import { experimental_useFormStatus as useFormStatus } from "react-dom";
// types
import type { BaseButtonProps, CommonButtonProps } from "./button";
export type SubmitButtonProps = CommonButtonProps &
  Omit<BaseButtonProps, "type" | "isLoading"> & {
    loadingText?: React.ReactNode;
  };

export function SubmitButton(props: SubmitButtonProps) {
  const status = useFormStatus();

  const { loadingText, ...restProps } = props;
  return (
    <Button {...restProps} type="submit" isLoading={status.pending}>
      {status.pending && loadingText ? loadingText : props.children}
    </Button>
  );
}
