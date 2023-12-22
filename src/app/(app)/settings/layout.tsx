// components
import { Avatar } from "~/components/avatar";

import { VerticalNavlist } from "~/components/vertical-navlist";

// utils
import { getAuthedUser, getUserOrRedirect } from "~/actions/auth.action";
import { clsx } from "~/lib/shared/utils.shared";

export default async function SettingsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getUserOrRedirect("/settings/account");
  return (
    <>
      <main
        id="main-content"
        className={clsx(
          "mx-auto my-5 flex max-w-[1270px] flex-col gap-6 px-5",
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
    </>
  );
}
