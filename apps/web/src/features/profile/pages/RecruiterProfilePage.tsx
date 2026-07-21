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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Recruiter Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your agency details and professional presence.</p>
        </div>
        <button
          onClick={isEditing ? handleSave : handleEditToggle}
          disabled={isLoading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-card rounded-2xl border-4 border-background flex items-center justify-center shadow-sm relative group cursor-pointer overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-muted-foreground" />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-16 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={formData.firstName || ''}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={formData.lastName || ''}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Agency Name</label>
                {isEditing ? (
                  <input 
                    type="text"
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.agencyName || ''}
                    onChange={e => setFormData({...formData, agencyName: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-foreground">{profile.agencyName || 'Not specified'}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                {isEditing ? (
                  <textarea 
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
                    value={formData.bio || ''}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                ) : (
                  <p className="text-foreground">{profile.bio || 'No bio added yet.'}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Professional Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                      <p className="text-foreground font-semibold">{profile.successRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Placements</p>
                      <p className="text-foreground font-semibold">{profile.placements}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-muted-foreground">Specialisations</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Comma separated (e.g. Nursing, Tech, Finance)"
                      value={formData.specialisations?.join(', ') || ''}
                      onChange={e => setFormData({...formData, specialisations: e.target.value.split(',').map(s => s.trim())})}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.specialisations && profile.specialisations.length > 0 ? (
                        profile.specialisations.map(spec => (
                          <span key={spec} className="px-3 py-1 bg-primary/10 text-primary font-medium rounded-full text-sm">
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
