import { User } from "~/models/user";

import apiClient from "../shared/client";

export const fetchMe = async (): Promise<User> => {
  const result = await apiClient.get<User>("/users/me");
  if (result.ok) return result.data;
  throw new Error(`Failed to fetch user: ${result.status}`);
};
