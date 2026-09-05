/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Users, Star } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { employerApi } from '../api/employer.api';
import type { EmployerProfile } from '@shiftly/shared-types';
import { AlertDialog } from '../../../shared/components/AlertDialog';

export default function EmployerProfilePage(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDeptInput, setShowDeptInput] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const [profile, setProfile] = useState<EmployerProfile | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [email, setEmail] = useState('');
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await employerApi.getProfile();
      setProfile(data);
      setCompanyName(data.companyName || '');
      setIndustry(data.industry || '');
      setDescription(data.description || '');
      setWebsite(data.website || '');
      setLocationCity(data.location?.city || '');
      setEmail(user?.email || '');
      setError(null);
    } catch (_error) {
      console.error('Failed to fetch profile', _error);
      setError('Unable to load employer profile. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'EMPLOYER') {
      void fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      setIsLoading(true);
      await employerApi.updateProfile({
        companyName,
        industry,
        description,
        website,
        location: { ...profile.location, city: locationCity },
      });
      await fetchProfile();
      setIsEditing(false);
    } catch (_error: any) {
      console.error('Failed to update profile', _error);

      setIsSuccess(false);
      const errObj = _error as { response?: { data?: { error?: { message?: string } } } };
      setAlertMessage(errObj?.response?.data?.error?.message || 'Failed to save changes');
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) {
      setShowDeptInput(false);
      return;
    }
    try {
      setIsLoading(true);
      await employerApi.addDepartment(newDeptName.trim());
      await fetchProfile();
      setNewDeptName('');
      setShowDeptInput(false);
      setIsSuccess(true);
      setAlertMessage('Department added successfully!');
    } catch (_error) {
      setIsSuccess(false);
      setAlertMessage('Failed to add department');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your employer information and branding.
          </p>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              void handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-6 flex flex-col items-center text-center">
            <div className="group relative mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-primary/20 bg-gradient-to-br from-primary/30 to-primary/5 shadow-inner">
              <Building2 className="h-16 w-16 text-primary/60" />
              {isEditing && (
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm font-medium text-primary">Upload Logo</span>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="w-full rounded-md border border-input bg-background p-2 text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Industry (e.g. Retail)"
                  className="w-full rounded-md border border-input bg-background p-2 text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground">{profile.companyName}</h2>
                <p className="mb-4 font-medium text-muted-foreground">{profile.industry}</p>
              </>
            )}

            <div className="mt-2 flex w-full gap-4">
              <div className="flex-1 rounded-xl bg-muted p-3">
                <p className="text-2xl font-bold text-foreground">{profile.rating || 0}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rating
                </p>
              </div>
              <div className="flex-1 rounded-xl bg-muted p-3">
                <p className="text-2xl font-bold text-foreground">{profile.totalReviews || 0}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="glass-panel p-6 card-hover">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              About Company
            </h3>
            {isEditing ? (
              <textarea
                className="h-32 w-full resize-none rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your company..."
              />
            ) : (
              <p className="leading-relaxed text-muted-foreground">
                {profile.description || 'No company description provided.'}
              </p>
            )}
          </div>

          <div className="glass-panel p-6 card-hover">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              Company Details
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Star className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  {isEditing ? (
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground">{website || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Headquarters</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      placeholder="City"
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground">{profile.location?.city || 'No location set'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Star className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                  <p className="text-foreground">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Company Size</p>
                  <p className="text-foreground">{profile.employeeCount || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 card-hover">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              Departments
            </h3>
            <div className="flex flex-wrap gap-2">
              {(profile as unknown as Record<string, unknown>).departments &&
              ((profile as unknown as Record<string, unknown>).departments as any[]).length > 0 ? (
                (
                  (profile as unknown as Record<string, unknown>).departments as Array<{
                    id: string;
                    name: string;
                  }>
                ).map((dept) => (
                  <div key={dept.id} className="rounded-xl border border-border p-4">
                    {dept.name}
                    {isEditing && (
                      <button className="text-muted-foreground hover:text-destructive">
                        &times;
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No departments added yet.</span>
              )}
              {isEditing && !showDeptInput && (
                <button
                  onClick={() => setShowDeptInput(true)}
                  className="rounded-full border border-dashed border-input bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  + Add Department
                </button>
              )}
              {isEditing && showDeptInput && (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="Dept name"
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleAddDepartment();
                      if (e.key === 'Escape') setShowDeptInput(false);
                    }}
                  />
                  <button
                    onClick={() => void handleAddDepartment()}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowDeptInput(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        isOpen={!!alertMessage}
        onOpenChange={(open) => !open && setAlertMessage(null)}
        title={isSuccess ? 'Success' : 'Error'}
        description={alertMessage || ''}
      />
    </div>
  );
}
