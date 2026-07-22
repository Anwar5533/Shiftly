import os
import re

directories = ['/Users/anwarkornipalli/Desktop/Shiftly/apps/web/src']

for root, dirs, files in os.walk(directories[0]):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()

            new_content = re.sub(r'const err\s*=\s*_error\s*as\s*import\(\'axios\'\)\.AxiosError.*?;\n', '', content)
            new_content = re.sub(r'const error\s*=\s*_error\s*as\s*import\(\'axios\'\)\.AxiosError.*?;\n', '', content)

            if new_content != content:
                with open(path, 'w') as f:
                    f.write(new_content)
                print(f"Fixed {path}")

