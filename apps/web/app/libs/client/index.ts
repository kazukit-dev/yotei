import { Hooks } from "./hook";
import { http } from "./http";
import { METHOD } from "./method";
import {
  buildRequest,
  CustomHeaders,
  QueryParameter,
  RequestOptions,
} from "./request";
import { failure, Result, success } from "./result";
import { retryHttp, RetryOptions } from "./retry";

export type {
  AfterResponseHook,
  BeforeRequestHook,
  BeforeRetryHook,
} from "./hook";

export type HttpOptions = {
  query?: QueryParameter;
  headers?: CustomHeaders;
  retry?: RetryOptions;
  body?: Record<string, unknown>;
};

const joinURL = (baseURL: string, path: string): string => {
  const normalizedBase = baseURL.replace(/\/+$/, ""); // 末尾のスラッシュ削除
  const normalizedPath = path.replace(/^\/+/, ""); // 先頭のスラッシュ削除
  return `${normalizedBase}/${normalizedPath}`;
};

const isJson = (res: Response): boolean => {
  return !!res.headers.get("content-type")?.includes("application/json");
};

const toResult = async <T, E>(res: Response) => {
  const data = isJson(res) ? await res.json() : await res.text();

  if (res.ok) return success<T>(data, res.status);
  return failure<E>(data, res.status);
};

export class HttpClient {
  private baseURL?: string;
  private retryOptions?: RetryOptions;
  private hooks?: Hooks;

  constructor(baseURL?: string, retryOptions?: RetryOptions) {
    this.baseURL = baseURL;
    this.retryOptions = retryOptions;
  }

  public use(hooks: Hooks) {
    this.hooks = hooks;
  }

  public async get<T = unknown, E = unknown>(
    path: string,
    query?: QueryParameter,
    options?: Omit<HttpOptions, "body" | "query">,
  ): Promise<Result<T, E>> {
    const res = await this._request(path, {
      ...options,
      query,
      method: METHOD.GET,
    });
    return toResult<T, E>(res);
  }

  public async post<T = unknown, E = unknown>(
    path: string,
    body: Record<string, unknown> | undefined,
    options?: Omit<HttpOptions, "body">,
  ): Promise<Result<T, E>> {
    const res = await this._request(path, {
      ...options,
      body,
      method: METHOD.POST,
    });
    return toResult<T, E>(res);
  }

  public async put<T = unknown, E = unknown>(
    path: string,
    body: Record<string, unknown> | undefined,
    options?: Omit<HttpOptions, "body">,
  ): Promise<Result<T, E>> {
    const res = await this._request(path, {
      ...options,
      body,
      method: METHOD.PUT,
    });
    return toResult<T, E>(res);
  }

  public async delete<T = unknown, E = unknown>(
    path: string,
    body: Record<string, unknown> | undefined,
    options?: Omit<HttpOptions, "body">,
  ): Promise<Result<T, E>> {
    const res = await this._request(path, {
      ...options,
      body,
      method: METHOD.DELETE,
    });
    return toResult<T, E>(res);
  }

  private async _request(path: string, options: RequestOptions) {
    const url = this.baseURL ? joinURL(this.baseURL, path) : path;
    const baseHttp = http(this.hooks);
    const httpFn = this.retryOptions
      ? retryHttp(baseHttp, this.retryOptions, this.hooks?.beforeRetryHooks)
      : baseHttp;
    const res = await httpFn(buildRequest(url, options));
    return res;
  }
}

export const createHttpClient = (
  baseURL?: string,
  retryOptions?: RetryOptions,
) => {
  return new HttpClient(baseURL, retryOptions);
};
