import os
import re

directories = ['/Users/anwarkornipalli/Desktop/Shiftly/apps/web/src']

for root, dirs, files in os.walk(directories[0]):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()

            new_content = content.replace('return (data as any).data || data;', 'return data.data;')
            new_content = new_content.replace('return (response.data as any).data || response.data;', 'return response.data.data;')
            
            # Fix unnecessary type assertions in NotificationsPage
            new_content = new_content.replace('(notifications as Notification[]).length', 'notifications.length')
            
            if new_content != content:
                with open(path, 'w') as f:
                    f.write(new_content)
                print(f"Fixed {path}")

