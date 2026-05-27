import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const storage = {
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, { expires: 7 });
  },

  getToken: () => {
    return Cookies.get(TOKEN_KEY);
  },

  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
  },

  setUser: (user: any) => {
    Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 });
  },

  getUser: () => {
    const user = Cookies.get(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    Cookies.remove(USER_KEY);
  },

  clear: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);
  },
};
