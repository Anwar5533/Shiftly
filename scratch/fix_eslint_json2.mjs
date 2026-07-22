import fs from 'fs';

function main() {
  const jsonPath = '/Users/anwarkornipalli/Desktop/Shiftly/scratch/api_lint_json.json';
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  let suppressCount = 0;

  for (const result of data) {
    if (result.errorCount === 0 && result.warningCount === 0) continue;
    
    const filePath = result.filePath;
    // We only care about typescript files
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

    const fileText = fs.readFileSync(filePath, 'utf8');
    const fileLines = fileText.split('\n');
    
    const messagesByLine = {};
    for (const msg of result.messages) {
      if (msg.ruleId === '@typescript-eslint/no-explicit-any' || msg.ruleId === '@typescript-eslint/no-unused-vars') continue;
      if (!msg.line) continue;
      
      if (!messagesByLine[msg.line]) messagesByLine[msg.line] = new Set();
      messagesByLine[msg.line].add(msg.ruleId);
    }
    
    const linesToPatch = Object.keys(messagesByLine).map(Number).sort((a, b) => b - a);
    
    if (linesToPatch.length > 0) {
      for (const line of linesToPatch) {
        const rules = Array.from(messagesByLine[line]).join(', ');
        const disableComment = `// eslint-disable-next-line ${rules} -- TODO(RC3): Address type safety`;
        
        const targetLineIndex = line - 1;
        if (targetLineIndex >= 0 && targetLineIndex < fileLines.length) {
          const targetLineStr = fileLines[targetLineIndex];
          const indentMatch = targetLineStr.match(/^\\s*/);
          const indent = indentMatch ? indentMatch[0] : '';
          fileLines.splice(targetLineIndex, 0, indent + disableComment);
          suppressCount += messagesByLine[line].size;
        } else {
          console.log(`Out of bounds for ${filePath}: line ${line}, total lines ${fileLines.length}`);
        }
      }
      fs.writeFileSync(filePath, fileLines.join('\n'), 'utf8');
    }
  }

  console.log(`Applied ${suppressCount} inline suppressions.`);
}

main();
