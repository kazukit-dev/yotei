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
    return this._acquireLock(async () => {
      await this._signin(data);
    });
  }

  public async signup(data: { name: string; email: string; password: string }) {
    return await this._acquireLock(async () => {
      this._signup(data);
    });
  }

  public async signout() {
    return this._acquireLock(async () => {
      await this._signout();
    });
  }

  public async refreshToken() {
    return this._acquireLock(async () => {
      await this._refreshToken();
    });
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
      throw new AuthError("Refresh token is empty");
    }
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
    if (!res.ok) {
      this._clearSession();
      throw new AuthError("Token refresh error");
    }
    const tokens = await res.json();
    this._saveSession(tokens);
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
        "content-type": "application/json; charset=utf-8",
      },
    });
    if (!res.ok) {
      throw new AuthError("Failed to signin");
    }
    const tokens = await res.json();
    this._saveSession(tokens);
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
        "content-type": "application/json; charset=utf-8",
      },
    });
    if (!res.ok) {
      throw new AuthError("Failed to signup");
    }
  }

  private async _signout() {
    const url = new URL("/auth/signout", this.baseURL);
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new AuthError("Refresh token is empty");
    }
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
    if (!res.ok) {
      throw new AuthError("Failed to signout");
    }
    this._clearSession();
  }

  private _saveSession(tokens: {
    access_token: string;
    refresh_token: string;
  }) {
    sessionStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
  }

  private _clearSession() {
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}
