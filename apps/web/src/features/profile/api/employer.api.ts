import api from '@/shared/lib/api';
import type { EmployerProfile, ApiResponse } from '@shiftly/shared-types';

export interface EmployerDashboardStats {
  activeJobs: number;
  totalApplications: number;
  totalShifts: number;
  totalDepartments: number;
  profileCompletion: number;
  rating: number;
  totalSpent: number;
}

export interface Department {
  id: string;
  name: string;
  headCount: number;
}

export const employerApi = {
  getProfile: async (): Promise<EmployerProfile> => {
    const response = await api.get<ApiResponse<EmployerProfile>>('/employers/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<EmployerProfile>): Promise<EmployerProfile> => {
    const response = await api.patch<ApiResponse<EmployerProfile>>('/employers/profile', data);
    return response.data.data;
  },

  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get<ApiResponse<Department[]>>('/employers/departments');
    return response.data.data;
  },

  addDepartment: async (name: string): Promise<Department> => {
    const response = await api.post<ApiResponse<Department>>('/employers/departments', { name });
    return response.data.data;
  },

  getDashboardStats: async (): Promise<EmployerDashboardStats> => {
    const response = await api.get<ApiResponse<EmployerDashboardStats>>('/employers/dashboard');
    return response.data.data;
  },
};
