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

export type ServerActionResult<
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

export type AuthError = {
  type: "AUTH_ERROR";
};

export type AuthedServerActionResult<
  T extends (...args: any[]) => Promise<any>
> = (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | AuthError>;
