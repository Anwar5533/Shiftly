/**
 * useAuthInit — restores authentication on page refresh.
 *
 * The access token lives in memory (cleared on refresh), but the refresh
 * token lives in an HTTP-only cookie that survives the reload.  This hook
 * calls /auth/refresh-token once on mount to silently re-issue a new access
 * token and re-populate the Redux auth state so the user stays logged in.
 */
import { useEffect } from 'react';
import { store, useAppDispatch } from '@/app/store';
import { setUser, clearUser, setLoading } from '@/features/auth/store/authSlice';
import { refreshAuthToken } from '@/shared/lib/api';
import { jwtDecode } from '@/features/auth/utils/jwt';
import type { JwtPayload } from '@shiftly/shared-types';

let isInitialized = false;

export function useAuthInit(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isInitialized) return;
    isInitialized = true;

    const restoreSession = async () => {
      dispatch(setLoading(true));
      try {
        const accessToken = await refreshAuthToken();
        const decodedUser = jwtDecode<JwtPayload>(accessToken);
        dispatch(setUser(decodedUser));
      } catch {
        // No valid refresh token — user must log in
        // Prevent race condition: if the user already logged in via UI while
        // this request was in flight, do not clear their state.
        if (!store.getState().auth.isAuthenticated) {
          dispatch(clearUser());
        } else {
          dispatch(setLoading(false));
        }
      }
    };

    void restoreSession();
  }, []);
}
