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
      const currentShift = shifts.find(s => s.id === id);
      if (currentShift) {
        setShift(currentShift);
      } else {
        setError('Shift not found or you do not have permission.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shift.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && user?.role === 'WORKER') {
      fetchShift();
    }
  }, [id, user]);

  const handleClockIn = async () => {
    if (!shift) return;
    setIsProcessing(true);
    try {
      const updatedShift = await shiftsApi.clockIn(shift.id, { city: 'Worker Location' });
      setShift(updatedShift);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to clock in');
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
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to clock out');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="bg-card border border-dashed border-border rounded-xl py-12">
          <p className="text-destructive font-medium text-lg">{error || 'Shift not found'}</p>
          <button 
            className="mt-4 px-4 py-2 bg-muted text-foreground rounded-lg"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <button 
        className="mb-6 -ml-2 flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent rounded-md hover:bg-muted"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-8 border-b border-border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{shift.job?.title || 'Shift'}</h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" /> {shift.job?.employer?.companyName || 'Employer'}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-bold rounded-full ${
              shift.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary border border-primary/20 animate-pulse' : 
              shift.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 
              'bg-muted text-muted-foreground'
            }`}>
              {shift.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Scheduled Start</p>
              <p className="font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {new Date(shift.scheduledStart).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Scheduled End</p>
              <p className="font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {new Date(shift.scheduledEnd).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {shift.status === 'SCHEDULED' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Play className="w-8 h-8 text-primary ml-1" />
              </div>
              <h2 className="text-xl font-bold mb-2">Ready to start your shift?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Make sure you are at the correct location before clocking in.</p>
              
              <button 
                onClick={handleClockIn}
                disabled={isProcessing}
                className="w-full sm:w-auto px-12 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 text-lg flex items-center justify-center gap-3 mx-auto"
              >
                <Play className="w-5 h-5 fill-current" />
                {isProcessing ? 'Processing...' : 'Clock In Now'}
              </button>
            </div>
          )}

          {shift.status === 'IN_PROGRESS' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4 animate-pulse">
                <Clock className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Shift in Progress</h2>
              <p className="text-muted-foreground mb-6">You clocked in at {new Date(shift.actualStart!).toLocaleTimeString()}</p>
              
              <div className="max-w-md mx-auto mb-8 text-left">
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" /> Add Notes (Optional)
                </label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any notes about this shift..."
                  className="w-full h-24 p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <button 
                onClick={handleClockOut}
                disabled={isProcessing}
                className="w-full sm:w-auto px-12 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-md shadow-red-500/20 disabled:opacity-50 text-lg flex items-center justify-center gap-3 mx-auto"
              >
                <Square className="w-5 h-5 fill-current" />
                {isProcessing ? 'Processing...' : 'Clock Out'}
              </button>
            </div>
          )}

          {shift.status === 'COMPLETED' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Shift Completed</h2>
              <p className="text-muted-foreground mb-8">Great job! Your hours have been logged.</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left mb-8">
                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Clock In</p>
                  <p className="font-medium">{new Date(shift.actualStart!).toLocaleTimeString()}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Clock Out</p>
                  <p className="font-medium">{new Date(shift.actualEnd!).toLocaleTimeString()}</p>
                </div>
                <div className="col-span-2 p-4 rounded-xl border border-primary/20 bg-primary/5 text-center">
                  <p className="text-xs text-primary uppercase font-bold tracking-wider mb-1">Total Hours</p>
                  <p className="text-2xl font-bold text-primary">{shift.hoursWorked}h</p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/dashboard/worker')}
                className="px-8 py-3 bg-card border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
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
