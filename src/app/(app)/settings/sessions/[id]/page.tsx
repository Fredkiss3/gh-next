import * as React from "react";

// components
import {
  ArrowLeftIcon,
  DeviceDesktopIcon,
  DeviceMobileIcon,
  QuestionIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { Button } from "~/components/button";
import { Session } from "~/lib/server/session.server";
import { Skeleton } from "~/components/skeleton";

// utils
import { redirect } from "next/navigation";
import { getSession, getUserOrRedirect } from "~/actions/auth.action";
import {
  getLocationData,
  revokeSession,
  type SuccessfulLocationData
} from "~/actions/session.action";
import {
  clsx,
  formatDate,
  isDateLessThanAnHourAgo
} from "~/lib/shared/utils.shared";
import { userAgent } from "next/server";

// types
import type { PageProps } from "~/lib/types";
import { SubmitButton } from "~/components/submit-button";

export const metadata = {
  title: "Session detail"
};

export default async function SessionDetailPage({
  params
}: PageProps<{
  id: string;
}>) {
  const user = await getUserOrRedirect(`/settings/sessions/${params.id}`);
  const [sessionData, currentUserSession] = await Promise.all([
    Session.getUserSession(user.id, params.id),
    getSession()
  ]);

  if (!sessionData) {
    await currentUserSession.addFlash({
      type: "warning",
      message:
        "The session you are looking for has expired and is no longer accessible."
    });
    redirect(`/settings/sessions`);
  }

  return (
    <div>
      <section className="flex flex-col gap-4 md:gap-8">
        <h2 className="border-b border-neutral py-2.5 text-3xl font-medium">
          Session details
        </h2>

        <React.Suspense
          fallback={
            <div
              className={clsx(
                "px-5 py-6 bg-ghost/40 border border-neutral grid gap-4 text-grey",
                "rounded-md"
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
                <Skeleton className="w-32 h-7" />
              </div>
              <Skeleton className="w-20 h-3" />

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="w-48 h-3" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="w-48 h-3" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="w-48 h-3" />
                </div>
              </div>
            </div>
          }
        >
          <SessionDetails
            currentSession={currentUserSession}
            sessionData={sessionData}
          />
        </React.Suspense>

        <Link href={"/settings/sessions"} className="underline text-accent">
          <ArrowLeftIcon className="h-4 w-4" />
          <span>View all sessions</span>
        </Link>
      </section>
    </div>
  );
}

async function SessionDetails({
  sessionData,
  currentSession: currentUserSesssion
}: { sessionData: Session; currentSession: Session }) {
  let lastLocation: SuccessfulLocationData | null = null;
  const locationData = await getLocationData(sessionData);
  if (locationData.status === "success") {
    lastLocation = locationData;
  }
  const isActiveSession = sessionData.lastAccessed
    ? isDateLessThanAnHourAgo(sessionData.lastAccessed)
    : sessionData.lastLogin
      ? isDateLessThanAnHourAgo(sessionData.lastLogin)
      : false;

  const { browser, os } = userAgent({
    headers: new Headers({
      "user-agent": sessionData.userAgent
    })
  });

  const revokeSessionBound = revokeSession.bind(null, sessionData.id);

  return (
    <div
      className={clsx(
        "p-5 bg-ghost/40 border border-neutral grid gap-3 text-grey",
        "rounded-md"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-start">
          {/* Activity indicator */}
          <span
            className={clsx("h-2 w-2 flex-none rounded-full relative top-4", {
              "bg-grey": !isActiveSession,
              "bg-success [box-shadow:0_0_10px_rgba(var(--success-color),_0.5)]":
                isActiveSession && currentUserSesssion.id !== sessionData.id,
              "bg-accent [box-shadow:0_0_10px_rgba(var(--accent-color),_0.5)]":
                currentUserSesssion.id === sessionData.id
            })}
          >
            <span className="sr-only">Active session</span>
          </span>

          {/* Device Icon */}
          <div className="self-center">
            {sessionData.device === "desktop" ? (
              <DeviceDesktopIcon className="h-8 w-8 flex-none" />
            ) : sessionData.device === "mobile" ? (
              <DeviceMobileIcon size={16} className="h-8 w-8 flex-none" />
            ) : sessionData.device === "tablet" ? (
              <DeviceMobileIcon size={24} className="h-8 w-8 flex-none" />
            ) : (
              <QuestionIcon className="h-8 w-8 flex-none" />
            )}
          </div>

          {/* Location & IP */}
          <div>
            <h3 className="font-semibold">
              {lastLocation?.city ?? "Unknown city"} {sessionData.ip}
            </h3>
            <small className="text-sm">
              {currentUserSesssion.id === sessionData.id
                ? "Your current session"
                : sessionData.lastAccessed
                  ? `Last accessed ${formatDate(sessionData.lastAccessed)}`
                  : sessionData.lastLogin
                    ? `Last login ${formatDate(sessionData.lastLogin)}`
                    : null}
            </small>
          </div>
        </div>

        {sessionData.id !== currentUserSesssion.id && (
          <form action={revokeSessionBound}>
            <SubmitButton
              variant="danger"
              className="bg-ghost px-3 py-1"
              loadingMessage={"Revoking session..."}
            >
              Revoke session
            </SubmitButton>
          </form>
        )}
      </div>
      {lastLocation && (
        <small className="text-sm">Seen in {lastLocation.countryCode}</small>
      )}

      <dl className="flex flex-col gap-2">
        <div>
          <dt className="font-semibold">Device :</dt>
          <dd>
            {browser.name ?? "Unknown browser"} on&nbsp;
            {os.name}
          </dd>
        </div>

        <div>
          <dt className="font-semibold">Last location:</dt>
          <dd>
            {lastLocation ? (
              <>
                {lastLocation.city}, {lastLocation.regionName},{" "}
                {lastLocation.country}
              </>
            ) : (
              "unknown"
            )}
          </dd>
        </div>

        <div>
          <dt className="font-semibold">Signed at :</dt>
          <dd>
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "long",
              timeStyle: "short"
            }).format(sessionData.lastLogin)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
