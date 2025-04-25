import { User } from "~/models/user";

import { getMeCache, setMeCache } from "./cache";
import { fetchMe } from "./function";

export const getMe = async (): Promise<User> => {
  const cache = getMeCache();
  if (cache) return cache;
  const me = await fetchMe();
  setMeCache(me);
  return me;
};
