/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recruiterApi } from '../api/recruiter.api';
import type { UpdateRecruiterProfileData } from '../api/recruiter.api';
import { Camera, User as UserIcon, Building2, Briefcase, Award } from 'lucide-react';
import { useAppSelector } from '@/app/store';

export default function RecruiterProfilePage(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile, refetch: fetchProfile } = useQuery({
    queryKey: ['recruiter-profile', (user as any)?.id || (user as any)?.sub],
    queryFn: () => recruiterApi.getProfile(),
  });

  const [formData, setFormData] = useState<UpdateRecruiterProfileData>({});

  const handleEditToggle = () => {
    if (!isEditing && profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        agencyName: profile.agencyName,
        bio: profile.bio,
        specialisations: profile.specialisations,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await recruiterApi.updateProfile(formData);
      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Recruiter Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your agency details and professional presence.
          </p>
        </div>
        <button
          onClick={isEditing ? handleSave : handleEditToggle}
          disabled={isLoading}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative h-32 bg-gradient-to-r from-primary/20 to-accent/20">
          <div className="absolute -bottom-12 left-8">
            <div className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-card shadow-sm">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-muted-foreground" />
              )}
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 pt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="border-b border-border pb-2 text-lg font-semibold text-foreground">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{profile.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-foreground">{profile.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Agency Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.agencyName || ''}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-foreground">{profile.agencyName || 'Not specified'}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                {isEditing ? (
                  <textarea
                    className="h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">{profile.bio || 'No bio added yet.'}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="border-b border-border pb-2 text-lg font-semibold text-foreground">
                Professional Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                      <p className="font-semibold text-foreground">{profile.successRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Placements</p>
                      <p className="font-semibold text-foreground">{profile.placements}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Specialisations
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Comma separated (e.g. Nursing, Tech, Finance)"
                      value={formData.specialisations?.join(', ') || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialisations: e.target.value.split(',').map((s) => s.trim()),
                        })
                      }
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.specialisations && profile.specialisations.length > 0 ? (
                        profile.specialisations.map((spec) => (
                          <span
                            key={spec}
                            className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                          >
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None specified</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
