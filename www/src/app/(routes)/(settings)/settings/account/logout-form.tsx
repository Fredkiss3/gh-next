"use client";
import * as React from "react";
import { logoutUser } from "~/app/(actions)/auth";
import { Button } from "~/app/(components)/button";
import { useForm } from "~/lib/hooks/use-form";

export function LogoutForm() {
  const { Form, isPending } = useForm(logoutUser);

  return (
    <Form>
      <Button variant="danger">
        {isPending ? "Logging out..." : "Logout"}
      </Button>
    </Form>
  );
}
