import React, { useState } from 'react';
import { Mail, Calendar, Star, MoreVertical, FileText, X, MessageSquare, Clock, User } from 'lucide-react';

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
    { id: 1, name: 'Michael Chen', role: 'Senior Frontend Developer', applied: '2 hours ago', stage: 'Interview', matchScore: 94, avatar: 'M', email: 'michael.chen@example.com' },
    { id: 2, name: 'Sarah Jenkins', role: 'Warehouse Manager', applied: '1 day ago', stage: 'Screening', matchScore: 88, avatar: 'S', email: 'sarah.j@example.com' },
    { id: 3, name: 'David Rodriguez', role: 'Senior Frontend Developer', applied: '2 days ago', stage: 'Offer', matchScore: 97, avatar: 'D', email: 'd.rodriguez@example.com' },
    { id: 4, name: 'Emily Watson', role: 'Delivery Driver', applied: '3 days ago', stage: 'Rejected', matchScore: 45, avatar: 'E', email: 'emily.watson@example.com' },
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Screening': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Interview': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Offer': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
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
    alert(`Interview scheduled with ${selectedApplicant?.name} on ${scheduleDate} at ${scheduleTime}`);
    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Applicants</h1>
          <p className="text-muted-foreground mt-1">Review and manage candidates across all active jobs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applicants.map((app) => (
          <div key={app.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow relative group">
            {/* 3-dots menu */}
            <div className="absolute top-4 right-4">
              <button
                className="p-1.5 text-muted-foreground hover:bg-muted rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setMenuOpen(menuOpen === app.id ? null : app.id)}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {menuOpen === app.id && (
                <div className="absolute right-0 top-8 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-40">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                    onClick={() => openModal(app, 'message')}
                  >
                    <MessageSquare className="w-4 h-4 text-primary" /> Send Message
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                    onClick={() => openModal(app, 'schedule')}
                  >
                    <Clock className="w-4 h-4 text-amber-500" /> Schedule Interview
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                    onClick={() => openModal(app, 'resume')}
                  >
                    <FileText className="w-4 h-4 text-blue-500" /> View Resume
                  </button>
                  <div className="border-t border-border my-1" />
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-red-500">
                    <User className="w-4 h-4" /> Reject Candidate
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0">
                {app.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{app.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{app.role}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStageColor(app.stage)}`}>
                    {app.stage}
                  </span>
                  <span className="text-xs text-muted-foreground">• {app.applied}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Match Score</span>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {app.matchScore}%
                </div>
              </div>
              <div className="flex flex-col items-end justify-center">
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors"
                    title="Send Message"
                    onClick={() => openModal(app, 'message')}
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors"
                    title="Schedule Interview"
                    onClick={() => openModal(app, 'schedule')}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    title="View Resume"
                    onClick={() => openModal(app, 'resume')}
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {modalType && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {modalType === 'message' && `Message ${selectedApplicant.name}`}
                {modalType === 'schedule' && `Schedule Interview — ${selectedApplicant.name}`}
                {modalType === 'resume' && `Resume — ${selectedApplicant.name}`}
              </h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {modalType === 'message' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">To</label>
                    <input
                      className="w-full bg-muted border border-input rounded-lg px-3 py-2 text-sm text-foreground"
                      value={selectedApplicant.email}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Message</label>
                    <textarea
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={5}
                      placeholder="Type your message here..."
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              )}

              {modalType === 'schedule' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Time</label>
                    <input
                      type="time"
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Interview Type</label>
                    <select className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Video Call</option>
                      <option>Phone Call</option>
                      <option>In Person</option>
                    </select>
                  </div>
                  <button
                    onClick={handleScheduleInterview}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Schedule Interview
                  </button>
                </div>
              )}

              {modalType === 'resume' && (
                <div className="space-y-4">
                  <div className="bg-muted/50 border border-border rounded-xl p-8 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-foreground font-medium">{selectedApplicant.name}_Resume.pdf</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF Document • 2.4 MB</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => alert('Opening resume preview...')}
                      className="flex-1 bg-primary/10 text-primary py-2.5 rounded-lg font-medium hover:bg-primary/20 transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => alert('Downloading resume...')}
                      className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop click to close menu */}
      {menuOpen !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}
