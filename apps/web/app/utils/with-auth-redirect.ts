import {
  ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
  redirect,
} from "@remix-run/react";

import { AuthError } from "~/api/error";

export function withAuthRedirectLoader<T>(
  loader: (args: ClientLoaderFunctionArgs) => Promise<T>,
  redirectPath: string = "/signin",
) {
  return async (args: ClientLoaderFunctionArgs): Promise<T> => {
    try {
      return await loader(args);
    } catch (error) {
      if (error instanceof AuthError) {
        throw redirect(redirectPath);
      }
      throw error;
    }
  };
}

export function withAuthRedirectAction<T>(
  action: (args: ClientActionFunctionArgs) => Promise<T>,
  redirectPath: string = "/signin",
) {
  return async (args: ClientActionFunctionArgs): Promise<T> => {
    try {
      return await action(args);
    } catch (error) {
      if (error instanceof AuthError) {
        throw redirect(redirectPath);
      }
      throw error;
    }
  };
}
