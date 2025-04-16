export type BeforeRequestHook = (
  req: Request,
) => Promise<Request> | Request | void;

export type AfterResponseHook = (
  req: Request,
  res: Response,
) => Promise<Response> | Response | void;

export type BeforeRetryHook = (
  req: Request,
  res: Response,
  retries: number,
) => void | Promise<void>;

export type Hooks = {
  beforeRequestHooks?: BeforeRequestHook[];
  afterResponseHooks?: AfterResponseHook[];
  beforeRetryHooks?: BeforeRetryHook[];
};
