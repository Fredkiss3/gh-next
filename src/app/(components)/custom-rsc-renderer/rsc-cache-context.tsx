"use client";
import * as React from "react";

/**
 * A custom cache context to avoid recreating RSC promises every time
 * @returns
 */
export function RSCCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => new Map());
  return (
    <RSCCacheContext.Provider key="rsc-cache" value={cache}>
      {children}
    </RSCCacheContext.Provider>
  );
}

export type RSCCacheContextType = Map<
  string,
  Promise<React.JSX.Element>
> | null;

export const RSCCacheContext = React.createContext<RSCCacheContextType>(null);

export function useRSCCacheContext() {
  const cache = React.use(RSCCacheContext);

  if (!cache) {
    throw new Error("Cache is null, this should never arrives");
  }

  return cache;
}
