import React from 'react';
import { Mail, Calendar, Star, MoreVertical, FileText } from 'lucide-react';

export default function ApplicantsPage(): React.ReactElement {
  const applicants = [
    {
      id: 1,
      name: 'Michael Chen',
      role: 'Senior Frontend Developer',
      applied: '2 hours ago',
      stage: 'Interview',
      matchScore: 94,
      avatar: 'M'
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      role: 'Warehouse Manager',
      applied: '1 day ago',
      stage: 'Screening',
      matchScore: 88,
      avatar: 'S'
    },
    {
      id: 3,
      name: 'David Rodriguez',
      role: 'Senior Frontend Developer',
      applied: '2 days ago',
      stage: 'Offer',
      matchScore: 97,
      avatar: 'D'
    },
    {
      id: 4,
      name: 'Emily Watson',
      role: 'Delivery Driver',
      applied: '3 days ago',
      stage: 'Rejected',
      matchScore: 45,
      avatar: 'E'
    }
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
            <button className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:bg-muted rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-5 h-5" />
            </button>
            
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
                  <button className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors tooltip-trigger" title="Message">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors tooltip-trigger" title="Schedule">
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors tooltip-trigger" title="View Resume">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
