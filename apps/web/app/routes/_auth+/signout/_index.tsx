import { ClientActionFunction, redirect } from "@remix-run/react";

import { getAuth } from "~/auth";

export const clientAction: ClientActionFunction = async () => {
  const auth = getAuth();
  await auth.signout();
  return redirect("/signin");
};
