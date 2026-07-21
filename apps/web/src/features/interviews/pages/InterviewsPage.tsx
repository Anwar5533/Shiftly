import React from 'react';
import { Calendar as CalendarIcon, Clock, Video, User, Briefcase } from 'lucide-react';

export default function InterviewsPage(): React.ReactElement {
  const interviews = [
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Interviews</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your upcoming candidate interviews and screens.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Col: Schedule List */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarIcon className="h-5 w-5 text-primary" /> Schedule
          </h2>

          <div className="space-y-3">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {interview.candidate.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {interview.candidate}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" /> {interview.role}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-medium">
                        <span className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-foreground">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />{' '}
                          {interview.date}
                        </span>
                        <span className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-foreground">
                          <Clock className="h-4 w-4 text-muted-foreground" /> {interview.time}
                        </span>
                        <span className="flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-blue-500">
                          <Video className="h-4 w-4" /> {interview.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 md:flex-col md:items-end">
                    <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:w-auto">
                      Join Call
                    </button>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" /> with {interview.interviewer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Stats & Actions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-semibold text-foreground">Today's Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Interviews</span>
                <span className="text-lg font-bold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="text-lg font-bold text-green-500">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="text-lg font-bold text-blue-500">2</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-5 text-center">
            <CalendarIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="mb-1 font-medium text-foreground">Sync your calendar</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Connect Google or Outlook to manage availability automatically.
            </p>
            <button className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Connect Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
