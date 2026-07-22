/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get('my-shifts')
  @Roles('WORKER')
  getMyShifts(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.getMyShifts(req.user.id);
  }

  @Post(':id/clock-in')
  @Roles('WORKER')
  clockIn(
    @Request() req: any,
    @Param('id') id: string,
    @Body('location') location: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.clockIn(req.user.id, id, location);
  }

  @Post(':id/clock-out')
  @Roles('WORKER')
  clockOut(
    @Request() req: any,
    @Param('id') id: string,
    @Body('location') location: any,
    @Body('notes') notes?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.shiftsService.clockOut(req.user.id, id, location, notes);
  }
}
