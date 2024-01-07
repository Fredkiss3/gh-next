import { redirect } from "next/navigation";
import { getUserOrRedirect } from "~/actions/auth.action";

export default async function Page() {
  await getUserOrRedirect("/settings/account");
  redirect("/settings/account");
}
