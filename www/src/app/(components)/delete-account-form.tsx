"use client";

import * as React from "react";
import { Button } from "./button";
import { useForm } from "~/lib/hooks/use-form";

export type DeleteAccountFormProps = {};
// TODO : LATER
export function DeleteAccountForm({}: DeleteAccountFormProps) {
  //   const { Form } = useForm();
  return (
    <form className="flex flex-col gap-4 items-stretch md:items-start">
      <Button variant="danger" disabled>
        Delete your account
      </Button>

      <small className="text-grey">Unavailable at the moment</small>
    </form>
  );
}
