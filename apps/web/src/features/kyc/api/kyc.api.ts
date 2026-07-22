 
import api from '@/shared/lib/api';
import type { ApiResponse } from '@shiftly/shared-types';

export type DocumentTypeEnum =
  | 'PASSPORT'
  | 'NATIONAL_ID'
  | 'DRIVERS_LICENSE'
  | 'RESIDENCE_PERMIT'
  | 'PROOF_OF_ADDRESS'
  | 'BUSINESS_REGISTRATION'
  | 'RESUME';

export interface DocumentUploadResponse {
  url: string;
}

export interface KycSubmissionPayload {
  documents: {
    type: DocumentTypeEnum;
    url: string;
    fileName: string;
    fileSize: number;
  }[];
}

export interface KycStatusResponse {
  status: 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
}

export const kycApi = {
  uploadDocument: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<DocumentUploadResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  submitKyc: async (payload: KycSubmissionPayload): Promise<Record<string, unknown>> => {
    const response = await api.post<ApiResponse<Record<string, unknown>>>('/kyc/submit', payload);
    return response.data.data;
  },

  getKycStatus: async (): Promise<KycStatusResponse> => {
    const response = await api.get<KycStatusResponse>('/kyc/status');
    return response.data;
  },
};
