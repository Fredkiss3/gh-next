import * as ReactDOM from "react-dom";

declare global {
  namespace NodeJS {
    interface Global {
      crypto: Crypto;
    }
  }
}

declare module "react-dom" {
  function experimental_useFormState<S, P, R extends unknown>(
    action: (state: S, payload: P) => Promise<R>,
    initialState: S,
    url?: string
  ): [R, (payload: P) => Promise<void>];
}
