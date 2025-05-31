import { handleApiError } from "../error";
import apiClient from "../shared/client";

export const signin = async (data: {
  code: string;
  codeVerifier: string;
}): Promise<void> => {
  const result = await apiClient.post("/auth/signin", {
    code: data.code,
    code_verifier: data.codeVerifier,
  });
  if (!result.ok) {
    handleApiError(result.status);
  }
  return;
};

export const signout = async (): Promise<void> => {
  const result = await apiClient.post<void>("/auth/signout", undefined);

  if (!result.ok) {
    handleApiError(result.status);
  }
  return;
};
