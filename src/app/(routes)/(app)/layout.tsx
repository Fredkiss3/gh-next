// components
import { Footer } from "~/app/(components)/footer";
import { Header } from "~/app/(components)/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
