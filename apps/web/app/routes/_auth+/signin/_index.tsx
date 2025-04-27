import {
  ClientActionFunction,
  ClientLoaderFunction,
  redirect,
  useSubmit,
} from "@remix-run/react";

import { getAuth } from "~/auth";

import { SigninForm } from "./components/form";
import { SigninSchema } from "./schema";

export const clientLoader: ClientLoaderFunction = async () => {
  const auth = getAuth();
  if (auth.isAuthenticated()) return redirect("/calendars");
  return null;
};

export default function Signin() {
  const submit = useSubmit();
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-96 rounded-lg border border-gray-300 p-5">
        <h1 className="pb-3 text-2xl font-bold">Sign in</h1>
        <SigninForm
          onSubmit={(data) => {
            submit(data, { method: "POST", encType: "application/json" });
          }}
        />
      </div>
    </div>
  );
}

export const clientAction: ClientActionFunction = async ({ request }) => {
  const data: SigninSchema = await request.json();
  const auth = getAuth();
  await auth.signin(data);
  return redirect("/calendars");
};
