import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsApi } from '../../jobs/api/shifts.api';
import { format } from 'date-fns';
import { ReviewModal } from '@/features/reviews/components/ReviewModal';

interface TimesheetView {
  id: string;
  status: string;
  hoursWorked: number;
  notes?: string;
  shift: {
    jobId: string;
    workerId: string;
    scheduledStart: string;
    job: { title: string };
    worker: { user: { email: string } };
  };
}

export function TimesheetApprovalPage() {
  const queryClient = useQueryClient();
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    jobId: string;
    revieweeId: string;
  } | null>(null);

  const { data: timesheets, isLoading } = useQuery({
    queryKey: ['employer-timesheets'],
    queryFn: shiftsApi.getEmployerTimesheets,
  });

  const approveMutation = useMutation({
    mutationFn: shiftsApi.approveTimesheet,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employer-timesheets'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      shiftsApi.rejectTimesheet(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employer-timesheets'] });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading timesheets...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Timesheet Approvals</h1>
        <p className="mt-1 text-muted-foreground">
          Review and approve completed shifts from workers.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {!timesheets || timesheets.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No timesheets pending review.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(timesheets as unknown as TimesheetView[]).map((ts: TimesheetView) => (
              <div
                key={ts.id}
                className="flex flex-col justify-between gap-6 p-6 transition-colors hover:bg-muted/30 md:flex-row md:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {ts.shift.worker.user.email?.charAt(0).toUpperCase() || 'W'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {ts.shift.job.title} - {ts.shift.worker.user.email}
                    </h3>
                    <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                      <p>
                        Hours Worked:{' '}
                        <span className="font-medium text-foreground">{ts.hoursWorked}h</span>
                      </p>
                      <p>Date: {format(new Date(ts.shift.scheduledStart), 'MMM d, yyyy')}</p>
                      {ts.notes && <p className="text-xs italic">Note: {ts.notes}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      ts.status === 'APPROVED'
                        ? 'border-green-500/20 bg-green-500/10 text-green-500'
                        : ts.status === 'REJECTED'
                          ? 'border-red-500/20 bg-red-500/10 text-red-500'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {ts.status}
                  </span>
                  {ts.status === 'SUBMITTED' && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) {
                            void rejectMutation.mutate({ id: ts.id, reason });
                          }
                        }}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          void approveMutation.mutate(ts.id);
                        }}
                        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                  {ts.status === 'APPROVED' && (
                    <button
                      onClick={() =>
                        setReviewModalData({
                          isOpen: true,
                          jobId: ts.shift.jobId,
                          revieweeId: ts.shift.workerId,
                        })
                      }
                      className="mt-2 text-xs font-medium text-primary hover:underline"
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
