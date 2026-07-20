import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Users, Briefcase, Activity, TrendingUp } from 'lucide-react';

export default function PlatformAnalyticsPage(): React.ReactElement {
  const userGrowthData = [
    { name: 'Jan', workers: 4000, employers: 240 },
    { name: 'Feb', workers: 4500, employers: 280 },
    { name: 'Mar', workers: 5200, employers: 350 },
    { name: 'Apr', workers: 6100, employers: 410 },
    { name: 'May', workers: 7500, employers: 490 },
    { name: 'Jun', workers: 8900, employers: 580 },
    { name: 'Jul', workers: 10400, employers: 680 },
  ];

  const jobCategoryData = [
    { name: 'Warehouse', jobs: 420 },
    { name: 'Delivery', jobs: 380 },
    { name: 'Tech', jobs: 250 },
    { name: 'Retail', jobs: 190 },
    { name: 'Admin', jobs: 140 },
  ];

  const stats = [
    { label: 'Total Active Users', value: '11.2k', change: '+18%', icon: Users, color: 'text-blue-500' },
    { label: 'Active Job Postings', value: '1,380', change: '+12%', icon: Briefcase, color: 'text-purple-500' },
    { label: 'Matches Made', value: '8,492', change: '+24%', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Platform Uptime', value: '99.9%', change: '+0.1%', icon: Activity, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">High-level metrics and growth trends across Shiftly.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card border border-border p-5 rounded-xl shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium">{stat.change}</span>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-lg text-foreground mb-4">User Growth Trend</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWorkers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEmployers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Area type="monotone" dataKey="workers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorWorkers)" />
                <Area type="monotone" dataKey="employers" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorEmployers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs Category Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-lg text-foreground mb-4">Top Categories</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobCategoryData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="jobs" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
