import React from 'react';
import { IndianRupee, TrendingUp, Download, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function FinancialsPage(): React.ReactElement {
  const revenueData = [
    { name: 'Week 1', revenue: 930000 },
    { name: 'Week 2', revenue: 1110000 },
    { name: 'Week 3', revenue: 1237500 },
    { name: 'Week 4', revenue: 1590000 },
  ];

  const transactions = [
    { id: 'TXN-089', date: 'Today, 10:45 AM', type: 'Platform Fee', amount: 3675, isCredit: true, status: 'Completed', source: 'Employer: TechCorp' },
    { id: 'TXN-088', date: 'Today, 09:12 AM', type: 'Worker Payout', amount: 63000, isCredit: false, status: 'Processing', source: 'Worker: Michael Chen' },
    { id: 'TXN-087', date: 'Yesterday, 4:30 PM', type: 'Recruiter Comm.', amount: 11250, isCredit: false, status: 'Completed', source: 'Recruiter: Alex M.' },
    { id: 'TXN-086', date: 'Yesterday, 1:15 PM', type: 'Platform Fee', amount: 3675, isCredit: true, status: 'Completed', source: 'Employer: Amazon' },
  ];

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Amount (INR)', 'Status', 'Source'];
    const rows = transactions.map(txn => [
      txn.id,
      txn.date,
      txn.type,
      `${txn.isCredit ? '+' : '-'}${txn.amount}`,
      txn.status,
      txn.source,
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shiftly_financials_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground mt-1">Track platform revenue, payouts, and transaction history.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-muted text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80 flex items-center justify-center gap-2 transition-colors border border-border"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-green-500/10 text-green-500">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-muted-foreground">Net Revenue (MTD)</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatINR(4867500)}</p>
          <div className="mt-2 flex items-center text-sm font-medium text-green-500">
            <ArrowUpRight className="w-4 h-4 mr-1" /> 12.5% vs last month
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-muted-foreground">Total Payouts (MTD)</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatINR(10687500)}</p>
          <div className="mt-2 flex items-center text-sm font-medium text-blue-500">
            <ArrowUpRight className="w-4 h-4 mr-1" /> 8.2% vs last month
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-muted-foreground">Pending Escrow</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatINR(1368000)}</p>
          <div className="mt-2 flex items-center text-sm font-medium text-amber-500">
            <ArrowDownRight className="w-4 h-4 mr-1" /> 3.1% vs last month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-lg text-foreground mb-4">Revenue Trend (This Month)</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val/100000).toFixed(0)}L`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [formatINR(value), 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
          <h2 className="font-semibold text-lg text-foreground mb-4">Recent Transactions</h2>
          <div className="space-y-4 flex-1">
            {transactions.map((txn, i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-foreground text-sm">{txn.type}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{txn.source}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${txn.isCredit ? 'text-green-500' : 'text-foreground'}`}>
                    {txn.isCredit ? '+' : '-'}{formatINR(txn.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{txn.status}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2 border border-border rounded-lg hover:bg-muted"
          >
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
