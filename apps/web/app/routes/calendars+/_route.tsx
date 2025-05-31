import { Outlet, redirect, useFetcher, useLoaderData } from "@remix-run/react";

import { signout } from "~/api/auth";
import { getMe } from "~/api/user";
import {
  withAuthRedirectAction,
  withAuthRedirectLoader,
} from "~/utils/with-auth-redirect";

import { Header } from "../../components/header";

export const clientLoader = withAuthRedirectLoader(async () => {
  const me = await getMe();
  return { ok: true, me };
});

export default function Index() {
  const { me } = useLoaderData<typeof clientLoader>();
  const fetcher = useFetcher();

  const handleSignout = async () => {
    fetcher.submit(
      { intent: "signout" },
      {
        method: "post",
        encType: "application/json",
      },
    );
  };

  return (
    <>
      <Header user={me} onSignout={handleSignout} />
      <Outlet />
    </>
  );
}

export const clientAction = withAuthRedirectAction(async ({ request }) => {
  const data = await request.json();
  switch (data.intent) {
    case "signout": {
      await signout();
      return redirect("/signin");
    }
  }
});
