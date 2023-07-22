export class PauseableTimeout {
  #callback: () => void;
  #delay: number;
  #remaining: number;
  #startTime?: number;
  #timerId?: NodeJS.Timeout;

  constructor(callback: () => void, delay: number) {
    this.#callback = callback;
    this.#delay = delay;
    this.#remaining = this.#delay;
  }

  public start(): void {
    this.#startTime = Date.now();
    this.#timerId = setTimeout(this.#callback, this.#remaining);
  }

  public pause(): void {
    if (this.#timerId) {
      clearTimeout(this.#timerId);
      this.#remaining -= Date.now() - (this.#startTime || 0);
    }
  }

  public resume(): void {
    this.#startTime = Date.now();
    this.#timerId = setTimeout(this.#callback, this.#remaining);
  }

  public stop(): void {
    if (this.#timerId) {
      clearTimeout(this.#timerId);
      this.#timerId = undefined;
      this.#remaining = this.#delay;
    }
  }
}
