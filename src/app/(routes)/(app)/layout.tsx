// components
import { Footer } from "~/app/(components)/footer";
import { Header } from "~/app/(components)/header";
import { clsx } from "~/lib/shared/utils.shared";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className={clsx("my-5 max-w-[1270px] mx-auto", "md:my-6")}>
        {children}
      </main>
      <Footer />
    </>
  );
}
