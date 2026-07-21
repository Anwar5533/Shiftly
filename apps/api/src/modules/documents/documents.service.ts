import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
  async uploadDocument(file: any): Promise<string> {
    // In a real application, this would upload the file to S3 or Google Cloud Storage.
    // For this phase, we mock the upload and return a fake URL.
    const fileExtension = file?.originalname?.split('.').pop() || 'pdf';
    return `https://storage.shiftly.app/docs/${randomUUID()}.${fileExtension}`;
  }
}
