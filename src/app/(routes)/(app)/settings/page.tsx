import { redirect } from "next/navigation";
import { redirectIfNotAuthed } from "~/app/(actions)/auth.action";

export default async function Page() {
  await redirectIfNotAuthed("/settings/account");
  redirect("/settings/account");
}
