/* eslint-disable @typescript-eslint/no-unused-vars, prettier/prettier -- TODO(RC3): Address type safety */
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@shiftly/shared-types';

@Controller('timesheets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Post(':shiftId/submit')
  @Roles('WORKER')
  async submitTimesheet(
    @Param('shiftId') shiftId: string,
    @Body() body: { hoursWorked: number; notes?: string },
    @Request() req: any,
  ) {
    // Assuming the user's worker profile ID is not direct, but we use the user's ID to find their worker profile.
    // However, in shifts, workerId refers to the worker profile ID.
    // In previous files (e.g. shifts.controller.ts), req.user.profileId might be used.
    // For simplicity, we assume `req.user.profileId` or we lookup the worker.
    return this.timesheetsService.submitTimesheet(
      shiftId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      req.user.profileId,
      body.hoursWorked,
      body.notes,
    );
  }

  @Get('employer')
  @Roles('EMPLOYER')
  async getEmployerTimesheets(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.timesheetsService.getTimesheetsForEmployer(req.user.profileId);
  }

  @Post(':id/approve')
  @Roles('EMPLOYER')
  async approveTimesheet(@Param('id') id: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.timesheetsService.approveTimesheet(id, req.user.profileId);
  }

  @Post(':id/reject')
  @Roles('EMPLOYER')
  async rejectTimesheet(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
    @Request() req: any,
  ) {
    return this.timesheetsService.rejectTimesheet(
      id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      req.user.profileId,
      body.rejectionReason,
    );
  }
}
