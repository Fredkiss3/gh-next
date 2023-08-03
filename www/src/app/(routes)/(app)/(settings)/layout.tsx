// utils
import { redirectIfNotAuthed } from "~/app/(actions)/auth";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectIfNotAuthed("/settings/account");
  return <>{children}</>;
}
