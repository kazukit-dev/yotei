type Success<T> = {
  ok: true;
  data: T;
  status: number;
};

type Failure<E> = {
  ok: false;
  error: E;
  status: number;
};

export type Result<T, E> = Success<T> | Failure<E>;

export const success = <T = unknown>(data: T, status = 200): Success<T> => {
  return { ok: true, data, status };
};

export const failure = <E = unknown>(error: E, status = 500): Failure<E> => {
  return { ok: false, error, status };
};
