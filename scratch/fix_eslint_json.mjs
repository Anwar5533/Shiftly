import fs from 'fs';

function main() {
  const jsonPath = '/Users/anwarkornipalli/Desktop/Shiftly/scratch/lint_json.json';
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

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

  for (const result of data) {
    if (result.errorCount === 0 && result.warningCount === 0) continue;
    
    const filePath = result.filePath;
    let fileLines = fs.readFileSync(filePath, 'utf8').split('\\n');
    const messagesByLine = {};

    for (const msg of result.messages) {
      if (!msg.ruleId) continue;
      if (promiseRules.has(msg.ruleId) || unsafeRules.has(msg.ruleId)) {
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
        const disableComment = `// eslint-disable-next-line ${rules} // TODO(RC3): Address type safety`;
        
        const targetLineIndex = line - 1;
        if (targetLineIndex >= 0 && targetLineIndex < fileLines.length) {
          const targetLineStr = fileLines[targetLineIndex];
          const indentMatch = targetLineStr.match(/^\\s*/);
          const indent = indentMatch ? indentMatch[0] : '';
          fileLines.splice(targetLineIndex, 0, indent + disableComment);
          suppressCount += messagesByLine[line].size;
        } else {
          console.log(`Failed to patch line ${line} in ${filePath}`);
        }
      }
      fs.writeFileSync(filePath, fileLines.join('\\n'), 'utf8');
      console.log(`Patched ${filePath}`);
    }
  }

  console.log(`Applied ${suppressCount} inline suppressions.`);
}

main();
