import { getAuth } from "~/auth";
import { API_URL } from "~/config";
import { createHttpClient } from "~/libs/client";

const auth = getAuth();

const contentTypeHook = async (req: Request) => {
  const headers = new Headers(req.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Request(req, { headers });
};

const accessTokenSetHook = async (req: Request) => {
  const headers = new Headers(req.headers);
  const accessToken = auth.getAccessToken();
  headers.set("Authorization", `Bearer ${accessToken}`);
  return new Request(req, { headers });
};

const tokenRefreshHook = async (_: Request, res: Response, reties: number) => {
  if (res.status === 401 && reties <= 1) {
    await auth.refreshToken();
  }
};

const apiClient = createHttpClient(API_URL, {
  statusCodes: [401],
});

apiClient.use({
  beforeRequestHooks: [contentTypeHook, accessTokenSetHook],
  beforeRetryHooks: [tokenRefreshHook],
});

export default apiClient;
