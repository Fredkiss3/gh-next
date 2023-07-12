import { getSession } from "~/app/(actions)/auth";
import { Toaster } from "~/app/(components)/toast/toaster";

export default async function AppLayout({
  children,
  logged_in,
  logged_out,
}: {
  children: React.ReactNode;
  logged_in: React.ReactNode;
  logged_out: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <>
      <>{session?.user ? logged_in : logged_out}</>

      <Toaster />
    </>
  );
}
