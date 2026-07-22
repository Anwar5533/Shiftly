/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
/**
 * useAuthInit — restores authentication on page refresh.
 *
 * The access token lives in memory (cleared on refresh), but the refresh
 * token lives in an HTTP-only cookie that survives the reload.  This hook
 * calls /auth/refresh-token once on mount to silently re-issue a new access
 * token and re-populate the Redux auth state so the user stays logged in.
 */
import { useEffect } from 'react';
import { useAppDispatch } from '@/app/store';
import { setUser, clearUser, setLoading } from '@/features/auth/store/authSlice';
import { setAccessToken } from '@/shared/lib/api';
import api from '@/shared/lib/api';
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
        const response = await api.post<{ data: { accessToken: string; expiresIn: number } }>(
          '/auth/refresh-token',
        );
        const { accessToken } = response.data.data;
        setAccessToken(accessToken);
        const decodedUser = jwtDecode<JwtPayload>(accessToken);
        dispatch(setUser(decodedUser));
      } catch {
        // No valid refresh token — user must log in
        dispatch(clearUser());
      }
    };

    restoreSession();
  }, []);
}
