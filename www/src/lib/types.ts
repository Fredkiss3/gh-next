export type PageParams = Record<string, string>;
export interface PageProps {
  params?: PageParams;
  searchParams?: Record<string, string | string[]>;
}

export type FormErrors = Record<string, string[]> | null | undefined;
export type FormDefaultValues =
  | Record<
      string,
      string | number | boolean | (string | number | boolean)[] | null
    >
  | null
  | undefined;
