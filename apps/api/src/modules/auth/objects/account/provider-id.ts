import { err, ok, Result } from "neverthrow";

import { Brand } from "../../../../shared/helpers/brand";

type _ProviderId = "auth0";

export type ProviderId = Brand<_ProviderId, "ProviderId">;

export const createProviderId = (value: string): Result<ProviderId, string> => {
  switch (value) {
    case "auth0":
      return ok(value as ProviderId);
    default:
      return err("InvalidProviderId");
  }
};
