export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly kind = 'success' as const;

  constructor(readonly value: T) {}

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<never> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.value));
  }

  flatMap<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  getOrThrow(): T {
    return this.value;
  }
}

export class Failure<E> {
  readonly kind = 'failure' as const;

  constructor(readonly error: E) {}

  isSuccess(): this is Success<never> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }

  map<U>(fn: (value: never) => U): Result<U, E> {
    return this as any;
  }

  flatMap<U>(fn: (value: never) => Result<U, E>): Result<U, E> {
    return this as any;
  }

  getOrThrow(): never {
    if (this.error instanceof Error) {
      throw this.error;
    }
    throw new Error(String(this.error));
  }
}

export const ok = <T>(value: T): Result<T> => new Success(value);
export const err = <E>(error: E): Result<never, E> => new Failure(error);
