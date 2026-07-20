import React from 'react';
import { Clock, Calendar, CheckCircle, AlertCircle, FileText, ChevronDown } from 'lucide-react';

export default function TimesheetsPage(): React.ReactElement {
  const timesheets = [
    {
      id: 1,
      period: 'Jul 15 - Jul 21, 2026',
      totalHours: '38.5',
      status: 'Approved',
      earnings: '$847.00',
      company: 'Amazon Fulfillment',
    },
    {
      id: 2,
      period: 'Jul 08 - Jul 14, 2026',
      totalHours: '42.0',
      status: 'Paid',
      earnings: '$966.00',
      company: 'Amazon Fulfillment',
    },
    {
      id: 3,
      period: 'Jul 01 - Jul 07, 2026',
      totalHours: '35.0',
      status: 'Paid',
      earnings: '$770.00',
      company: 'FedEx Logistics',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Timesheets</h1>
          <p className="text-muted-foreground mt-1">Review your logged hours and payment statuses.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors">
          <Clock className="w-4 h-4" /> Clock In
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-foreground">This Week</h3>
          </div>
          <p className="text-2xl font-bold">24.5 hrs</p>
          <p className="text-sm text-muted-foreground mt-1">out of 40 hrs scheduled</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-green-500/10 text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-foreground">Approved Pending</h3>
          </div>
          <p className="text-2xl font-bold">$847.00</p>
          <p className="text-sm text-muted-foreground mt-1">Payout scheduled for Friday</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-foreground">Action Required</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">No timesheets need revision</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <h2 className="font-semibold text-lg text-foreground">Recent Timesheets</h2>
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
            Filter <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/10 text-sm text-muted-foreground">
                <th className="p-4 font-medium">Pay Period</th>
                <th className="p-4 font-medium">Company</th>
                <th className="p-4 font-medium">Hours</th>
                <th className="p-4 font-medium">Earnings</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {timesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{ts.period}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{ts.company}</td>
                  <td className="p-4 font-medium">{ts.totalHours}h</td>
                  <td className="p-4 font-medium">{ts.earnings}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      ts.status === 'Paid' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      {ts.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
