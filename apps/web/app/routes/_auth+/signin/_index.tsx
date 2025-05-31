import { useFetcher } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { authorize } from "~/libs/auth";
import { withAuthRedirectAction } from "~/utils/with-auth-redirect";

const WEB_URL = import.meta.env.VITE_WEB_URL ?? "";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "";
const SCOPE = import.meta.env.VITE_OIDC_SCOPE ?? "";
const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? "";

export default function SigninV2() {
  const fetcher = useFetcher();

  return (
    <div className="flex h-screen items-center justify-center ">
      <fetcher.Form method="post">
        <Button type="submit">Login</Button>
      </fetcher.Form>
    </div>
  );
}

export const clientAction = withAuthRedirectAction(async () => {
  await authorize({
    endpoint: "/authorize",
    rootUrl: new URL(AUTH_URL),
    clientId: CLIENT_ID,
    redirectUri: new URL("/callback", WEB_URL).toString(),
    scope: SCOPE,
    responseType: "code",
    redirect: (url) => {
      window.location.href = url;
    },
  });
  return { ok: true };
});
