const API_URL = import.meta.env.VITE_API_URL || "";

export const signin = async (data: { code: string; codeVerifier: string }) => {
  const url = new URL("/auth/signin", API_URL);

  const request = new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: data.code,
      code_verifier: data.codeVerifier,
    }),
  });

  const res = await fetch(request);
  if (!res.ok) {
    throw new Error("Failed to logged in");
  }
  return;
};
