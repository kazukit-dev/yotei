import { API_URL } from "~/config";
import { createHttpClient } from "~/libs/client";

const contentTypeHook = async (req: Request) => {
  const headers = new Headers(req.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Request(req, { headers });
};

const apiClient = createHttpClient(API_URL, {
  statusCodes: [401],
});

apiClient.use({
  beforeRequestHooks: [contentTypeHook],
});

export default apiClient;
