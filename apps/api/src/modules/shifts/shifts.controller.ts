/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get('my')
  async getMyShifts(@Request() req: any) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.getMyShifts(req.user.id);
  }

  @Get('my-timesheets')
  async getMyTimesheets(@Request() req: any) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.getMyTimesheets(req.user.id);
  }

  @Get('employer/timesheets')
  async getEmployerTimesheets(@Request() req: any) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.getTimesheetsForEmployer(req.user.id);
  }

  @Get(':id')
  async getShift(@Param('id') id: string, @Request() req: any) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.getShiftById(id, req.user.id);
  }

  @Post(':id/clock-in')
  async clockIn(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.clockIn(id, req.user.id, body.location);
  }

  @Post(':id/clock-out')
  async clockOut(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.clockOut(id, req.user.id, body.location);
  }

  @Post(':id/timesheet')
  async submitTimesheet(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { notes: string },
  ) {
    return this.shiftsService.submitTimesheet(
      id,
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      req.user.id,
      body.notes || '',
    );
  }

  @Put('timesheets/:id/approve')
  async approveTimesheet(@Param('id') id: string, @Request() req: any) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.approveTimesheet(id, req.user.id);
  }

  @Put('timesheets/:id/reject')
  async rejectTimesheet(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { reason: string },
  ) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.rejectTimesheet(id, req.user.id, body.reason);
  }
}
