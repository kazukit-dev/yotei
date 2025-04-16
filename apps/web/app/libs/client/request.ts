export type QueryParameter = Record<
  string,
  string | number | Array<string | number>
>;

export type CustomHeaders = Record<string, string>;

const buildURL = (path: string, query?: QueryParameter): URL => {
  const url = new URL(path);
  if (!query) return url;
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value.toString());
  }
  return url;
};

const buildHeaders = (data?: Record<string, string>) => {
  const headers = new Headers(data);
  return headers;
};

const buildBody = (data?: Record<string, unknown>): string | undefined => {
  return JSON.stringify(data);
};

export const buildRequest = (
  path: string,
  options?: {
    query?: QueryParameter;
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
  },
): Request => {
  const url = buildURL(path, options?.query);
  const body = buildBody(options?.body);
  const headers = buildHeaders(options?.headers);

  return new Request(url, { body, headers });
};
