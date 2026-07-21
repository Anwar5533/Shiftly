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
    return this.kycService.submitKyc(req.user.id, body.documents);
  }

  @Get('status')
  async getKycStatus(@Request() req: any) {
    return this.kycService.getKycStatus(req.user.id);
  }
}
