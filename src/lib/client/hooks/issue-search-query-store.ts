import { create } from "zustand";

type PreviousCallback = (params: string) => string;
type SearchQueryStore = {
  query: string;
  setQuery: (params: string) => void;
  setQueryFromPrevious: (callback: PreviousCallback) => void;
};

export const useSearchQueryStore = create<SearchQueryStore>((set) => ({
  query: "",
  setQuery: (query) =>
    set(() => ({
      query,
    })),
  setQueryFromPrevious: (callback) =>
    set((store) => ({
      query: callback(store.query),
    })),
}));
