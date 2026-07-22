const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Match the eslint-disable-next-line comment and any trailing "Address type safety" on the next line
    let newContent = content.replace(/[ \t]*\/\/[ \t]*eslint-disable-next-line[^\n]*\n([ \t]*Address type safety\n?)?/g, '');
    
    // Just in case there are loose "Address type safety" strings laying around inside JSX, we can remove them if they look out of place, but that might be dangerous.
    // Instead we will just rely on the above which captures the newline and the Address line if it exists.
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Cleaned ${filePath}`);
    }
  }
});
