import React, { useState, useEffect } from 'react';
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
      } catch (err) {
        console.error('Failed to fetch candidates', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => { fetchCandidates(); }, 300);
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
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Candidate Pool</h1>
          <p className="text-muted-foreground mt-1">Search and source from our verified professional network.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by job title, skill, or keyword..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
          />
        </div>
        <div className="relative md:w-64">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Location..." 
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
          />
        </div>
        <button
          onClick={() => setSearchQuery(searchQuery)} // triggers re-search
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          Search
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No candidates found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl font-bold text-primary border border-primary/20 shrink-0">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{candidate.name}</h3>
                    <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
                      <Briefcase className="w-4 h-4" /> {candidate.title}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5 text-sm">
                      <MapPin className="w-4 h-4" /> {candidate.location} • {candidate.experience} exp.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    candidate.status === 'Actively Looking' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    candidate.status === 'Open to Offers' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {candidate.status}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {candidate.rating}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/50">
                <div className="flex flex-wrap gap-2 mb-4">
                  {candidate.skills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-muted text-foreground text-xs font-medium rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openModal(candidate, 'message')}
                    className="flex-1 bg-primary/10 text-primary py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                  <button
                    onClick={() => handleDownloadResume(candidate)}
                    className="flex-1 bg-muted text-foreground py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Resume
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      {modalType === 'message' && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Message {selectedCandidate.name}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Message</label>
                <textarea
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={5}
                  placeholder={`Hi ${selectedCandidate.name}, I'm interested in discussing a potential opportunity...`}
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
          </div>
        </div>
      )}
    </div>
  );
}
