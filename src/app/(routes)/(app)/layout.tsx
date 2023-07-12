// components
import { Footer } from "~/app/(components)/footer";
import { Header } from "~/app/(components)/header";
import { Toaster } from "~/app/(components)/toast/toaster";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Toaster />
      <Footer />
    </>
  );
}
