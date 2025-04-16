import { API_URL } from "~/config";
import { Auth } from "~/libs/auth";

const auth = new Auth(API_URL);

export const getAuth = () => {
  return auth;
};
