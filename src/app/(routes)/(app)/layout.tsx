// components
import { Footer } from "~/app/(components)/footer";
import { Header } from "~/app/(components)/header";
import { clsx } from "~/lib/shared/utils.shared";

export default async function AppLayout({
  children,
  header_subnav,
  page_title
}: {
  children: React.ReactNode;
  header_subnav: React.ReactNode;
  page_title: React.ReactNode;
}) {
  return (
    <>
      <Header pageTitle={page_title}>{header_subnav}</Header>
      <main
        id="main-content"
        className={clsx("mx-auto my-5 max-w-[1270px]", "md:my-6")}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
