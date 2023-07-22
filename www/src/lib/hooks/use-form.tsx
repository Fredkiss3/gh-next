"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";

export type FormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "action" | "onSubmit"
>;

type SubmissionCallbacks<T> = {
  onSettled?: (arg: T) => Promise<void> | void;
  onSubmit?: (formData?: FormData) => Promise<void> | void;
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
      onSubmit={(e) => {
        const formData = new FormData(e.currentTarget);
        onSubmit?.(formData);

        e.preventDefault();

        startTransition(async () => {
          if (action) {
            // FIXME: until this issue is fixed : https://github.com/vercel/next.js/issues/52075
            // once this is fixed, we would have not need to call `router.refresh()` manually
            // or to call the action manually
            await action(formData).then((returnedValue) => {
              router.refresh();
              onSettled?.(returnedValue);
            });
          } else {
            // @ts-expect-error the URLSearchParams constructor supports formData
            const searchParams = new URLSearchParams(formData);
            return router.push((path + "?" + searchParams.toString()) as Route);
          }
        });
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
  action: (() => Promise<T>) | ((formData: FormData) => Promise<T>),
  callbacks?: SubmissionCallbacks<T>
) {
  const [isPending, startTransition] = React.useTransition();
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
            onSettled={callbacks?.onSettled}
            onSubmit={callbacks?.onSubmit}
            {...props}
          />
        );
      },
    [action, callbacks?.onSettled, callbacks?.onSubmit]
  );

  return {
    Form,
    isPending,
    formRef: ref,
  } as const;
}
