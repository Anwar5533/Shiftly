import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { JwtPayload } from '@shiftly/shared-types';
import { setAccessToken } from '@/shared/lib/api';

interface AuthState {
  user: JwtPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true on startup — resolves after silent token refresh in useAuthInit
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<JwtPayload>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;

// Thunk to handle login success
import type { Dispatch } from '@reduxjs/toolkit';
export const loginSuccess = (user: JwtPayload, accessToken: string) => (dispatch: Dispatch) => {
  setAccessToken(accessToken);
  dispatch(setUser(user));
};

export default authSlice.reducer;
