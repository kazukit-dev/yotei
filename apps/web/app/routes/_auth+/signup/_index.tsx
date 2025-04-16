import {
  ClientActionFunction,
  ClientLoaderFunction,
  redirect,
  useSubmit,
} from "@remix-run/react";

import { getAuth } from "~/auth";

import { SignupForm } from "./components/form";
import { SignupSchema } from "./schema";

export const clientLoader: ClientLoaderFunction = async () => {
  const auth = getAuth();
  if (auth.isAuthenticated()) return redirect("/");
  return null;
};

export default function Signup() {
  const submit = useSubmit();
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-96 rounded-lg border border-gray-300 p-5">
        <h1 className="pb-3 text-2xl font-bold">Create account</h1>
        <SignupForm
          onSubmit={(data) => {
            submit(data, { method: "POST", encType: "application/json" });
          }}
        />
      </div>
    </div>
  );
}

export const clientAction: ClientActionFunction = async ({ request }) => {
  const data: SignupSchema = await request.json();
  const auth = getAuth();
  auth.signup(data);
  return redirect("/auth/signin");
};
