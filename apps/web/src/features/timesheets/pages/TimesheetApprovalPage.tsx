import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsApi } from '../../jobs/api/shifts.api';
import { format } from 'date-fns';
import { ReviewModal } from '@/features/reviews/components/ReviewModal';

export function TimesheetApprovalPage() {
  const queryClient = useQueryClient();
  const [reviewModalData, setReviewModalData] = useState<{ isOpen: boolean; jobId: string; revieweeId: string } | null>(null);

  const { data: timesheets, isLoading } = useQuery({
    queryKey: ['employer-timesheets'],
    queryFn: shiftsApi.getEmployerTimesheets,
  });

  const approveMutation = useMutation({
    mutationFn: shiftsApi.approveTimesheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-timesheets'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => shiftsApi.rejectTimesheet(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-timesheets'] });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading timesheets...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Timesheet Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve completed shifts from workers.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {(!timesheets || timesheets.length === 0) ? (
          <div className="p-12 text-center text-muted-foreground">
            No timesheets pending review.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {timesheets.map((ts: any) => (
              <div key={ts.id} className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                    {ts.shift.worker.user.email?.charAt(0).toUpperCase() || 'W'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {ts.shift.job.title} - {ts.shift.worker.user.email}
                    </h3>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p>Hours Worked: <span className="font-medium text-foreground">{ts.hoursWorked}h</span></p>
                      <p>Date: {format(new Date(ts.shift.scheduledStart), 'MMM d, yyyy')}</p>
                      {ts.notes && <p className="italic text-xs">Note: {ts.notes}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    ts.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    ts.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {ts.status}
                  </span>
                  
                  {ts.status === 'SUBMITTED' && (
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) {
                            rejectMutation.mutate({ id: ts.id, reason });
                          }
                        }}
                        className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => approveMutation.mutate(ts.id)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        Approve
                      </button>
                    </div>
                  )}

                  {ts.status === 'APPROVED' && (
                    <button
                      onClick={() => setReviewModalData({ isOpen: true, jobId: ts.shift.jobId, revieweeId: ts.shift.workerId })}
                      className="text-xs font-medium text-primary hover:underline mt-2"
                    >
                      Leave a Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewModalData && (
        <ReviewModal
          isOpen={reviewModalData.isOpen}
          jobId={reviewModalData.jobId}
          revieweeId={reviewModalData.revieweeId}
          targetType="WORKER"
          onClose={() => setReviewModalData(null)}
        />
      )}
    </div>
  );
}
