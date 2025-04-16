export class AuthError extends Error {}

export class Auth {
  private baseURL: string;
  private pendingProcess: Promise<void>[];
  private locking: boolean;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.pendingProcess = [];
    this.locking = false;
  }

  public isAuthenticated() {
    return !!localStorage.getItem("refresh_token");
  }

  public getAccessToken() {
    return sessionStorage.getItem("access_token");
  }

  public async signin(data: { email: string; password: string }) {
    try {
      return this._acquireLock(async () => {
        await this._signin(data);
      });
    } catch (err: unknown) {
      throw new AuthError("Failed to signin", { cause: err });
    }
  }

  public async signup(data: { name: string; email: string; password: string }) {
    try {
      return await this._acquireLock(async () => {
        this._signup(data);
      });
    } catch (err: unknown) {
      throw new AuthError("Failed to signup", { cause: err });
    }
  }

  public async refreshToken() {
    try {
      return this._acquireLock(async () => {
        await this._refreshToken();
      });
    } catch (err: unknown) {
      throw new AuthError("Failed to refresh token.", { cause: err });
    }
  }

  private async _acquireLock(fn: () => Promise<void>) {
    if (this.locking) {
      const last = this.pendingProcess.length
        ? this.pendingProcess[this.pendingProcess.length - 1]
        : Promise.resolve();
      const result = (async () => {
        await last;
        await fn();
      })();
      this.pendingProcess.push(result);
      return result;
    }
    this.locking = true;

    try {
      const result = await fn();
      const processes = this.pendingProcess;
      await Promise.all(processes);
      this.pendingProcess = this.pendingProcess.slice(0, processes.length);
      return result;
    } finally {
      this.locking = false;
    }
  }

  private async _refreshToken(): Promise<void> {
    const url = new URL("/auth/refresh", this.baseURL);
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("Refresh token is empty");
    }
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      headers: {
        "content-type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("Token refresh error");
    }
    const tokens = await res.json();
    this._saveTokens(tokens);
  }

  private async _signin(data: {
    email: string;
    password: string;
  }): Promise<void> {
    const url = new URL("/auth/signin", this.baseURL);

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("auth error");
    }
    const tokens = await res.json();
    this._saveTokens(tokens);
  }

  private async _signup(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const url = new URL("/auth/signup", this.baseURL);

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("auth error");
    }
  }

  private _saveTokens(tokens: { access_token: string; refresh_token: string }) {
    sessionStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
  }
}
