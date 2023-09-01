import { create } from "zustand";

type SearchParamsStore = {
  params: string;
};

export const useTodoStore = create<SearchParamsStore>((set) => ({
  params: "",
}));
