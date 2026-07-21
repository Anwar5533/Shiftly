export interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  status: 'Actively Looking' | 'Passive' | 'Open to Offers';
  rating: number;
}

const mockCandidates: Candidate[] = [
  {
    id: 'c-1',
    name: 'Jessica Taylor',
    title: 'Logistics Coordinator',
    location: 'Seattle, WA',
    experience: '5 years',
    skills: ['Supply Chain', 'Inventory Management', 'SAP'],
    status: 'Open to Offers',
    rating: 4.8
  },
  {
    id: 'c-2',
    name: 'Marcus Johnson',
    title: 'CDL Class A Driver',
    location: 'Portland, OR',
    experience: '8 years',
    skills: ['Long-haul', 'Hazmat Endorsed', 'Route Planning'],
    status: 'Actively Looking',
    rating: 4.9
  },
  {
    id: 'c-3',
    name: 'Elena Rodriguez',
    title: 'Warehouse Supervisor',
    location: 'Kent, WA',
    experience: '4 years',
    skills: ['Team Leadership', 'OSHA Certified', 'Forklift'],
    status: 'Passive',
    rating: 4.5
  },
  {
    id: 'c-4',
    name: 'David Kim',
    title: 'Operations Analyst',
    location: 'Bellevue, WA',
    experience: '3 years',
    skills: ['Data Analysis', 'Excel', 'Process Optimization'],
    status: 'Actively Looking',
    rating: 4.7
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const candidatesApi = {
  searchCandidates: async (query?: string): Promise<Candidate[]> => {
    await delay(500);
    if (!query) return mockCandidates;
    
    const lowerQuery = query.toLowerCase();
    return mockCandidates.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.title.toLowerCase().includes(lowerQuery) ||
      c.skills.some(s => s.toLowerCase().includes(lowerQuery))
    );
  }
};
