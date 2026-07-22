import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Mail,
  Calendar,
  Star,
  MoreVertical,
  FileText,
  X,
  MessageSquare,
  Clock,
  User,
} from 'lucide-react';

interface Applicant {
  id: number;
  name: string;
  role: string;
  applied: string;
  stage: string;
  matchScore: number;
  avatar: string;
  email: string;
}

export default function ApplicantsPage(): React.ReactElement {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [modalType, setModalType] = useState<'message' | 'schedule' | 'resume' | null>(null);
  const [messageText, setMessageText] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const applicants: Applicant[] = [
    {
      id: 1,
      name: 'Michael Chen',
      role: 'Senior Frontend Developer',
      applied: '2 hours ago',
      stage: 'Interview',
      matchScore: 94,
      avatar: 'M',
      email: 'michael.chen@example.com',
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      role: 'Warehouse Manager',
      applied: '1 day ago',
      stage: 'Screening',
      matchScore: 88,
      avatar: 'S',
      email: 'sarah.j@example.com',
    },
    {
      id: 3,
      name: 'David Rodriguez',
      role: 'Senior Frontend Developer',
      applied: '2 days ago',
      stage: 'Offer',
      matchScore: 97,
      avatar: 'D',
      email: 'd.rodriguez@example.com',
    },
    {
      id: 4,
      name: 'Emily Watson',
      role: 'Delivery Driver',
      applied: '3 days ago',
      stage: 'Rejected',
      matchScore: 45,
      avatar: 'E',
      email: 'emily.watson@example.com',
    },
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Screening':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Interview':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Offer':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const openModal = (app: Applicant, type: 'message' | 'schedule' | 'resume') => {
    setSelectedApplicant(app);
    setModalType(type);
    setMenuOpen(null);
  };

  const closeModal = () => {
    setSelectedApplicant(null);
    setModalType(null);
    setMessageText('');
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    alert(`Message sent to ${selectedApplicant?.name}: "${messageText}"`);
    closeModal();
  };

  const handleScheduleInterview = () => {
    if (!scheduleDate || !scheduleTime) return;
    alert(
      `Interview scheduled with ${selectedApplicant?.name} on ${scheduleDate} at ${scheduleTime}`,
    );
    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Applicants</h1>
          <p className="mt-1 text-muted-foreground">
            Review and manage candidates across all active jobs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applicants.map((app) => (
          <div
            key={app.id}
            className={`group relative rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md ${
              menuOpen === app.id ? 'z-30' : 'z-10'
            }`}
          >
            {/* 3-dots menu */}
            <div className="absolute right-4 top-4">
              <button
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                onClick={() => setMenuOpen(menuOpen === app.id ? null : app.id)}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {menuOpen === app.id && (
                <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => openModal(app, 'message')}
                  >
                    <MessageSquare className="h-4 w-4 text-primary" /> Send Message
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => openModal(app, 'schedule')}
                  >
                    <Clock className="h-4 w-4 text-amber-500" /> Schedule Interview
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => openModal(app, 'resume')}
                  >
                    <FileText className="h-4 w-4 text-blue-500" /> View Resume
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-muted">
                    <User className="h-4 w-4" /> Reject Candidate
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-lg font-bold text-primary">
                {app.avatar}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{app.name}</h3>
                <p className="line-clamp-1 text-sm text-muted-foreground">{app.role}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getStageColor(app.stage)}`}
                  >
                    {app.stage}
                  </span>
                  <span className="text-xs text-muted-foreground">• {app.applied}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
              <div className="flex flex-col">
                <span className="mb-1 text-xs text-muted-foreground">Match Score</span>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  {app.matchScore}%
                </div>
              </div>
              <div className="flex flex-col items-end justify-center">
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:text-primary"
                    title="Send Message"
                    onClick={() => openModal(app, 'message')}
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:text-primary"
                    title="Schedule Interview"
                    onClick={() => openModal(app, 'schedule')}
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20"
                    title="View Resume"
                    onClick={() => openModal(app, 'resume')}
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {modalType &&
        selectedApplicant &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-5">
                <h2 className="text-lg font-semibold text-foreground">
                  {modalType === 'message' && `Message ${selectedApplicant.name}`}
                  {modalType === 'schedule' && `Schedule Interview — ${selectedApplicant.name}`}
                  {modalType === 'resume' && `Resume — ${selectedApplicant.name}`}
                </h2>
                <button
                  onClick={closeModal}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5">
                {modalType === 'message' && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">To</label>
                      <input
                        className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-foreground"
                        value={selectedApplicant.email}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Message
                      </label>
                      <textarea
                        className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={5}
                        placeholder="Type your message here..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Send Message
                    </button>
                  </div>
                )}

                {modalType === 'schedule' && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Date</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Time</label>
                      <input
                        type="time"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Interview Type
                      </label>
                      <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Video Call</option>
                        <option>Phone Call</option>
                        <option>In Person</option>
                      </select>
                    </div>
                    <button
                      onClick={handleScheduleInterview}
                      className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Schedule Interview
                    </button>
                  </div>
                )}

                {modalType === 'resume' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-muted/50 p-8 text-center">
                      <FileText className="mx-auto mb-3 h-16 w-16 text-muted-foreground opacity-50" />
                      <p className="font-medium text-foreground">
                        {selectedApplicant.name}_Resume.pdf
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">PDF Document • 2.4 MB</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => alert('Opening resume preview...')}
                        className="flex-1 rounded-lg bg-primary/10 py-2.5 font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => alert('Downloading resume...')}
                        className="flex-1 rounded-lg bg-primary py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Backdrop click to close menu */}
      {menuOpen !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}
