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
  login: async (data: { email?: string; phone?: string; password: string }): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/login', data);
    return res.data.data;
  },

  resendOtp: async (data: { email?: string; phone?: string }): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/otp/send', data);
    return res.data.data;
  },

  verifyOtp: async (data: { email?: string; phone?: string; otp: string }): Promise<OtpVerifyResponse> => {
    const res = await api.post<ApiResponse<OtpVerifyResponse>>('/auth/otp/verify', data);
    return res.data.data;
  },

  register: async (data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/register', data);
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
