import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
    {
      id: 'REQ-1029',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      openings: 2,
      filled: 0,
      priority: 'High',
      daysOpen: 14,
      hiringManager: 'Alex Mercer',
    },
    {
      id: 'REQ-1030',
      title: 'Warehouse Manager',
      company: 'Amazon Fulfillment',
      openings: 1,
      filled: 0,
      priority: 'Medium',
      daysOpen: 5,
      hiringManager: 'Sarah Jenkins',
    },
    {
      id: 'REQ-1025',
      title: 'Delivery Driver',
      company: 'FedEx Logistics',
      openings: 10,
      filled: 7,
      priority: 'High',
      daysOpen: 21,
      hiringManager: 'Tom Wilson',
    },
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
    setRequisitions((prev) => [newReq, ...prev]);
    setShowNewModal(false);
    setNewTitle('');
    setNewCompany('');
    setNewOpenings('1');
    setNewPriority('Medium');
    setNewHM('');
    alert('Requisition created successfully!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this requisition?')) return;
    setRequisitions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleViewDetails = (req: Requisition) => {
    setSelectedReq(req);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Open Requisitions</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track your assigned job requirements.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Requisition
        </button>
      </div>

      <div className="grid gap-4">
        {requisitions.map((req) => (
          <div
            key={req.id}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {req.id}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      {req.title}
                    </h3>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Building className="h-4 w-4" /> {req.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Target className="h-4 w-4" /> {req.filled}/{req.openings} Filled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {req.daysOpen} days open
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between gap-3">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    req.priority === 'High'
                      ? 'border-red-500/20 bg-red-500/10 text-red-500'
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                  }`}
                >
                  {req.priority} Priority
                </span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  HM: <span className="font-medium text-foreground">{req.hiringManager}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-border/50 pt-4">
              <div className="mb-4 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${req.openings > 0 ? (req.filled / req.openings) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDetails(req)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <Users className="h-4 w-4" /> View Candidates
                </button>
                <button
                  onClick={() => alert(`Editing ${req.id}`)}
                  className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
                >
                  <Edit className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(req.id)}
                  className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {requisitions.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No open requisitions. Click "New Requisition" to create one.
            </p>
          </div>
        )}
      </div>

      {/* New Requisition Modal */}
      {showNewModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-lg font-semibold text-foreground">Create New Requisition</h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Job Title *
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Senior Software Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Company *</label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. TechCorp Inc."
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Openings</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newOpenings}
                    onChange={(e) => setNewOpenings(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Priority</label>
                  <select
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Hiring Manager *
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Full name"
                  value={newHM}
                  onChange={(e) => setNewHM(e.target.value)}
                />
              </div>
              <button
                onClick={handleCreate}
                className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create Requisition
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* View Details Modal */}
      {showViewModal && selectedReq && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedReq.id} — {selectedReq.title}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-medium text-foreground">{selectedReq.company}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Hiring Manager</p>
                  <p className="text-sm font-medium text-foreground">{selectedReq.hiringManager}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Positions</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedReq.filled} / {selectedReq.openings} Filled
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Days Open</p>
                  <p className="text-sm font-medium text-foreground">{selectedReq.daysOpen} days</p>
                </div>
              </div>
              <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                No candidates have been linked to this requisition yet. Go to the{' '}
                <strong>Job Applications</strong> page to view and manage candidates.
              </p>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full rounded-lg bg-muted py-2.5 font-medium text-foreground transition-colors hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
