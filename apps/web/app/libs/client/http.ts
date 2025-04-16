import { Hooks } from "./hook";

export const http =
  (hooks?: Hooks) =>
  async (reqObj: Request): Promise<Response> => {
    let _reqObj = reqObj.clone();

    if (hooks?.beforeRequestHooks) {
      for (const hook of hooks.beforeRequestHooks) {
        const processedReq = await hook(_reqObj);
        if (processedReq instanceof Request) {
          _reqObj = processedReq;
        }
      }
    }

    const res = await _http(_reqObj);

    let _res = res.clone();
    if (hooks?.afterResponseHooks) {
      for (const hook of hooks.afterResponseHooks) {
        const processedRes = await hook(_reqObj.clone(), _res);
        if (processedRes instanceof Response) {
          _res = processedRes;
        }
      }
    }

    return _res;
  };

const _http = async (reqObj: Request): Promise<Response> => {
  const res = await fetch(reqObj);
  return res;
};
