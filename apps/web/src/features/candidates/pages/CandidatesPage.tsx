import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, Briefcase, Star, Download, MessageSquare, X } from 'lucide-react';
import { candidatesApi, type Candidate } from '../api/candidates.api';

export default function CandidatesPage(): React.ReactElement {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [modalType, setModalType] = useState<'message' | 'resume' | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const data = await candidatesApi.searchCandidates(searchQuery);
        setCandidates(data);
      } catch (_error) {
        console.error('Failed to fetch candidates', _error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      void fetchCandidates();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const openModal = (candidate: Candidate, type: 'message' | 'resume') => {
    setSelectedCandidate(candidate);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedCandidate(null);
    setModalType(null);
    setMessageText('');
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    alert(`Message sent to ${selectedCandidate?.name}!`);
    closeModal();
  };

  const handleDownloadResume = (candidate: Candidate) => {
    const content = `Resume of ${candidate.name}\nTitle: ${candidate.title}\nLocation: ${candidate.location}\nExperience: ${candidate.experience}\nSkills: ${candidate.skills.join(', ')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidate.name.replace(' ', '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Candidate Pool</h1>
          <p className="mt-1 text-muted-foreground">
            Search and source from our verified professional network.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by job title, skill, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative md:w-64">
          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Location..."
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setSearchQuery(searchQuery)} // triggers re-search
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Search
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-muted-foreground">
            No candidates found{searchQuery ? ` for "${searchQuery}"` : ''}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-bold text-primary">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{candidate.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" /> {candidate.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {candidate.location} • {candidate.experience}{' '}
                      exp.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      candidate.status === 'Actively Looking'
                        ? 'border-green-500/20 bg-green-500/10 text-green-500'
                        : candidate.status === 'Open to Offers'
                          ? 'border-blue-500/20 bg-blue-500/10 text-blue-500'
                          : 'border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    {candidate.status}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {candidate.rating}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-border/50 pt-4">
                <div className="mb-4 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openModal(candidate, 'message')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    <MessageSquare className="h-4 w-4" /> Message
                  </button>
                  <button
                    onClick={() => handleDownloadResume(candidate)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
                  >
                    <Download className="h-4 w-4" /> Resume
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      {modalType === 'message' &&
        selectedCandidate &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-5">
                <h2 className="text-lg font-semibold text-foreground">
                  Message {selectedCandidate.name}
                </h2>
                <button
                  onClick={closeModal}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Message</label>
                  <textarea
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={5}
                    placeholder={`Hi ${selectedCandidate.name}, I'm interested in discussing a potential opportunity...`}
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
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
