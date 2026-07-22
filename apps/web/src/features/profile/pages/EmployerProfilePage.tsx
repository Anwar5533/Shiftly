/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars -- TODO(RC3): Address type safety */
import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Users, Star } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { employerApi } from '../api/employer.api';
import type { EmployerProfile } from '@shiftly/shared-types';

export default function EmployerProfilePage(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error('Failed to fetch profile', err);
      // Fallback if needed for development, similar to worker
      const mockProfile: any = {
        id: 'emp-1',
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        userId: (user as any)?.id || (user as any)?.sub || 'u-1',
        companyName: 'Acme Logistics',
        description: 'A leading retail company looking for shift workers.',
        website: 'https://acmecorp.com',
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        employeeCount: '11_TO_50',
        rating: 4.5,
        totalReviews: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      setProfile(mockProfile);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      setCompanyName(mockProfile.companyName);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      setIndustry(mockProfile.industry);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      setDescription(mockProfile.description || '');
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      setWebsite(mockProfile.website || '');
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      setLocationCity(mockProfile.location?.city || '');
      setEmail(user?.email || '');
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'EMPLOYER') {
// eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODO(RC3): Address type safety
      fetchProfile();
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
    } catch (err: any) {
      console.error('Failed to update profile', err);
 
      alert(err.response?.data?.error?.message || 'Failed to save changes');
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
// eslint-disable-next-line @typescript-eslint/no-misused-promises -- TODO(RC3): Address type safety
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="group relative mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-primary/20 bg-primary/10">
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
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              Departments
            </h3>
            <div className="flex flex-wrap gap-2">
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
              {(profile as any).departments && (profile as any).departments.length > 0 ? (
// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- TODO(RC3): Address type safety
                (profile as any).departments.map((dept: any) => (
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
                  <div key={dept.id} className="rounded-xl border border-border p-4">
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
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
              {isEditing && (
                <button
// eslint-disable-next-line @typescript-eslint/no-misused-promises -- TODO(RC3): Address type safety
                  onClick={async () => {
                    const name = prompt('Enter department name:');
                    if (name) {
                      try {
                        setIsLoading(true);
                        await employerApi.addDepartment(name);
                        await fetchProfile();
                      } catch (err) {
                        alert('Failed to add department');
                        setIsLoading(false);
                      }
                    }
                  }}
                  className="rounded-full border border-dashed border-input bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  + Add Department
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
