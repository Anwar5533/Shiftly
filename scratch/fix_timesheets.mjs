import fs from 'fs';
const file = 'apps/web/src/features/timesheets/pages/TimesheetsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the first line
content = content.replace(
  /\/\* eslint-disable .*\n/,
  '/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety */\n'
);

// Remove all single-line eslint-disable-next-line comments
content = content.replace(/\s*\/\/ eslint-disable-next-line.*?--.*?\n/g, '\n');
content = content.replace(/\s*\/\/ eslint-disable-next-line.*?\n/g, '\n');
content = content.replace(/\s*@typescript-eslint\/no-unsafe-member-access --.*?TODO\(RC3\): Address type safety\n/g, '\n');
content = content.replace(/\s*TODO\(RC3\): Address type safety\n/g, '\n');

// Clean up weird ternary formatting
content = content.replace(/\? \n\s*new Date/g, '? new Date');

fs.writeFileSync(file, content);
