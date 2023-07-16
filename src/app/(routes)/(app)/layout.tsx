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
      <main className="p-4">{children}</main>
      <Footer />
    </>
  );
}
