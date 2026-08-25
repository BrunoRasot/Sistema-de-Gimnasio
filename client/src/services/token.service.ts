let accessToken: string | null = null;

export const tokenService = {
  getAccessToken: (): string | null => {
    return accessToken;
  },

  setAccessToken: (token: string): void => {
    accessToken = token;
    localStorage.removeItem('accessToken');
  },

  clearAccessToken: (): void => {
    accessToken = null;
    localStorage.removeItem('accessToken');
  },
};
