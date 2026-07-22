import api from '@/shared/lib/api';
import type { ApiResponse, UserRole } from '@shiftly/shared-types';

interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

interface OtpVerifyResponse extends TokenResponse {
  isNewUser: boolean;
}

export const authApi = {
  sendOtp: async (phone: string): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/otp/send', { phone });
    return res.data.data;
  },

  verifyOtp: async (phone: string, otp: string): Promise<OtpVerifyResponse> => {
    const res = await api.post<ApiResponse<OtpVerifyResponse>>('/auth/otp/verify', {
      phone,
      otp,
    });
    return res.data.data;
  },

  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<TokenResponse> => {
    const res = await api.post<ApiResponse<TokenResponse>>('/auth/register', data);
    return res.data.data;
  },

  loginEmail: async (email: string, password: string): Promise<TokenResponse> => {
    const res = await api.post<ApiResponse<TokenResponse>>('/auth/login', { email, password });
    return res.data.data;
  },

  refreshToken: async (): Promise<TokenResponse> => {
    const res = await api.post<ApiResponse<TokenResponse>>('/auth/refresh-token');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await api.delete<ApiResponse<void>>('/auth/session');
  },
};
