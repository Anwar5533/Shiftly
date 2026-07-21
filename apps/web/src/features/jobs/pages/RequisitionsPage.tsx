import React, { useState } from 'react';
import { Target, Clock, Building, Briefcase, Plus, X, Users, Edit, Trash2 } from 'lucide-react';

interface Requisition {
  id: string;
  title: string;
  company: string;
  openings: number;
  filled: number;
  priority: string;
  daysOpen: number;
  hiringManager: string;
}

export default function RequisitionsPage(): React.ReactElement {
  const [requisitions, setRequisitions] = useState<Requisition[]>([
    { id: 'REQ-1029', title: 'Senior Frontend Developer', company: 'TechCorp Inc.', openings: 2, filled: 0, priority: 'High', daysOpen: 14, hiringManager: 'Alex Mercer' },
    { id: 'REQ-1030', title: 'Warehouse Manager', company: 'Amazon Fulfillment', openings: 1, filled: 0, priority: 'Medium', daysOpen: 5, hiringManager: 'Sarah Jenkins' },
    { id: 'REQ-1025', title: 'Delivery Driver', company: 'FedEx Logistics', openings: 10, filled: 7, priority: 'High', daysOpen: 21, hiringManager: 'Tom Wilson' },
  ]);

  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newOpenings, setNewOpenings] = useState('1');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newHM, setNewHM] = useState('');

  const handleCreate = () => {
    if (!newTitle || !newCompany || !newHM) {
      alert('Please fill all required fields.');
      return;
    }
    const newReq: Requisition = {
      id: `REQ-${1031 + requisitions.length}`,
      title: newTitle,
      company: newCompany,
      openings: Number(newOpenings),
      filled: 0,
      priority: newPriority,
      daysOpen: 0,
      hiringManager: newHM,
    };
    setRequisitions(prev => [newReq, ...prev]);
    setShowNewModal(false);
    setNewTitle(''); setNewCompany(''); setNewOpenings('1'); setNewPriority('Medium'); setNewHM('');
    alert('Requisition created successfully!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this requisition?')) return;
    setRequisitions(prev => prev.filter(r => r.id !== id));
  };

  const handleViewDetails = (req: Requisition) => {
    setSelectedReq(req);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Open Requisitions</h1>
          <p className="text-muted-foreground mt-1">Manage and track your assigned job requirements.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Requisition
        </button>
      </div>

      <div className="grid gap-4">
        {requisitions.map((req) => (
          <div key={req.id} className="bg-card border border-border p-5 rounded-xl hover:border-primary/50 transition-colors group">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{req.id}</span>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{req.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {req.company}</span>
                    <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> {req.filled}/{req.openings} Filled</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {req.daysOpen} days open</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  req.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {req.priority} Priority
                </span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  HM: <span className="font-medium text-foreground">{req.hiringManager}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-border/50">
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${req.openings > 0 ? (req.filled / req.openings) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDetails(req)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <Users className="w-4 h-4" /> View Candidates
                </button>
                <button
                  onClick={() => alert(`Editing ${req.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(req.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors ml-auto"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {requisitions.length === 0 && (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No open requisitions. Click "New Requisition" to create one.</p>
          </div>
        )}
      </div>

      {/* New Requisition Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Create New Requisition</h2>
              <button onClick={() => setShowNewModal(false)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Job Title *</label>
                <input
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Senior Software Engineer"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Company *</label>
                <input
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. TechCorp Inc."
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Openings</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newOpenings}
                    onChange={e => setNewOpenings(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Priority</label>
                  <select
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Hiring Manager *</label>
                <input
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Full name"
                  value={newHM}
                  onChange={e => setNewHM(e.target.value)}
                />
              </div>
              <button
                onClick={handleCreate}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Create Requisition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{selectedReq.id} — {selectedReq.title}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Company</p>
                  <p className="font-medium text-foreground text-sm">{selectedReq.company}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Hiring Manager</p>
                  <p className="font-medium text-foreground text-sm">{selectedReq.hiringManager}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Positions</p>
                  <p className="font-medium text-foreground text-sm">{selectedReq.filled} / {selectedReq.openings} Filled</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Days Open</p>
                  <p className="font-medium text-foreground text-sm">{selectedReq.daysOpen} days</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm p-4 bg-muted/30 rounded-lg border border-border">
                No candidates have been linked to this requisition yet. Go to the <strong>Job Applications</strong> page to view and manage candidates.
              </p>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-muted text-foreground py-2.5 rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
