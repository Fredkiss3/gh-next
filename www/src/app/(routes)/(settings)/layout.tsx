// components
import { Avatar } from "~/app/(components)/avatar";
import { Footer } from "~/app/(components)/footer";
import { Header } from "~/app/(components)/header";
import { VerticalNavlist } from "~/app/(components)/vertical-navlist";

// utils
import { getUserOrRedirect } from "~/app/(actions)/auth";
import { clsx } from "~/lib/shared-utils";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserOrRedirect("/settings/account");
  return (
    <>
      <Header
        path="/settings"
        hideRepoNavbar
        pageTitle={
          <>
            <strong className="font-bold whitespace-nowrap">Settings</strong>
          </>
        }
      />
      <main
        className={clsx(
          "my-5 max-w-[1270px] mx-auto px-5 flex flex-col gap-6",
          "md:my-6 md:px-8"
        )}
      >
        <section id="hero" className="flex items-center gap-4">
          <Avatar username={user.username} src={user.avatar_url} size="large" />

          <div>
            <h1 className="text-xl font-semibold">{user.username}</h1>
            <p className="text-grey">Your personnal account</p>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-9">
          <VerticalNavlist className="md:col-span-3 lg:col-span-2" />
          <div className="md:col-span-6 lg:col-span-7">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
