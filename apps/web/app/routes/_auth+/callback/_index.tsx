import { ClientActionFunction, redirect, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { signin } from "~/api/auth";
import { login } from "~/libs/authv2";

export default function SigninV2() {
  const submit = useSubmit();
  const callbackProcessed = useRef(false);

  useEffect(() => {
    if (callbackProcessed.current) {
      return;
    }
    callbackProcessed.current = true;
    submit(null, { method: "post" });
  }, []);

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

  await login({
    options: { code, state },
    callback: async ({ code, codeVerifier }) => {
      await signin({ code, codeVerifier });
    },
  });

  return redirect("/");
};
