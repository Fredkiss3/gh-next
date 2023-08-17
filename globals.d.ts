// globals.d.ts

declare global {
  namespace NodeJS {
    interface Global {
      crypto: Crypto;
    }
  }
}
