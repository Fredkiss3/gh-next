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
      <main className="px-8 my-6 max-w-[1270px] mx-auto">{children}</main>
      <Footer />
    </>
  );
}
