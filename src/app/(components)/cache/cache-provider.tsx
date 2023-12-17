"use client";
import * as React from "react";

export function RSCCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => new Map());
  return (
    <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>
  );
}

export type RSCCacheContextType = Map<
  string,
  Promise<React.JSX.Element>
> | null;

export const CacheContext = React.createContext<RSCCacheContextType>(null);

export function useRSCCacheContext() {
  const cache = React.use(CacheContext);

  if (!cache) {
    throw new Error("Cache is null, this should never arrives");
  }

  return cache;
}
