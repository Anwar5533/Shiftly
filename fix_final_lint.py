with open('apps/web/src/features/jobs/pages/ActiveShiftPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("setError(err.response?.data?.message as string || 'Failed to load shift.');", "setError(err.response?.data?.message || 'Failed to load shift.');")

lines = content.split('\n')
new_lines = [line for line in lines if not line.strip().startswith('/* eslint-disable')]
with open('apps/web/src/features/jobs/pages/ActiveShiftPage.tsx', 'w') as f:
    f.write('\n'.join(new_lines))
