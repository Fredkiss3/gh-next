import type { Session } from "~/lib/server/session.server";
import type { User } from "~/lib/server/db/schema/user.sql";

export interface PageProps<
  TParams extends Record<string, string> = {},
  TSearchParams extends Record<string, string | string[]> = {}
> {
  params: TParams;
  searchParams?: Partial<TSearchParams>;
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

export type GithubRepositoryData = {
  forkCount: number;
  stargazerCount: number;
  watcherCount: number;
  stargazers: Array<{
    id: number;
    login: string;
    avatarUrl: string;
    location: string | null;
    company: string | null;
    starredAt: string;
  }>;
  readmeContent: string;
  description: string;
  url: string;
  languages: Array<{
    name: string;
    color: string;
    percent: number;
  }>;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type FormState<
  TFormData extends unknown = Record<string, string | number | boolean | null>
> =
  | {
      type: "success";
      message: string;
    }
  | {
      type: "error";
      fieldErrors?: Record<string, string[] | undefined> | null;
      formErrors?: string[];
      formData: TFormData;
    }
  | { type: undefined; message: null }; // initial state

export type OmitFirstItemInArray<T extends any[]> = T extends [any, ...infer R]
  ? R
  : never;

export type OmitLastItemInArray<T extends any[]> = T extends [
  ...infer Head,
  any
]
  ? Head
  : any[];

export type FunctionWithoutLastArg<T extends (...args: any[]) => any> =
  T extends (...args: [...infer P, any]) => infer R ? (...args: P) => R : never;
