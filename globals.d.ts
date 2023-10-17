import * as ReactDOM from "react-dom";

declare global {
  namespace NodeJS {
    interface Global {
      crypto: Crypto;
    }
  }
}
