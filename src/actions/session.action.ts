"use server";

import { nextCache } from "~/lib/server/rsc-utils.server";
import { Session } from "~/lib/server/session.server";
import { CacheKeys } from "~/lib/shared/cache-keys.shared";
import { jsonFetch } from "~/lib/shared/utils.shared";

export type SuccessfulLocationData = {
  status: "success";
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
};
export type FailedLocationData = {
  status: "fail";
  message: string;
  query: string;
};
export type LocationData = SuccessfulLocationData | FailedLocationData;

export async function getLocationData(session: Session) {
  const fn = nextCache(
    (ip: string) =>
      jsonFetch<LocationData>(`http://ip-api.com/json/${session.ip}`, {
        cache: "force-cache"
      }),
    {
      tags: CacheKeys.geo(session.ip)
    }
  );

  return await fn(session.ip);
}
