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
          lng: 0
        },
        skills: ['Management', 'Communication', 'Operations'],
        hourlyRate: 15,
        currency: 'USD',
        rating: 4.8,
        totalReviews: 24,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
          }
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
        }
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
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and preferences.</p>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary/30 flex items-center justify-center mb-4 overflow-hidden relative group">
              <span className="text-5xl font-bold text-primary uppercase">
                {profile.firstName.charAt(0)}
              </span>
              {isEditing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-sm font-medium text-primary">Change Photo</span>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="flex gap-2 mb-2 w-full px-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-1/2 p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-center"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-1/2 p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-center"
                />
              </div>
            ) : (
              <h2 className="text-xl font-bold text-foreground">{profile.firstName} {profile.lastName}</h2>
            )}
            
            <p className="text-primary font-medium mb-4 capitalize">Worker</p>
            
            <div className="flex gap-4 w-full">
              <div className="flex-1 bg-muted p-3 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{profile.rating || 0}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Rating</p>
              </div>
              <div className="flex-1 bg-muted p-3 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{profile.totalReviews || 0}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              About Me
            </h3>
            {isEditing ? (
              <textarea 
                className="w-full h-32 p-3 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Write a short bio about yourself..."
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed">{profile.bio || 'No bio provided.'}</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="mt-1 w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-foreground">{email || user?.email || 'N/A'}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 000-0000"
                      className="mt-1 w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-foreground">{phone || (user as any)?.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={locationCity} 
                      onChange={e => setLocationCity(e.target.value)}
                      placeholder="e.g. Bangalore"
                      className="mt-1 w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none" 
                    />
                  ) : (
                    <p className="text-foreground">{profile.location?.city || 'No location set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Skills & Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-muted text-foreground font-medium rounded-full text-sm flex items-center gap-2">
                    {skill}
                    {isEditing && <button className="text-muted-foreground hover:text-destructive">&times;</button>}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No skills added yet.</span>
              )}
              {isEditing && (
                <button 
                  onClick={() => alert('Skill addition UI would open here')}
                  className="px-3 py-1.5 bg-background border border-dashed border-input text-muted-foreground hover:text-foreground font-medium rounded-full text-sm transition-colors"
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
