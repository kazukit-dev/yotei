import { queryClient } from "~/libs/query-client";
import { User } from "~/models/user";

export const userKey = {
  me: () => ["user", "me"] as const,
} as const;

export const getMeCache = (): User | null => {
  const cacheKey = userKey.me();
  const cache = queryClient.getQueryData(cacheKey);
  return cache as User | null;
};

export const setMeCache = (data: User) => {
  const cacheKey = userKey.me();
  queryClient.setQueryData(cacheKey, data);
};
