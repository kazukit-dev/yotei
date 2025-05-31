const getAuthManager = (storage: Storage = localStorage) => {
  const base64URLEncode = (buffer: Uint8Array<ArrayBuffer>): string => {
    return btoa(String.fromCharCode(...buffer))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
  };

  const generateCodeChallenge = async (
    verifier: string,
    method: "plain" | "S256" = "S256",
  ) => {
    if (method === "plain") return verifier;
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return base64URLEncode(new Uint8Array(digest));
  };

  const generateState = (): string => {
    return crypto.randomUUID();
  };

  const begin = async () => {
    const codeChallengeMethod = "S256" as const;
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(
      codeVerifier,
      codeChallengeMethod,
    );
    const state = generateState();

    return {
      codeChallengeMethod,
      codeChallenge,
      codeVerifier,
      state,
    };
  };

  const commit = (options: { codeVerifier: string; state: string }) => {
    storage.setItem("code_verifier", options.codeVerifier);
    storage.setItem("state", options.state);
  };

  const restore = () => {
    const codeVerifier = storage.getItem("code_verifier");
    const state = storage.getItem("state");

    return {
      codeVerifier,
      state,
    };
  };

  const clear = () => {
    storage.removeItem("code_verifier");
    storage.removeItem("state");
  };

  return {
    begin,
    commit,
    restore,
    clear,
  };
};

const buildAuthorizeUrl = (
  baseUrl: URL,
  params: {
    clientId: string;
    codeChallenge: string;
    codeChallengeMethod: "S256" | "plain";
    responseType: "code";
    redirectUri: string;
    scope: string;
    state: string;
  },
) => {
  const url = new URL(baseUrl);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", params.codeChallengeMethod);
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("response_type", params.responseType);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", params.scope);
  url.searchParams.set("state", params.state);

  return url.toString();
};

type AuthorizeOptions = {
  rootUrl: URL;
  endpoint: string;
  clientId: string;
  responseType: "code";
  redirectUri: string;
  scope: string;
  redirect: (url: string) => void;
};

export const authorize = async ({
  endpoint,
  rootUrl,
  clientId,
  responseType,
  redirectUri,
  scope,
  redirect,
}: AuthorizeOptions): Promise<void> => {
  const manager = getAuthManager();

  try {
    const url = new URL(endpoint, rootUrl);

    const { codeChallenge, codeChallengeMethod, codeVerifier, state } =
      await manager.begin();

    const authorizeUrl = buildAuthorizeUrl(url, {
      clientId,
      responseType,
      codeChallenge,
      codeChallengeMethod,
      redirectUri,
      state,
      scope,
    });

    manager.commit({ codeVerifier, state });

    return redirect(authorizeUrl);
  } catch (e) {
    manager.clear();
    throw e;
  }
};

type LoginOption = {
  options: {
    state?: string | null;
    code?: string | null;
  };
  callback: (options: { code: string; codeVerifier: string }) => Promise<void>;
};

export const login = async ({ options, callback }: LoginOption) => {
  const { code, state } = options;

  const manager = getAuthManager();
  const { codeVerifier, state: storedState } = manager.restore();

  try {
    if (!code) {
      throw new Error("Code is empty");
    }
    if (!codeVerifier) {
      throw new Error("Missing codeVerifier in storage");
    }
    if (!storedState) {
      throw new Error("Missing state in storage");
    }

    if (state !== storedState) {
      throw new Error("Invalid state");
    }

    await callback({ code, codeVerifier });
  } finally {
    manager.clear();
  }
};
