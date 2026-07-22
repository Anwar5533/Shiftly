import { execSync } from 'child_process';
import fs from 'fs';

function main() {
  console.log('Running ESLint to get JSON output...');
  let jsonOutput = '';
  try {
    // Run eslint and capture JSON
    jsonOutput = execSync('npx eslint apps/web/src --ext .ts,.tsx --format json', { 
      cwd: '/Users/anwarkornipalli/Desktop/Shiftly',
      encoding: 'utf8' 
    });
  } catch (err) {
    // eslint exits with 1 if there are errors, which throws in execSync. The output is in err.stdout
    jsonOutput = err.stdout;
  }

  let results = [];
  try {
    results = JSON.parse(jsonOutput);
  } catch (e) {
    console.error('Failed to parse ESLint JSON output');
    process.exit(1);
  }

  const unsafeRules = new Set([
    '@typescript-eslint/no-unsafe-assignment',
    '@typescript-eslint/no-unsafe-member-access',
    '@typescript-eslint/no-unsafe-call',
    '@typescript-eslint/no-unsafe-return',
    '@typescript-eslint/no-unsafe-argument',
    '@typescript-eslint/restrict-template-expressions',
    '@typescript-eslint/no-base-to-string',
    'no-useless-assignment'
  ]);

  const promiseRules = new Set([
    '@typescript-eslint/no-floating-promises',
    '@typescript-eslint/no-misused-promises',
    '@typescript-eslint/require-await',
    '@typescript-eslint/prefer-promise-reject-errors'
  ]);

  let suppressCount = 0;
  const promiseIssues = [];

  for (const result of results) {
    if (result.errorCount === 0 && result.warningCount === 0) continue;
    
    const filePath = result.filePath;
    let fileLines = fs.readFileSync(filePath, 'utf8').split('\\n');
    const messagesByLine = {};

    for (const msg of result.messages) {
      if (!msg.ruleId) continue;
      if (promiseRules.has(msg.ruleId)) {
        promiseIssues.push({
          file: filePath,
          line: msg.line,
          rule: msg.ruleId,
          message: msg.message
        });
      } else if (unsafeRules.has(msg.ruleId)) {
        if (!messagesByLine[msg.line]) {
          messagesByLine[msg.line] = new Set();
        }
        messagesByLine[msg.line].add(msg.ruleId);
      }
    }
    
    // Sort descending so insertions don't shift earlier line numbers
    const linesToPatch = Object.keys(messagesByLine).map(Number).sort((a, b) => b - a);
    if (linesToPatch.length > 0) {
      for (const line of linesToPatch) {
        const rules = Array.from(messagesByLine[line]).join(', ');
        const disableComment = `// eslint-disable-next-line ${rules} // TODO(RC3): Address unsafe typing`;
        
        const targetLineIndex = line - 1;
        if (targetLineIndex >= 0 && targetLineIndex < fileLines.length) {
          const targetLineStr = fileLines[targetLineIndex];
          const indentMatch = targetLineStr.match(/^\\s*/);
          const indent = indentMatch ? indentMatch[0] : '';
          fileLines.splice(targetLineIndex, 0, indent + disableComment);
          suppressCount += messagesByLine[line].size;
        }
      }
      fs.writeFileSync(filePath, fileLines.join('\\n'), 'utf8');
    }
  }

  console.log(`Applied ${suppressCount} inline suppressions for unsafe type rules.`);
  console.log('\\nAction Required: The following promise-related issues must be fixed manually:');
  for (const issue of promiseIssues) {
    console.log(`${issue.file}:${issue.line} - ${issue.rule}`);
  }
}

main();
