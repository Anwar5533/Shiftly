import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller({ path: 'shifts', version: '1' })
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get('my')
  async getMyShifts(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.shiftsService.getMyShifts(req.user.id);
  }

  @Get('my-timesheets')
  async getMyTimesheets(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.shiftsService.getMyTimesheets(req.user.id);
  }

  @Get('employer/timesheets')
  async getEmployerTimesheets(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.shiftsService.getTimesheetsForEmployer(req.user.id);
  }

  @Get(':id')
  async getShift(@Param('id') id: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.shiftsService.getShiftById(id, req.user.id);
  }

  @Post(':id/clock-in')
  async clockIn(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.shiftsService.clockIn(id, req.user.id, body?.location);
  }

  @Post(':id/clock-out')
  async clockOut(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.shiftsService.clockOut(id, req.user.id, body?.location);
  }

  @Post(':id/timesheet')
  async submitTimesheet(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.shiftsService.submitTimesheet(id, req.user.id, body?.notes);
  }

  @Put('timesheets/:id/approve')
  async approveTimesheet(@Param('id') id: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.shiftsService.approveTimesheet(id, req.user.id);
  }

  @Put('timesheets/:id/reject')
  async rejectTimesheet(
    @Param('id') id: string,
    @Request() req: any,
    @Body('reason') reason: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.shiftsService.rejectTimesheet(id, req.user.id, reason);
  }
}
