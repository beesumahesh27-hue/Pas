import { createSlice } from '@reduxjs/toolkit';

const TOKEN_KEY = 'pas_token';
const USER_KEY  = 'pas_user';

const loadInitial = () => {
  try {
    // Drop any session persisted under the old localStorage scheme so existing
    // users aren't auto-authenticated — they must sign in again on each new
    // browser session. Auth now lives in sessionStorage (cleared on tab close).
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    const token = sessionStorage.getItem(TOKEN_KEY) || null;
    const userRaw = sessionStorage.getItem(USER_KEY);
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const initialState = {
  ...loadInitial(),
  loading: false,
  error:   null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error   = null;
    },
    authSuccess: (state, action) => {
      const { token, user } = action.payload;
      state.token   = token;
      state.user    = user;
      state.loading = false;
      state.error   = null;
      try {
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch { /* ignore quota / disabled storage */ }
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error   = action.payload || 'Authentication failed';
    },
    logout: (state) => {
      state.token = null;
      state.user  = null;
      state.error = null;
      try {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      } catch { /* ignore */ }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      try {
        sessionStorage.setItem(USER_KEY, JSON.stringify(action.payload));
      } catch { /* ignore */ }
    },
  },
});

export const { authStart, authSuccess, authFailure, logout, setUser } = authSlice.actions;
export default authSlice.reducer;

export const TOKEN_STORAGE_KEY = TOKEN_KEY;
