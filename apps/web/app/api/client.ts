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

type Result<T, E> = Success<T> | Failure<E>;

const success = <T = unknown>(data: T, status = 200): Success<T> => {
  return { ok: true, data, status };
};
const failure = <E = unknown>(error: E, status = 500): Failure<E> => {
  return { ok: false, error, status };
};

const isJson = (res: Response): boolean => {
  return !!res.headers.get("content-type")?.includes("application/json");
};

const buildHeaders = (data: Record<string, string>) => {
  const headers = new Headers();

  for (const [key, value] of Object.entries(data)) {
    headers.set(key, value);
  }

  return headers;
};

const request = async <T, E>(
  path: URL | string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  },
) => {
  const url = new URL(path);
  const body = JSON.stringify(options?.body);
  const headers = buildHeaders({
    ...(options?.headers ?? {}),
    "Content-Type": "application/json",
  });
  const res = await fetch(url, {
    method: options?.method,
    body,
    headers,
  });
  const data = isJson(res) ? await res.json() : await res.text();

  if (res.ok) {
    return success<T>(data);
  }
  return failure<E>(data, res.status);
};

const get = async <T = unknown, E = unknown>(
  path: URL,
  params?: Record<string, unknown>,
  options?: {
    headers?: Record<string, string>;
  },
): Promise<Result<T, E>> => {
  const url = new URL(path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, String(value));
    }
  }
  const result = await request<T, E>(url, {
    method: "GET",
    headers: options?.headers,
  });
  return result;
};

const post = async <T = unknown, E = unknown>(
  path: string | URL,
  body?: Record<string, unknown>,
  options?: {
    headers?: Record<string, string>;
  },
): Promise<Result<T, E>> => {
  const url = new URL(path);

  const result = await request<T, E>(url, {
    method: "POST",
    body,
    headers: options?.headers,
  });

  return result;
};

const _delete = async <T = unknown, E = unknown>(
  path: string | URL,
  body?: Record<string, unknown>,
  options?: {
    headers?: Record<string, string>;
  },
): Promise<Result<T, E>> => {
  const url = new URL(path);

  const result = await request<T, E>(url, {
    method: "DELETE",
    body,
    headers: options?.headers,
  });

  return result;
};

const put = async <T = unknown, E = unknown>(
  path: string | URL,
  body?: Record<string, unknown>,
  options?: {
    headers?: Record<string, string>;
  },
): Promise<Result<T, E>> => {
  const url = new URL(path);

  const result = await request<T, E>(url, {
    method: "PUT",
    body,
    headers: options?.headers,
  });

  return result;
};

export default {
  get,
  post,
  put,
  delete: _delete,
};
