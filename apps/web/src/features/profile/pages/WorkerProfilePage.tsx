/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): */
import React, { useState, useEffect } from 'react';

import { User, Mail, MapPin, Award, Phone, Shield } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { workerApi } from '../api/worker.api';
import type { WorkerProfile } from '@shiftly/shared-types';
import { useQueryClient } from '@tanstack/react-query';

export default function WorkerProfilePage(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activePortal = localStorage.getItem('activePortal') || 'worker';

  const [profile, setProfile] = useState<WorkerProfile | null>(null);

  // Form states
  const [bio, setBio] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      // For workers, we try to fetch from backend. For others, or if it fails, we use a mock.
      if (user?.role === 'WORKER') {
        try {
          const data = await workerApi.getProfile();
          setProfile(data);
          setBio(data.bio || '');
          setLocationCity(data.location?.city || '');
          setError(null);
          return;
        } catch (err) {
          console.warn('Backend profile fetch failed, using fallback mock');
        }
      }

      // Mock fallback for non-workers or failed worker fetch
      const fallbackProfile: WorkerProfile = {
        id: 'mock-123',
        userId: user?.sub || '123',
        firstName: user?.email?.split('@')[0] || 'User',
        lastName: '',
        bio: `Hello! I am a ${user?.role.toLowerCase()} on Shiftly.`,
        location: {
          city: 'Bangalore',
          state: 'Karnataka',
          address: '',
          country: 'India',
          postalCode: '',
          lat: 0,
          lng: 0,
        },
        skills: ['Management', 'Communication', 'Operations'],
        hourlyRate: 15,
        currency: 'USD',
        rating: 4.8,
        totalReviews: 24,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as WorkerProfile;

      setProfile(fallbackProfile);
      setBio(fallbackProfile.bio || '');
      setLocationCity(fallbackProfile.location?.city || '');
      setFirstName(fallbackProfile.firstName || '');
      setLastName(fallbackProfile.lastName || '');
      setEmail(user?.email || '');
      setPhone((user as any)?.phone || '');
      setError(null);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setError('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      setIsLoading(true);
      if (user?.role === 'WORKER') {
        await workerApi.updateProfile({
          firstName,
          lastName,
          bio: bio,
          location: {
            ...profile.location,
            city: locationCity,
          },
        });
        await fetchProfile(); // refresh data
        queryClient.invalidateQueries({ queryKey: ['worker-profile', user?.sub] });
      }
      // Update local state to simulate save for all roles
      setProfile({
        ...profile,
        firstName,
        lastName,
        bio: bio,
        location: {
          ...profile.location,
          city: locationCity,
        },
      });
      // In a real app we would update the Redux user state for email/phone too
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile', err);

      alert(err.response?.data?.error?.message || 'Failed to save changes');
    } finally {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your personal information and preferences.
          </p>
        </div>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Avatar & Basic Info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="group relative mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-primary/30 bg-primary/20">
              <span className="text-5xl font-bold uppercase text-primary">
                {profile.firstName.charAt(0)}
              </span>
              {isEditing && (
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm font-medium text-primary">Change Photo</span>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mb-2 flex w-full gap-2 px-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-1/2 rounded-md border border-input bg-background p-2 text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-1/2 rounded-md border border-input bg-background p-2 text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ) : (
              <h2 className="text-xl font-bold text-foreground">
                {profile.firstName} {profile.lastName}
              </h2>
            )}

            <p className="mb-4 font-medium capitalize text-primary">{activePortal}</p>

            <div className="flex w-full gap-4">
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

        {/* Right Column: Details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
              <User className="h-5 w-5 text-primary" />
              About Me
            </h3>
            {isEditing ? (
              <textarea
                className="h-32 w-full resize-none rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio about yourself..."
              />
            ) : (
              <p className="leading-relaxed text-muted-foreground">
                {profile.bio || 'No bio provided.'}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground">{email || user?.email || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 000-0000"
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground">
                      {phone || (user as any)?.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      placeholder="e.g. Bangalore"
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground">{profile.location?.city || 'No location set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Award className="h-5 w-5 text-primary" />
              Skills & Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
                  >
                    {skill}
                    {isEditing && (
                      <button className="text-muted-foreground hover:text-destructive">
                        &times;
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No skills added yet.</span>
              )}
              {isEditing && (
                <button
                  onClick={() => alert('Skill addition UI would open here')}
                  className="rounded-full border border-dashed border-input bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  + Add Skill
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
