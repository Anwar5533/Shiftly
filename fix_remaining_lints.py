import os

files_to_fix = [
    'apps/web/src/features/admin/pages/SystemLogsPage.tsx',
    'apps/web/src/features/applications/pages/JobApplicationsPage.tsx',
    'apps/web/src/features/auth/pages/OtpPage.tsx',
    'apps/web/src/features/auth/pages/RegisterPage.tsx',
    'apps/web/src/features/dashboard/pages/EmployerDashboard.tsx',
    'apps/web/src/features/dashboard/pages/WorkerDashboard.spec.tsx',
    'apps/web/src/features/jobs/api/shifts.api.ts',
    'apps/web/src/features/messaging/pages/MessagesPage.tsx',
    'apps/web/src/features/messaging/pages/MessagingPage.tsx'
]

for file_path in files_to_fix:
    full_path = os.path.join('/Users/anwarkornipalli/Desktop/Shiftly', file_path)
    if not os.path.exists(full_path): continue
    
    with open(full_path, 'r') as f:
        content = f.read()
    
    # Remove all eslint-disable lines at the top
    lines = content.split('\n')
    new_lines = [line for line in lines if not line.strip().startswith('/* eslint-disable') and not line.strip().startswith('// eslint-disable')]
    
    with open(full_path, 'w') as f:
        f.write('\n'.join(new_lines))

print("Unused eslint-disable directives removed.")

