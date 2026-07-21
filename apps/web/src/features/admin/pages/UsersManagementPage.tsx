import React from 'react';
import { MoreHorizontal, CheckCircle2, XCircle, Clock, Filter, Search } from 'lucide-react';

export default function UsersManagementPage(): React.ReactElement {
  const users = [
    {
      id: 'USR-8902',
      name: 'Emma Watson',
      email: 'emma.w@example.com',
      role: 'Worker',
      status: 'Active',
      lastLogin: '2 mins ago',
      registered: '2025-11-12'
    },
    {
      id: 'USR-8903',
      name: 'TechCorp HR',
      email: 'hr@techcorp.com',
      role: 'Employer',
      status: 'Active',
      lastLogin: '1 hour ago',
      registered: '2026-01-05'
    },
    {
      id: 'USR-8904',
      name: 'Michael Scott',
      email: 'm.scott@dunder.com',
      role: 'Recruiter',
      status: 'Suspended',
      lastLogin: '2 weeks ago',
      registered: '2026-03-20'
    },
    {
      id: 'USR-8905',
      name: 'Sarah Connor',
      email: 's.connor@sky.net',
      role: 'Worker',
      status: 'Active',
      lastLogin: '3 days ago',
      registered: '2026-05-18'
    },
    {
      id: 'USR-8901',
      name: 'Admin System',
      email: 'admin@shiftly.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: 'Just now',
      registered: '2025-01-01'
    }
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'Employer': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'Recruiter': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage accounts, roles, and access across the platform.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Filter className="w-4 h-4" /> Filter Roles
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-sm text-muted-foreground border-b border-border">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Login</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {user.status === 'Active' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${user.status === 'Active' ? 'text-foreground' : 'text-red-500'}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> {user.lastLogin}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
          <span>Showing 5 of 12,492 users</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
