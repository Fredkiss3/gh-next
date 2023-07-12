"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "~/app/(actions)/auth";
import { Button } from "~/app/(components)/button";

export function LogoutForm() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  return (
    <>
      <form
        action={logoutUser}
        onSubmit={(e) => {
          e.preventDefault();
          // FIXME: until this issue is fixed : https://github.com/vercel/next.js/issues/52075
          startTransition(
            () =>
              void logoutUser().then(() => {
                router.refresh();
              })
          );
        }}
      >
        <Button variant="danger">
          {isPending ? "Logging out..." : "Logout"}
        </Button>
      </form>
    </>
  );
}
