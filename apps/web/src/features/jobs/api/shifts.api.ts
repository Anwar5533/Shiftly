/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): */
import api from '@/shared/lib/api';
import type { Job, WorkerProfile } from '@shiftly/shared-types';

export interface Shift {
  id: string;
  jobId: string;
  applicationId: string;
  workerId: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  clockInLocation?: any;
  clockOutLocation?: any;
  hoursWorked?: number;
  notes?: string;
  job?: Job;
  worker?: WorkerProfile;
}

export const shiftsApi = {
  getMyShifts: async (): Promise<Shift[]> => {
    const response = await api.get('/shifts/my-shifts');
    return response.data.data;
  },

  clockIn: async (shiftId: string, location?: any): Promise<Shift> => {
    const response = await api.post(`/shifts/${shiftId}/clock-in`, { location });
    return response.data.data;
  },

  clockOut: async (shiftId: string, location?: any, notes?: string): Promise<Shift> => {
    const response = await api.post(`/shifts/${shiftId}/clock-out`, { location, notes });
    return response.data.data;
  },

  submitTimesheet: async (shiftId: string, notes: string): Promise<any> => {
    const response = await api.post(`/shifts/${shiftId}/timesheet`, { notes });
    return response.data.data;
  },

  getMyTimesheets: async (): Promise<any[]> => {
    const response = await api.get('/shifts/my-timesheets');
    return response.data.data;
  },

  getEmployerTimesheets: async (): Promise<any[]> => {
    const response = await api.get('/shifts/employer/timesheets');
    return response.data.data;
  },

  approveTimesheet: async (timesheetId: string): Promise<any> => {
    const response = await api.put(`/shifts/timesheets/${timesheetId}/approve`);
    return response.data.data;
  },

  rejectTimesheet: async (timesheetId: string, reason: string): Promise<any> => {
    const response = await api.put(`/shifts/timesheets/${timesheetId}/reject`, { reason });
    return response.data.data;
  },
};
