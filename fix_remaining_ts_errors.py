import os
import re

# PlatformAnalyticsPage.tsx
path = 'apps/web/src/features/admin/pages/PlatformAnalyticsPage.tsx'
with open(path, 'r') as f:
    content = f.read()

interface_def = """interface StatsData {
  totalUsers: number;
  activeUsersGrowth: string;
  activeJobs: number;
  jobsGrowth: string;
  completedShifts: number;
  shiftsGrowth: string;
  grossPaymentVolume: number;
  volumeGrowth: string;
}

export default function PlatformAnalyticsPage(): React.ReactElement {"""

content = content.replace("export default function PlatformAnalyticsPage(): React.ReactElement {", interface_def)
content = content.replace("value: (statsData as any)?.totalUsers || 0,", "value: (statsData as StatsData)?.totalUsers || 0,")
content = content.replace("change: (statsData as any)?.activeUsersGrowth || '0%',", "change: (statsData as StatsData)?.activeUsersGrowth || '0%',")
content = content.replace("value: (statsData as any)?.activeJobs || 0,", "value: (statsData as StatsData)?.activeJobs || 0,")
content = content.replace("change: (statsData as any)?.jobsGrowth || '0%',", "change: (statsData as StatsData)?.jobsGrowth || '0%',")
content = content.replace("value: (statsData as any)?.completedShifts || 0,", "value: (statsData as StatsData)?.completedShifts || 0,")
content = content.replace("change: (statsData as any)?.shiftsGrowth || '0%',", "change: (statsData as StatsData)?.shiftsGrowth || '0%',")
content = content.replace("value: `₹${Number((statsData as any)?.grossPaymentVolume || 0).toLocaleString()}`,", "value: `₹${Number((statsData as StatsData)?.grossPaymentVolume || 0).toLocaleString()}`,")
content = content.replace("change: (statsData as any)?.volumeGrowth || '0%',", "change: (statsData as StatsData)?.volumeGrowth || '0%',")

with open(path, 'w') as f:
    f.write(content)

# RecruiterDashboard.tsx
path = 'apps/web/src/features/dashboard/pages/RecruiterDashboard.tsx'
with open(path, 'r') as f:
    content = f.read()
content = content.replace("queryFn: () => recruiterApi.getDashboardStats() as Promise<any>,", "queryFn: () => recruiterApi.getDashboardStats() as Promise<{ placements: number; totalApplications: number; activeJobs: number; successRate: number }>,")
with open(path, 'w') as f:
    f.write(content)

# ActiveShiftPage.tsx
path = 'apps/web/src/features/jobs/pages/ActiveShiftPage.tsx'
with open(path, 'r') as f:
    content = f.read()
content = content.replace("const err = _error as any;", "const err = _error as import('axios').AxiosError<{ message?: string }>;")
with open(path, 'w') as f:
    f.write(content)
    
# PostJobPage.tsx
path = 'apps/web/src/features/jobs/pages/PostJobPage.tsx'
with open(path, 'r') as f:
    content = f.read()
content = content.replace("const err = _error as any;", "const err = _error as import('axios').AxiosError<{ error?: { message?: string } }>;")
with open(path, 'w') as f:
    f.write(content)

# EmployerProfilePage.tsx
path = 'apps/web/src/features/profile/pages/EmployerProfilePage.tsx'
with open(path, 'r') as f:
    content = f.read()
content = content.replace("location: { city: 'Bangalore', state: 'Karnataka', country: 'India' } as any,", "location: { city: 'Bangalore', state: 'Karnataka', country: 'India' } as import('@shiftly/shared-types').JobLocation,")
content = content.replace("employeeCount: '11_TO_50' as any,", "employeeCount: '11-50' as import('@shiftly/shared-types').EmployeeCountRange,")
with open(path, 'w') as f:
    f.write(content)

# MessagingPage.tsx
path = 'apps/web/src/features/messaging/pages/MessagingPage.tsx'
with open(path, 'r') as f:
    content = f.read()
content = content.replace("} catch (_error) {", "} catch (_err) {")
with open(path, 'w') as f:
    f.write(content)
    
print("All fixed")
