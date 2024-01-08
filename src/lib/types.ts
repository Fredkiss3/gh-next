export type PageProps<
  TParams extends Record<string, string | string[]> = {},
  TSearchParams extends Record<string, string | string[]> = {}
> = {
  params: TParams;
  searchParams?: Partial<TSearchParams>;
};
export type LayoutProps<TParams extends Record<string, string> = {}> = {
  params: TParams;
  children: React.ReactNode;
};

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
  updatedAt: number;
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
  TFormData = Record<string, string | number | boolean | null>
> =
  | {
      type: "success";
      message: string;
    }
  | {
      type: "error";
      fieldErrors?: {
        [K in keyof TFormData]?: string[] | undefined;
      };
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

export type FunctionWithoutLastArg<Func extends (...args: any[]) => any> =
  Func extends (...args: [...infer P, any]) => infer R
    ? (...args: P) => R
    : never;

type GetEventHandlers<T extends keyof JSX.IntrinsicElements> = Extract<
  keyof JSX.IntrinsicElements[T],
  `on${string}`
>;

/**
 * Provides the event type for a given element and handler.
 *
 * @example
 *
 * type MyEvent = EventFor<"input", "onChange">;
 */
export type EventFor<
  TElement extends keyof JSX.IntrinsicElements,
  THandler extends GetEventHandlers<TElement>
> = JSX.IntrinsicElements[TElement][THandler] extends
  | ((e: infer TEvent) => any)
  | undefined
  ? TEvent
  : never;
