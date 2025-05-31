import { User } from "~/models/user";

import { handleApiError } from "../error";
import apiClient from "../shared/client";

export const fetchMe = async (): Promise<User> => {
  const result = await apiClient.get<User>("/users/me");
  if (result.ok) return result.data;
  return handleApiError(result.status);
};
