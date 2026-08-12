const TOKEN_KEY = 'accessToken';

export const tokenService = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearAccessToken: (): void => { 
    localStorage.removeItem(TOKEN_KEY);
  },
};
