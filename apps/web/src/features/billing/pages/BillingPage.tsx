import React from 'react';
import { CreditCard, Download, ExternalLink, Receipt, CheckCircle2 } from 'lucide-react';

export default function BillingPage(): React.ReactElement {
  const invoices = [
    { id: 'INV-2026-042', date: 'Jul 01, 2026', amount: '$499.00', status: 'Paid', plan: 'Enterprise Monthly' },
    { id: 'INV-2026-038', date: 'Jun 01, 2026', amount: '$499.00', status: 'Paid', plan: 'Enterprise Monthly' },
    { id: 'INV-2026-031', date: 'May 01, 2026', amount: '$499.00', status: 'Paid', plan: 'Enterprise Monthly' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Billing & Invoices</h1>
        <p className="text-muted-foreground mt-1">Manage your payment methods and download past invoices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Active</span>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold text-foreground">Enterprise <span className="text-lg text-muted-foreground font-normal">/ month</span></p>
            <p className="text-muted-foreground mt-2 text-sm">Unlimited job postings and priority support.</p>
          </div>
          <ul className="space-y-3 mb-6">
            {['Up to 50 active job slots', 'Advanced analytics dashboard', 'Dedicated account manager'].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> {feature}
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Upgrade Plan</button>
            <button className="flex-1 bg-muted text-foreground py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">Cancel</button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
          <div className="flex-1">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-card border border-border rounded flex items-center justify-center">
                  <span className="font-bold text-blue-600 italic">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/2028</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-muted px-2 py-1 rounded text-muted-foreground">Default</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-auto">
            <CreditCard className="w-4 h-4" /> Add Payment Method
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-lg text-foreground">Invoice History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-sm text-muted-foreground border-b border-border">
                <th className="p-4 font-medium">Invoice</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-medium text-foreground flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-muted-foreground" /> {inv.id}
                  </td>
                  <td className="p-4 text-muted-foreground">{inv.date}</td>
                  <td className="p-4 text-muted-foreground">{inv.plan}</td>
                  <td className="p-4 font-medium">{inv.amount}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex">
                      <Download className="w-4 h-4" />
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
