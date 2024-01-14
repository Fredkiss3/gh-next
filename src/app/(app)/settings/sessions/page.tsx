import * as React from "react";

// components
import {
  DeviceDesktopIcon,
  DeviceMobileIcon,
  QuestionIcon
} from "@primer/octicons-react";
import { getSession, getUserOrRedirect } from "~/actions/auth.action";
import { Button } from "~/components/button";

// utils
import { Session } from "~/lib/server/session.server";
import {
  clsx,
  formatDate,
  isDateLessThanAnHourAgo,
  range
} from "~/lib/shared/utils.shared";
import { Skeleton } from "~/components/skeleton";
import {
  getLocationData,
  type SuccessfulLocationData
} from "~/actions/session.action";

export const metadata = {
  title: "Sessions"
};

export default async function SessionListPage() {
  const user = await getUserOrRedirect("/settings/sessions");

  return (
    <div>
      <section className="flex flex-col gap-4 md:gap-8">
        <h2 className="border-b border-neutral py-2.5 text-3xl font-medium">
          Sessions
        </h2>

        <p>
          This is a list of devices that have logged into your account. Revoke
          any sessions that you do not recognize.
        </p>

        <React.Suspense
          fallback={
            <ul>
              <span className="sr-only" aria-live="polite">
                Loading sessions...
              </span>
              {range(0, 2).map((index) => (
                <li
                  key={index}
                  className={clsx(
                    "p-5 bg-ghost/40 border border-neutral grid gap-3 text-grey",
                    {
                      "rounded-t-md": index === 0,
                      "rounded-b-md": index === 2
                    }
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-start">
                      {/* Activity indicator */}
                      <Skeleton
                        shape="circle"
                        className={clsx("h-2.5 w-2.5 flex-none relative top-3")}
                      />

                      {/* Device Icon */}
                      <Skeleton className="self-center h-9 w-9" />

                      {/* Location & IP */}
                      <div className="flex flex-col gap-3">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="w-36 h-3" />
                      </div>
                    </div>

                    {/* Button */}
                    <Skeleton className="w-20 h-7" />
                  </div>
                  <Skeleton className="w-40 h-3" />
                </li>
              ))}
            </ul>
          }
        >
          <AllSessions userId={user.id} />
        </React.Suspense>
      </section>
    </div>
  );
}

async function AllSessions({ userId }: { userId: number }) {
  const [currentSesssion, userSessions] = await Promise.all([
    getSession(),
    Session.getUserSessions(userId).then((sessions) =>
      Promise.all(
        sessions.map(async (session) => {
          const location = await getLocationData(session);
          return { session, location };
        })
      )
    )
  ]);

  return (
    <ul>
      {userSessions
        .sort(({ session: sessionA }, { session: sessionB }) => {
          if (sessionA.id === currentSesssion.id) {
            return -1;
          }
          if (sessionB.id === currentSesssion.id) {
            return 1;
          }
          if (sessionA.lastAccessed && sessionB.lastAccessed) {
            if (sessionA.lastAccessed > sessionB.lastAccessed) {
              return -1;
            } else {
              return 1;
            }
          } else if (sessionA.lastAccessed) {
            return -1;
          } else if (sessionB.lastAccessed) {
            return 1;
          }
          return 0;
        })
        .map(({ session, location: locationData }, index) => {
          const location =
            locationData.status === "success" ? locationData : null;

          const isActiveSession = session.lastAccessed
            ? isDateLessThanAnHourAgo(session.lastAccessed)
            : session.lastLogin
              ? isDateLessThanAnHourAgo(session.lastLogin)
              : false;

          return (
            <li
              key={session.id}
              className={clsx(
                "p-4 bg-ghost/40 border border-neutral grid gap-2 text-grey",
                {
                  "rounded-t-md": index === 0,
                  "rounded-b-md": index === userSessions.length - 1
                }
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                  {/* Activity indicator */}
                  <span
                    className={clsx(
                      "h-2 w-2 flex-none rounded-full relative top-4",
                      {
                        "bg-grey": !isActiveSession,
                        "bg-success [box-shadow:0_0_10px_rgba(var(--success-color),_0.5)]":
                          isActiveSession && currentSesssion.id !== session.id,
                        "bg-accent [box-shadow:0_0_10px_rgba(var(--accent-color),_0.5)]":
                          currentSesssion.id === session.id
                      }
                    )}
                  >
                    <span className="sr-only">Active session</span>
                  </span>

                  {/* Device Icon */}
                  <div className="self-center">
                    {session.device === "desktop" ? (
                      <DeviceDesktopIcon className="h-8 w-8 flex-none" />
                    ) : session.device === "mobile" ? (
                      <DeviceMobileIcon
                        size={16}
                        className="h-8 w-8 flex-none"
                      />
                    ) : session.device === "tablet" ? (
                      <DeviceMobileIcon
                        size={24}
                        className="h-8 w-8 flex-none"
                      />
                    ) : (
                      <QuestionIcon className="h-8 w-8 flex-none" />
                    )}
                  </div>

                  {/* Location & IP */}
                  <div>
                    <h3 className="font-semibold">
                      {location?.city ?? "Unknown city"} {session.ip}
                    </h3>
                    <small className="text-sm">
                      {currentSesssion.id === session.id
                        ? "Your current session"
                        : session.lastAccessed
                          ? `Last accessed ${formatDate(session.lastAccessed)}`
                          : session.lastLogin
                            ? `Last login ${formatDate(session.lastLogin)}`
                            : null}
                    </small>
                  </div>
                </div>

                <div>
                  <Button
                    href={`/settings/sessions/${session.id}`}
                    variant="subtle"
                    className="bg-ghost px-3 py-1"
                  >
                    See more
                  </Button>
                </div>
              </div>
              {location && (
                <small className="text-sm">
                  Last Seen in {location.countryCode}
                </small>
              )}
            </li>
          );
        })}
    </ul>
  );
}
