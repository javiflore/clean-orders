import { AppError } from "../application/errors/AppError.js";

export type Result<T, E > = 
    | { success: true; data: T; isSuccess:true; isFailure: false; value: T }
    | { success: false; error: E; isSuccess:false; isFailure: true };


export const ok = <T>(value: T): Result<T, never> => ({
    success: true,
    data: value,
    isSuccess: true,
    isFailure: false,
    value
})

export const err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
  isSuccess: false,
  isFailure: true,
});

export const isOk = <T, E>(result: Result<T, E>): result is { success: true; data: T; isSuccess: true; isFailure: false, value: T } =>
  result.isSuccess;

export const isErr = <T, E>(result: Result<T, E>): result is { success: false; error: E; isSuccess: false; isFailure: true } =>
  result.isFailure;

// unwrap safe
export const unwrap = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  isOk(result) ? result.value : defaultValue;

export const unwrapErr = <T, E>(result: Result<T, E>, defaultError: E): E =>
  isErr(result) ? result.error : defaultError;

// map / flatMap
export const map = <T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
  isOk(result) ? ok(fn(result.value)) : result;

export const flatMap = <T, E, U>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> =>
  isOk(result) ? fn(result.value) : result;