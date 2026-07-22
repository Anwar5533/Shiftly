/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, Play, Square, FileText, CheckCircle2 } from 'lucide-react';
import { shiftsApi } from '../api/shifts.api';
import type { Shift } from '../api/shifts.api';
import { useAppSelector } from '@/app/store';

export default function ActiveShiftPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [shift, setShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const fetchShift = async () => {
    setIsLoading(true);
    try {
      const shifts = await shiftsApi.getMyShifts();
      const currentShift = shifts.find((s) => s.id === id);
      if (currentShift) {
        setShift(currentShift);
      } else {
        setError('Shift not found or you do not have permission.');
      }
    } catch (_error: any) {
      const err = _error as import('axios').AxiosError<Record<string, unknown>>;
      setError(_error.response?.data?.message || 'Failed to load shift.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && user?.role === 'WORKER') {
      void fetchShift();
    }
  }, [id, user]);

  const handleClockIn = async () => {
    if (!shift) return;
    setIsProcessing(true);
    try {
      const updatedShift = await shiftsApi.clockIn(shift.id, { city: 'Worker Location' });
      setShift(updatedShift);
    } catch (_error: any) {
      const err = _error as import('axios').AxiosError<Record<string, unknown>>;
      alert(_error.response?.data?.message || 'Failed to clock in');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClockOut = async () => {
    if (!shift) return;
    setIsProcessing(true);
    try {
      const updatedShift = await shiftsApi.clockOut(shift.id, { city: 'Worker Location' }, notes);
      await shiftsApi.submitTimesheet(shift.id, notes);
      setShift(updatedShift);
      alert('Shift completed and timesheet submitted successfully!');
    } catch (_error: any) {
      const err = _error as import('axios').AxiosError<Record<string, unknown>>;
      alert(_error.response?.data?.message || 'Failed to clock out');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-xl border border-dashed border-border bg-card py-12">
          <p className="text-lg font-medium text-destructive">{error || 'Shift not found'}</p>
          <button
            className="mt-4 rounded-lg bg-muted px-4 py-2 text-foreground"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button
        className="-ml-2 mb-6 flex items-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-8">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{shift.job?.title || 'Shift'}</h1>
              <p className="mt-1 flex items-center gap-2 font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" /> {shift.job?.employer?.companyName || 'Employer'}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                shift.status === 'IN_PROGRESS'
                  ? 'animate-pulse border border-primary/20 bg-primary/10 text-primary'
                  : shift.status === 'COMPLETED'
                    ? 'border border-green-500/20 bg-green-500/10 text-green-600'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {shift.status.replace('_', ' ')}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Scheduled Start
              </p>
              <p className="flex items-center gap-2 font-medium text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {new Date(shift.scheduledStart).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Scheduled End
              </p>
              <p className="flex items-center gap-2 font-medium text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {new Date(shift.scheduledEnd).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {shift.status === 'SCHEDULED' && (
            <div className="py-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Play className="ml-1 h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-bold">Ready to start your shift?</h2>
              <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                Make sure you are at the correct location before clocking in.
              </p>

              <button
                onClick={handleClockIn}
                disabled={isProcessing}
                className="mx-auto flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-12 py-4 text-lg font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
              >
                <Play className="h-5 w-5 fill-current" />
                {isProcessing ? 'Processing...' : 'Clock In Now'}
              </button>
            </div>
          )}

          {shift.status === 'IN_PROGRESS' && (
            <div className="py-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-red-500/10">
                <Clock className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-foreground">Shift in Progress</h2>
              <p className="mb-6 text-muted-foreground">
                You clocked in at {new Date(shift.actualStart).toLocaleTimeString()}
              </p>

              <div className="mx-auto mb-8 max-w-md text-left">
                <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Add Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any notes about this shift..."
                  className="h-24 w-full resize-none rounded-lg border border-input bg-background p-3 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleClockOut}
                disabled={isProcessing}
                className="mx-auto flex w-full items-center justify-center gap-3 rounded-xl bg-red-500 px-12 py-4 text-lg font-bold text-white shadow-md shadow-red-500/20 transition-all hover:bg-red-600 disabled:opacity-50 sm:w-auto"
              >
                <Square className="h-5 w-5 fill-current" />
                {isProcessing ? 'Processing...' : 'Clock Out'}
              </button>
            </div>
          )}

          {shift.status === 'COMPLETED' && (
            <div className="py-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">Shift Completed</h2>
              <p className="mb-8 text-muted-foreground">Great job! Your hours have been logged.</p>

              <div className="mx-auto mb-8 grid max-w-md grid-cols-2 gap-4 text-left">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Clock In
                  </p>
                  <p className="font-medium">{new Date(shift.actualStart).toLocaleTimeString()}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Clock Out
                  </p>
                  <p className="font-medium">{new Date(shift.actualEnd).toLocaleTimeString()}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                    Total Hours
                  </p>
                  <p className="text-2xl font-bold text-primary">{shift.hoursWorked}h</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard/worker')}
                className="rounded-lg border border-input bg-card px-8 py-3 font-medium text-foreground transition-colors hover:bg-muted"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
