"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import type { UpperLowerCase } from "~/lib/types";

export type FormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "action" | "onSubmit" | "method"
> & {
  method?: UpperLowerCase<"get" | "post">;
};

type SubmissionCallbacks<T> = {
  onSettled?: (arg: T) => Promise<void> | void;
  onSubmit?: (formData?: FormData) => Promise<boolean> | boolean;
};

type InternalFormProps<T> = {
  action?: (() => Promise<T>) | ((formData: FormData) => Promise<T>);
  startTransition: React.TransitionStartFunction;
  formCallbacksRef: React.Ref<{
    requestSubmit: () => void;
  }>;
} & SubmissionCallbacks<T> &
  FormProps;

function InternalForm<T>({
  action,
  children,
  startTransition,
  onSettled,
  onSubmit,
  formCallbacksRef,
  ...restProps
}: InternalFormProps<T>) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();
  const path = usePathname();

  React.useImperativeHandle(
    formCallbacksRef,
    () => {
      return {
        requestSubmit() {
          formRef.current?.requestSubmit();
        },
      };
    },
    []
  );

  return (
    <form
      action={action}
      ref={formRef}
      onSubmit={async (e) => {
        const formData = new FormData(e.currentTarget);
        e.preventDefault();
        const shouldSubmit = onSubmit ? await onSubmit(formData) : true;

        if (shouldSubmit) {
          startTransition(async () => {
            if (action) {
              await action(formData).then((returnedValue) => {
                onSettled?.(returnedValue);
              });
            } else {
              // @ts-expect-error the URLSearchParams constructor supports formData
              const searchParams = new URLSearchParams(formData);
              router.push((path + "?" + searchParams.toString()) as Route);
            }
          });
        }
      }}
      {...restProps}
    >
      {children}
    </form>
  );
}

/**
 * hook to have a progressively enhanced client side form
 * @example
 * // simple form
 * function MyForm() {
 *  const { Form, isPending } = useForm(action, {
 *    onSettled(returnedValue) {
 *      // do something when the action has finished running
 *    },
 *    onSubmit(formData) {
 *      // do something while the form is submitting
 *    }
 *  });
 *
 *  return (
 *    <Form>
 *      <input type="text" name="name" />
 *      <button type="submit" disabled={isPending}>{isPending ? "Submitting..." : "Submit"}</button>
 *    </Form>
 *  );
 * }
 *
 * // search form
 * function SearchForm() {
 *  const { Form, formRef } = useForm();
 *
 *  return (
 *    <Form method="get">
 *      <input type="text" name="search" onChange={() => formRef.current?.requestSubmit()} />
 *    </Form>
 *  );
 *};
 *
 * @param action the server (or client) action to run
 * @param callbacks callbacks to run after the execution of the action
 */
export function useForm<T extends unknown>(
  action?: (() => Promise<T>) | ((formData: FormData) => Promise<T>),
  callbacks?: SubmissionCallbacks<T>
) {
  const [isPending, startTransition] = React.useTransition();

  const onSubmitCallback = React.useCallback(
    (args: any) => callbacks?.onSubmit?.(args) ?? true,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const onSettledCallback = React.useCallback(
    (args: any) => callbacks?.onSettled?.(args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const ref = React.useRef<{
    requestSubmit: () => void;
  }>(null);

  const Form = React.useMemo(
    () =>
      function Form(props: FormProps) {
        return (
          <InternalForm
            formCallbacksRef={ref}
            action={action}
            startTransition={startTransition}
            onSettled={onSettledCallback}
            onSubmit={onSubmitCallback}
            {...props}
          />
        );
      },
    [action, onSettledCallback, onSubmitCallback]
  );

  return {
    Form,
    isPending,
    formRef: ref,
  } as const;
}
