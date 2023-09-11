import { create } from "zustand";
import { parseIssueSearchString } from "~/lib/shared/utils.shared";

import type { IssueSearchFilters } from "~/lib/shared/utils.shared";

type PreviousCallback = (params: string) => string;
type IssueSearchStore = {
  query: string;
  setQuery: (params: string) => void;
  setQueryFromPrevious: (callback: PreviousCallback) => void;
  getParsedQuery: () => IssueSearchFilters;
};

export const useSearchQueryStore = create<IssueSearchStore>((set, get) => ({
  query: "",
  getParsedQuery: () => parseIssueSearchString(get().query),
  setQuery: (query) =>
    set(() => ({
      query
    })),
  setQueryFromPrevious: (callback) =>
    set((store) => ({
      query: callback(store.query)
    }))
}));
