import React from 'react';
import { Calendar as CalendarIcon, Clock, Video, User, Briefcase, CheckCircle, XCircle } from 'lucide-react';

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
      status: 'Upcoming'
    },
    {
      id: 2,
      candidate: 'Sarah Jenkins',
      role: 'Warehouse Manager',
      time: '1:30 PM - 2:00 PM',
      date: 'Today',
      type: 'Phone Screen',
      interviewer: 'You',
      status: 'Upcoming'
    },
    {
      id: 3,
      candidate: 'David Rodriguez',
      role: 'Senior Frontend Developer',
      time: '4:00 PM - 5:00 PM',
      date: 'Tomorrow',
      type: 'Video Call',
      interviewer: 'Alex Mercer',
      status: 'Scheduled'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Interviews</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming candidate interviews and screens.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> Schedule
          </h2>
          
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div key={interview.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                      {interview.candidate.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{interview.candidate}</h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-4 h-4" /> {interview.role}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-medium">
                        <span className="flex items-center gap-1.5 text-foreground bg-muted px-2 py-1 rounded-md">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" /> {interview.date}
                        </span>
                        <span className="flex items-center gap-1.5 text-foreground bg-muted px-2 py-1 rounded-md">
                          <Clock className="w-4 h-4 text-muted-foreground" /> {interview.time}
                        </span>
                        <span className="flex items-center gap-1.5 text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">
                          <Video className="w-4 h-4" /> {interview.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors w-full md:w-auto">
                      Join Call
                    </button>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> with {interview.interviewer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Stats & Actions */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Today's Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Interviews</span>
                <span className="font-bold text-lg">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-bold text-lg text-green-500">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-bold text-lg text-blue-500">2</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 border border-border rounded-xl p-5 text-center">
            <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">Sync your calendar</h3>
            <p className="text-sm text-muted-foreground mb-4">Connect Google or Outlook to manage availability automatically.</p>
            <button className="w-full bg-background border border-input text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              Connect Calendar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
