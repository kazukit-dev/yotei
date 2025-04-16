import sleep from "~/utils/sleep";

import { BeforeRetryHook } from "./hook";

export type RetryOptions = {
  statusCodes?: number[];
  maxReties?: number;
  delay?: (count: number) => number;
};

type RequestFn = (req: Request) => Promise<Response>;

const DEFAULT_STATUS_CODES = [408, 413, 429, 500, 502, 503, 504];
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_DELAY = (attempts: number) => 0.3 * 2 ** (attempts - 1) * 1000;

export const retryHttp = (
  fn: RequestFn,
  {
    statusCodes = DEFAULT_STATUS_CODES,
    maxReties = DEFAULT_MAX_RETRIES,
    delay = DEFAULT_DELAY,
  }: RetryOptions,
  hooks?: BeforeRetryHook[],
) => {
  const _retry = async (req: Request, retries = 0): Promise<Response> => {
    const res = await fn(req);
    if (res.ok) return res;
    if (!statusCodes.includes(res.status)) return res;
    if (retries >= maxReties) return res;

    if (hooks) {
      for (const hook of hooks) {
        await hook(req, res, retries);
      }
    }
    await sleep(delay(retries));
    return _retry(req, retries + 1);
  };

  return _retry;
};
