let accessTokenInMemory: string | null = null;

export const tokenService = {
  setAccessToken(token: string) {
    accessTokenInMemory = token;
  },
  getAccessToken(): string | null {
    return accessTokenInMemory;
  },
  clearAccessToken() {
    accessTokenInMemory = null;
  }
};