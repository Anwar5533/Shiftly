import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  X,
  Shield,
  Ban,
  UserCheck,
  Eye,
} from 'lucide-react';

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
    {
      id: 'USR-8902',
      name: 'Emma Watson',
      email: 'emma.w@example.com',
      role: 'Worker',
      status: 'Active',
      lastLogin: '2 mins ago',
      registered: '2025-11-12',
    },
    {
      id: 'USR-8903',
      name: 'TechCorp HR',
      email: 'hr@techcorp.com',
      role: 'Employer',
      status: 'Active',
      lastLogin: '1 hour ago',
      registered: '2026-01-05',
    },
    {
      id: 'USR-8904',
      name: 'Michael Scott',
      email: 'm.scott@dunder.com',
      role: 'Recruiter',
      status: 'Suspended',
      lastLogin: '2 weeks ago',
      registered: '2026-03-20',
    },
    {
      id: 'USR-8905',
      name: 'Sarah Connor',
      email: 's.connor@sky.net',
      role: 'Worker',
      status: 'Active',
      lastLogin: '3 days ago',
      registered: '2026-05-18',
    },
    {
      id: 'USR-8901',
      name: 'Admin System',
      email: 'admin@shiftly.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: 'Just now',
      registered: '2025-01-01',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const roles = ['All', 'Worker', 'Employer', 'Recruiter', 'Admin'];

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [users, searchQuery, roleFilter],
  );

  const handleSuspend = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u,
      ),
    );
    setOpenMenuId(null);
  };

  const handleDelete = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setOpenMenuId(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'Employer':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'Recruiter':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage accounts, roles, and access across the platform.
          </p>
        </div>
      </div>

      <div className="overflow-visible rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-muted/50 py-2 pl-9 pr-4 text-sm text-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Filter className="h-4 w-4" /> Filter Roles
              {roleFilter !== 'All' && (
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                  {roleFilter}
                </span>
              )}
            </button>
            {showFilterPanel && (
              <div className="absolute right-0 top-10 z-20 w-36 rounded-lg border border-border bg-card py-1 shadow-lg">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setRoleFilter(role);
                      setShowFilterPanel(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted ${roleFilter === role ? 'font-medium text-primary' : 'text-foreground'}`}
                  >
                    {roleFilter === role && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-visible">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-sm text-muted-foreground">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Login</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-muted/10">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadge(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {user.status === 'Active' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm ${user.status === 'Active' ? 'text-foreground' : 'text-red-500'}`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {user.lastLogin}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      {openMenuId === user.id && (
                        <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-border bg-card py-1 shadow-lg">
                          <button
                            onClick={() => {
                              setViewUser(user);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                          >
                            <Eye className="h-4 w-4 text-blue-500" /> View Profile
                          </button>
                          <button
                            onClick={() => {
                              alert(`Editing ${user.name}`);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                          >
                            <Shield className="h-4 w-4 text-amber-500" /> Change Role
                          </button>
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted ${user.status === 'Active' ? 'text-amber-500' : 'text-green-500'}`}
                          >
                            {user.status === 'Active' ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                            {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-muted"
                          >
                            <XCircle className="h-4 w-4" /> Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/10 p-4 text-sm text-muted-foreground">
          <span>
            Showing {filteredUsers.length} of {users.length} users
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded border border-border px-3 py-1 transition-colors hover:bg-muted disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="rounded border border-border px-3 py-1 transition-colors hover:bg-muted">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {viewUser &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-5">
                <h2 className="text-lg font-semibold text-foreground">User Profile</h2>
                <button
                  onClick={() => setViewUser(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-2xl font-bold text-primary">
                    {viewUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{viewUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{viewUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'User ID', value: viewUser.id },
                    { label: 'Role', value: viewUser.role },
                    { label: 'Status', value: viewUser.status },
                    { label: 'Registered', value: viewUser.registered },
                    { label: 'Last Login', value: viewUser.lastLogin },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-muted/50 p-3">
                      <p className="mb-0.5 text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setViewUser(null)}
                  className="w-full rounded-lg bg-muted py-2.5 font-medium text-foreground transition-colors hover:bg-muted/80"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Click away to close menu */}
      {(openMenuId || showFilterPanel) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setOpenMenuId(null);
            setShowFilterPanel(false);
          }}
        />
      )}
    </div>
  );
}
