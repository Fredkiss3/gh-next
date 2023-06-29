import { getUser } from "~/app/(actions)/auth";

export default async function AppLayout({
  children,
  logged_in,
  logged_out,
}: {
  children: React.ReactNode;
  logged_in: React.ReactNode;
  logged_out: React.ReactNode;
}) {
  const user = await getUser();
  return <>{user ? logged_in : logged_out}</>;
}
