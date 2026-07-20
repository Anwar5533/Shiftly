import React from 'react';
import { Target, Users, Clock, Building, ChevronRight, Briefcase } from 'lucide-react';

export default function RequisitionsPage(): React.ReactElement {
  const requisitions = [
    {
      id: 'REQ-1029',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      openings: 2,
      filled: 0,
      priority: 'High',
      daysOpen: 14,
      hiringManager: 'Alex Mercer'
    },
    {
      id: 'REQ-1030',
      title: 'Warehouse Manager',
      company: 'Amazon Fulfillment',
      openings: 1,
      filled: 0,
      priority: 'Medium',
      daysOpen: 5,
      hiringManager: 'Sarah Jenkins'
    },
    {
      id: 'REQ-1025',
      title: 'Delivery Driver',
      company: 'FedEx Logistics',
      openings: 10,
      filled: 7,
      priority: 'High',
      daysOpen: 21,
      hiringManager: 'Tom Wilson'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Open Requisitions</h1>
          <p className="text-muted-foreground mt-1">Manage and track your assigned job requirements.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {requisitions.map((req) => (
          <div key={req.id} className="bg-card border border-border p-5 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group">
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

              <div className="flex flex-col items-end justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  req.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {req.priority} Priority
                </span>
                <div className="flex items-center gap-2 mt-4 md:mt-0 text-sm text-muted-foreground">
                  HM: <span className="font-medium text-foreground">{req.hiringManager}</span>
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
            
            <div className="mt-5 pt-4 border-t border-border/50">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${(req.filled / req.openings) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
