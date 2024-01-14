import { getUserOrRedirect } from "~/actions/auth.action";

export default async function SessionsPage() {
  const user = await getUserOrRedirect("/settings/sessions");
  return <></>;
}
