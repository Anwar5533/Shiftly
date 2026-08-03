const fs = require('fs');
const cp = require('child_process');

const diff = cp.execSync('git diff --cached', { maxBuffer: 1024 * 1024 * 50 }).toString();
const lines = diff.split('\n');

const secretPatterns = [
  /(?:api|secret|access)[_-]?(?:key|token|password)[\s:=]+['"][a-zA-Z0-9_\-]+['"]/i,
  /password[\s:=]+['"][^'"]+['"]/i,
  /sk-[a-zA-Z0-9]{20,}/,
  /eyJh[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/,
  /aws_access_key_id/i,
  /aws_secret_access_key/i,
  /-----BEGIN (?:RSA )?PRIVATE KEY-----/
];

let filename = '';
const hits = [];

for (const line of lines) {
  if (line.startsWith('+++ b/')) {
    filename = line.substring(6);
  } else if (line.startsWith('+') && !line.startsWith('+++')) {
    for (const pattern of secretPatterns) {
      if (pattern.test(line)) {
        if (line.toLowerCase().includes('password123') || line.toLowerCase().includes('test_secret') || line.toLowerCase().includes('secret_key')) {
           hits.push(`[${filename}] (Likely dummy) ${line.trim()}`);
        } else {
           hits.push(`[${filename}] ${line.trim()}`);
        }
        break;
      }
    }
  }
}

if (hits.length > 0) {
  console.log('Found potential secrets:');
  console.log(hits.join('\n'));
} else {
  console.log('No obvious secrets found in the diff.');
}
