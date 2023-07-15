"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

export type FormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "action" | "onSubmit"
>;

type SubmissionCallbacks<T> = {
  onSettled?: (arg: T) => Promise<void> | void;
  onSubmit?: (formData?: FormData) => Promise<void> | void;
};

type InternalFormProps<T> = {
  action: (formData?: FormData) => Promise<T>;
  startTransition: React.TransitionStartFunction;
} & SubmissionCallbacks<T> &
  FormProps;

function InternalForm<T>({
  action,
  children,
  startTransition,
  onSettled,
  onSubmit,
  ...restProps
}: InternalFormProps<T>) {
  const router = useRouter();

  return (
    <form
      action={action}
      onSubmit={(e) => {
        onSubmit?.(new FormData(e.currentTarget));

        e.preventDefault();

        // FIXME: until this issue is fixed : https://github.com/vercel/next.js/issues/52075
        // once this is fixed, we would have not need to update the page
        startTransition(() =>
          action().then((returnedValue) => {
            router.refresh();
            onSettled?.(returnedValue);
          })
        );
      }}
      {...restProps}
    >
      {children}
    </form>
  );
}

/**
 * hook to have a progressively enhanced but client form
 * @example
 *
 * const Comp = () => {
 *  const [Form, isPending] = useForm(action, {
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
 *      <button type="submit">Submit</button>
 *    </Form>
 *  );
 *};
 *
 * @param action the server (or client) action to run
 * @param callbacks callbacks to run after the execution of the action
 */
export function useForm<T extends unknown>(
  action: (formData?: FormData) => Promise<T>,
  callbacks?: SubmissionCallbacks<T>
) {
  const [isPending, startTransition] = React.useTransition();

  const Form = React.useMemo(
    () =>
      function Form(props: FormProps) {
        return (
          <InternalForm
            action={action}
            {...props}
            startTransition={startTransition}
            onSettled={callbacks?.onSettled}
            onSubmit={callbacks?.onSubmit}
          />
        );
      },
    [action, callbacks?.onSettled, callbacks?.onSubmit]
  );

  return [Form, isPending] as const;
}
