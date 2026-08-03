import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
  // eslint-disable-next-line @typescript-eslint/require-await -- TODO(RC3): Address type safety
  async uploadDocument(file: any): Promise<string> {
    // In a real application, this would upload the file to S3 or Google Cloud Storage.
    // For this phase, we mock the upload and return a fake URL.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    const fileExtension = file?.originalname?.split('.').pop() || 'pdf';
    return `https://storage.shiftly.app/docs/${randomUUID()}.${fileExtension}`;
  }
}
