import { ClientActionFunction, redirect, useSubmit } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { signin } from "~/api/auth";
import { AuthError } from "~/api/error";
import { login } from "~/libs/auth";

export default function SigninV2() {
  const submit = useSubmit();
  const callbackProcessed = useRef(false);

  useEffect(() => {
    if (callbackProcessed.current) {
      return;
    }
    callbackProcessed.current = true;
    submit(null, { method: "post" });
  }, [submit]);

  return (
    <div>
      <p>Redirecting...</p>
    </div>
  );
}

export const clientAction: ClientActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  try {
    await login({
      options: { code, state },
      callback: async ({ code, codeVerifier }) => {
        await signin({ code, codeVerifier });
      },
    });
  } catch (err) {
    throw new AuthError("Authentication failed", { cause: err });
  }

  return redirect("/calendars");
};
