export interface PageProps<
  TParams extends Record<string, string> = {},
  TSearchParams extends Record<string, string | string[]> = {}
> {
  params: TParams;
  searchParams?: TSearchParams;
}

export type FormErrors = Record<string, string[]> | null | undefined;
export type FormDefaultValues =
  | Record<
      string,
      string | number | boolean | (string | number | boolean)[] | null
    >
  | null
  | undefined;

export type UpperLowerCase<T extends string> =
  | T
  | `${Lowercase<T>}`
  | `${Uppercase<T>}`;
