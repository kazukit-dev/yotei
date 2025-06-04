import {
  Outlet,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "react-router";

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
  const navigate = useNavigate();
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
  const handleLogoClick = () => {
    navigate("/calendars");
  };

  return (
    <>
      <Header
        user={me}
        onSignout={handleSignout}
        onLogoClick={handleLogoClick}
      />
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
