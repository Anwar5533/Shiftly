import React, { useState } from 'react';
import { MoreHorizontal, CheckCircle2, XCircle, Clock, Filter, Search, X, Shield, Ban, UserCheck, Eye } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  registered: string;
}

export default function UsersManagementPage(): React.ReactElement {
  const [users, setUsers] = useState<User[]>([
    { id: 'USR-8902', name: 'Emma Watson', email: 'emma.w@example.com', role: 'Worker', status: 'Active', lastLogin: '2 mins ago', registered: '2025-11-12' },
    { id: 'USR-8903', name: 'TechCorp HR', email: 'hr@techcorp.com', role: 'Employer', status: 'Active', lastLogin: '1 hour ago', registered: '2026-01-05' },
    { id: 'USR-8904', name: 'Michael Scott', email: 'm.scott@dunder.com', role: 'Recruiter', status: 'Suspended', lastLogin: '2 weeks ago', registered: '2026-03-20' },
    { id: 'USR-8905', name: 'Sarah Connor', email: 's.connor@sky.net', role: 'Worker', status: 'Active', lastLogin: '3 days ago', registered: '2026-05-18' },
    { id: 'USR-8901', name: 'Admin System', email: 'admin@shiftly.com', role: 'Admin', status: 'Active', lastLogin: 'Just now', registered: '2025-01-01' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const roles = ['All', 'Worker', 'Employer', 'Recruiter', 'Admin'];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSuspend = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
    setOpenMenuId(null);
  };

  const handleDelete = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setUsers(prev => prev.filter(u => u.id !== userId));
    setOpenMenuId(null);
  };

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

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-visible">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              <Filter className="w-4 h-4" /> Filter Roles
              {roleFilter !== 'All' && (
                <span className="ml-1 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">{roleFilter}</span>
              )}
            </button>
            {showFilterPanel && (
              <div className="absolute right-0 top-10 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-36">
                {roles.map(role => (
                  <button
                    key={role}
                    onClick={() => { setRoleFilter(role); setShowFilterPanel(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${roleFilter === role ? 'text-primary font-medium' : 'text-foreground'}`}
                  >
                    {roleFilter === role && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              {filteredUsers.map((user) => (
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
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {openMenuId === user.id && (
                        <div className="absolute right-0 top-9 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-44">
                          <button
                            onClick={() => { setViewUser(user); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                          >
                            <Eye className="w-4 h-4 text-blue-500" /> View Profile
                          </button>
                          <button
                            onClick={() => { alert(`Editing ${user.name}`); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                          >
                            <Shield className="w-4 h-4 text-amber-500" /> Change Role
                          </button>
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${user.status === 'Active' ? 'text-amber-500' : 'text-green-500'}`}
                          >
                            {user.status === 'Active' ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                          </button>
                          <div className="border-t border-border my-1" />
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-red-500"
                          >
                            <XCircle className="w-4 h-4" /> Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">No users match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">User Profile</h2>
              <button onClick={() => setViewUser(null)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20">
                  {viewUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{viewUser.name}</h3>
                  <p className="text-muted-foreground text-sm">{viewUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'User ID', value: viewUser.id },
                  { label: 'Role', value: viewUser.role },
                  { label: 'Status', value: viewUser.status },
                  { label: 'Registered', value: viewUser.registered },
                  { label: 'Last Login', value: viewUser.lastLogin },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="w-full bg-muted text-foreground py-2.5 rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click away to close menu */}
      {(openMenuId || showFilterPanel) && (
        <div className="fixed inset-0 z-10" onClick={() => { setOpenMenuId(null); setShowFilterPanel(false); }} />
      )}
    </div>
  );
}
