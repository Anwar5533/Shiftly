/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { DocumentType } from '@prisma/client';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  async submitKyc(
    @Request() req: any,
    @Body()
    body: {
      documents: {
        type: DocumentType;
        url: string;
        fileName: string;
        fileSize: number;
      }[];
    },
  ) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.kycService.submitKyc(req.user.id, body.documents);
  }

  @Get('status')
  async getKycStatus(@Request() req: any) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.kycService.getKycStatus(req.user.id);
  }
}
