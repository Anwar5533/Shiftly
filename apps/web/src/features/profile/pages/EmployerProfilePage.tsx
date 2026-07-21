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
      setProfile(mockProfile);
      setCompanyName(mockProfile.companyName);
      setIndustry(mockProfile.industry);
      setDescription(mockProfile.description || '');
      setWebsite(mockProfile.website || '');
      setLocationCity(mockProfile.location?.city || '');
      setEmail(user?.email || '');
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'EMPLOYER') {
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your employer information and branding.</p>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-2xl bg-primary/10 border-4 border-primary/20 flex items-center justify-center mb-4 overflow-hidden relative group">
              <Building2 className="w-16 h-16 text-primary/60" />
              {isEditing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-sm font-medium text-primary">Upload Logo</span>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3 w-full">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-center"
                />
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Industry (e.g. Retail)"
                  className="w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-center"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground">{profile.companyName}</h2>
                <p className="text-muted-foreground font-medium mb-4">{profile.industry}</p>
              </>
            )}
            
            <div className="flex gap-4 w-full mt-2">
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

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              About Company
            </h3>
            {isEditing ? (
              <textarea 
                className="w-full h-32 p-3 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your company..."
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed">{profile.description || 'No company description provided.'}</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Company Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  {isEditing ? (
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-foreground">{website || 'Not provided'}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Headquarters</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={locationCity} 
                      onChange={e => setLocationCity(e.target.value)}
                      placeholder="City"
                      className="mt-1 w-full p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none" 
                    />
                  ) : (
                    <p className="text-foreground">{profile.location?.city || 'No location set'}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                  <p className="text-foreground">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Company Size</p>
                  <p className="text-foreground">{profile.employeeCount || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Departments
            </h3>
            <div className="flex flex-wrap gap-2">
              {(profile as any).departments && (profile as any).departments.length > 0 ? (
                (profile as any).departments.map((dept: any) => (
                  <div key={dept.id} className="p-4 border border-border rounded-xl">
                    {dept.name}
                    {isEditing && <button className="text-muted-foreground hover:text-destructive">&times;</button>}
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No departments added yet.</span>
              )}
              {isEditing && (
                <button 
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
                  className="px-3 py-1.5 bg-background border border-dashed border-input text-muted-foreground hover:text-foreground font-medium rounded-full text-sm transition-colors"
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
