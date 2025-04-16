import * as jose from "jose";

interface JWTHeader {
  alg: string; // 署名アルゴリズム（例："HS256", "RS256", "none"など）
  typ?: string; // トークンのタイプ（通常は "JWT"）
  kid?: string; // 鍵識別子（複数の鍵がある場合に使用）
  [propName: string]: unknown; // その他の任意のフィールド
}

interface JWTPayload {
  // 登録済みクレーム（Registered Claims）
  iss?: string; // 発行者（issuer）
  sub?: string; // 主題（subject）
  aud?: string | string[]; // 受信者（audience）
  exp?: number; // 有効期限（expiration time）- UNIXタイムスタンプ
  nbf?: number; // 有効開始日時（not before） - UNIXタイムスタンプ
  iat?: number; // 発行日時（issued at） - UNIXタイムスタンプ
  jti?: string; // JWT ID（一意の識別子）

  // 公開クレーム（Public Claims）と非公開クレーム（Private Claims）
  [propName: string]: unknown; // その他のカスタムクレーム
}

interface DecodedJWT<P = Record<string, unknown>> {
  header: JWTHeader;
  payload: P & JWTPayload;
}

export const signJwt =
  (secret: string) =>
  async (
    payload: Record<string, string>,
    expirationTime: string | Date | number,
  ): Promise<string> => {
    const encodedSecret = new TextEncoder().encode(secret);
    const jwt = await new jose.SignJWT(payload)
      .setExpirationTime(expirationTime)
      .setProtectedHeader({ alg: "HS256" })
      .sign(encodedSecret);
    return jwt;
  };

export const verifyJwt =
  <P = unknown>(secret: string) =>
  async (token: string): Promise<DecodedJWT<P>> => {
    const encodedSecret = new TextEncoder().encode(secret);

    const decoded = await jose.jwtVerify<P>(token, encodedSecret);
    return {
      payload: decoded.payload,
      header: decoded.protectedHeader,
    };
  };
