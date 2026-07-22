const fs = require('fs');
const path = require('path');

const dir = 'test-results/lifecycle-End-to-End-Job-L-1dc9c-er-applies-employer-accepts-chromium';
const traceZip = path.join(dir, 'trace.zip');

if (fs.existsSync(traceZip)) {
  console.log('Trace zip exists!');
} else {
  console.log('No trace zip found');
}
