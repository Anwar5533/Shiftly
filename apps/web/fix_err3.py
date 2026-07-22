import os
import re

api_dir = '/Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/features'

api_files = [
    'admin/api/admin.api.ts',
    'admin/api/analytics.api.ts',
    'admin/api/audit.api.ts',
    'billing/api/subscriptions.api.ts'
]

for file in api_files:
    path = os.path.join(api_dir, file)
    with open(path, 'r') as f:
        content = f.read()
    
    new_content = content.replace('return data;', 'return (data as any).data || data;')
    new_content = new_content.replace('return response.data;', 'return (response.data as any).data || response.data;')
    
    if new_content != content:
        with open(path, 'w') as f:
            f.write(new_content)
        print(f"Fixed {path}")

# Fix NotificationsPage.tsx
path = os.path.join(api_dir, 'notifications/pages/NotificationsPage.tsx')
with open(path, 'r') as f:
    content = f.read()
new_content = content.replace('queryFn: notificationsApi.getNotifications as () => Promise<Notification[]>,', 'queryFn: notificationsApi.getNotifications as unknown as () => Promise<Notification[]>,')
with open(path, 'w') as f:
    f.write(new_content)

# Fix EmployerProfilePage.tsx
path = os.path.join(api_dir, 'profile/pages/EmployerProfilePage.tsx')
with open(path, 'r') as f:
    content = f.read()
new_content = content.replace('const mockProfile: EmployerProfile = {', 'const mockProfile = {')
new_content = new_content.replace('employeeCount: \'11_TO_50\' as any,', 'employeeCount: \'11_TO_50\' as any,\n      } as unknown as EmployerProfile;')
with open(path, 'w') as f:
    f.write(new_content)

# Fix PlatformAnalyticsPage.tsx
path = os.path.join(api_dir, 'admin/pages/PlatformAnalyticsPage.tsx')
with open(path, 'r') as f:
    content = f.read()
new_content = content.replace('statsData?.', '(statsData as any)?.')
with open(path, 'w') as f:
    f.write(new_content)
    
