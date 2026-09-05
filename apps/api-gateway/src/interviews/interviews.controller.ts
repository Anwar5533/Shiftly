import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('interviews')
@Controller('interviews')
export class InterviewsController {
  private interviews = [
    {
      id: 1,
      candidate: 'Michael Chen',
      role: 'Senior Frontend Developer',
      time: '10:00 AM - 11:00 AM',
      date: 'Today',
      type: 'Video Call',
      interviewer: 'Alex Mercer',
      status: 'Upcoming',
    },
    {
      id: 2,
      candidate: 'Sarah Jenkins',
      role: 'Warehouse Manager',
      time: '1:30 PM - 2:00 PM',
      date: 'Today',
      type: 'Phone Screen',
      interviewer: 'You',
      status: 'Upcoming',
    },
    {
      id: 3,
      candidate: 'David Rodriguez',
      role: 'Senior Frontend Developer',
      time: '4:00 PM - 5:00 PM',
      date: 'Tomorrow',
      type: 'Video Call',
      interviewer: 'Alex Mercer',
      status: 'Scheduled',
    },
  ];

  @Get()
  @ApiOperation({ summary: 'Get all interviews' })
  getInterviews() {
    return { data: this.interviews };
  }
}
