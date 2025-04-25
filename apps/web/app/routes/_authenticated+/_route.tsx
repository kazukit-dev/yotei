import {
  ClientActionFunction,
  Link,
  Outlet,
  redirect,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { getMe } from "~/api/user";
import { getAuth } from "~/auth";
import { AuthError } from "~/libs/auth";

import { Header } from "./components/header";

export const clientLoader: ClientActionFunction = async () => {
  const auth = getAuth();
  if (!auth.isAuthenticated()) {
    return redirect("/signin");
  }
  const me = await getMe();
  return { ok: true, me };
};

export default function Index() {
  const { me } = useLoaderData<typeof clientLoader>();
  const fetcher = useFetcher();

  const handleSignout = async () => {
    fetcher.submit(null, {
      method: "POST",
      action: "/signout",
      encType: "application/json",
    });
  };

  return (
    <>
      <Header user={me} onSignout={handleSignout} />
      <Outlet />
    </>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof AuthError) {
    return (
      <div>
        <h1>AuthError</h1>
        <Link to="/signin">Signin</Link>
      </div>
    );
  }
};
