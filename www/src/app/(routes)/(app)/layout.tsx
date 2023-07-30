// components
import { Footer } from "~/app/(components)/footer";
import { Header } from "~/app/(components)/header";
import { clsx } from "~/lib/shared-utils";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        path="/"
        pageTitle={
          <>
            <span
              className={clsx(
                "font-medium text-grey",
                "md:text-foreground md:font-normal"
              )}
            >
              Fredkiss3&nbsp;&nbsp;/
            </span>

            <strong className="font-bold whitespace-nowrap">gh-next</strong>
          </>
        }
      />
      <main className={clsx("my-5 max-w-[1270px] mx-auto", "md:my-6")}>
        {children}
      </main>
      <Footer />
    </>
  );
}
