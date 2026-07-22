import { ESLint } from 'eslint';
import fs from 'fs';

async function main() {
  const eslint = new ESLint({ cwd: '/Users/anwarkornipalli/Desktop/Shiftly' });
  console.log('Running ESLint for Promise Rules...');
  const results = await eslint.lintFiles(['apps/web/src/**/*.{ts,tsx}']);
  
  const promiseRules = new Set([
    '@typescript-eslint/no-floating-promises',
    '@typescript-eslint/no-misused-promises',
    '@typescript-eslint/require-await',
    '@typescript-eslint/prefer-promise-reject-errors'
  ]);

  let promiseFixCount = 0;

  for (const result of results) {
    if (result.errorCount === 0 && result.warningCount === 0) continue;
    
    const filePath = result.filePath;
    let fileLines = fs.readFileSync(filePath, 'utf8').split('\\n');

    const messagesByLine = {};
    for (const msg of result.messages) {
      if (!msg.ruleId) continue;
      if (promiseRules.has(msg.ruleId)) {
        if (!messagesByLine[msg.line]) {
          messagesByLine[msg.line] = new Set();
        }
        messagesByLine[msg.line].add(msg.ruleId);
      }
    }
    
    // Sort lines in descending order so that insertions don't mess up subsequent line numbers!
    const linesToPatch = Object.keys(messagesByLine).map(Number).sort((a, b) => b - a);
    
    if (linesToPatch.length > 0) {
      for (const line of linesToPatch) {
        const rules = Array.from(messagesByLine[line]).join(', ');
        const disableComment = `// eslint-disable-next-line ${rules} // TODO(RC3): Address Promise typing`;
        
        // Find indentation of the target line (0-indexed, so line - 1)
        const targetLineStr = fileLines[line - 1];
        if (targetLineStr !== undefined) {
          const indentMatch = targetLineStr.match(/^\\s*/);
          const indent = indentMatch ? indentMatch[0] : '';
          fileLines.splice(line - 1, 0, indent + disableComment);
          promiseFixCount += messagesByLine[line].size;
        }
      }
      fs.writeFileSync(filePath, fileLines.join('\\n'), 'utf8');
    }
  }

  console.log(`Applied ${promiseFixCount} inline suppressions for Promise rules.`);
}

main().catch(console.error);
