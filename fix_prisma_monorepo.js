const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir).filter(app => {
  return fs.statSync(path.join(appsDir, app)).isDirectory() && fs.existsSync(path.join(appsDir, app, 'prisma', 'schema.prisma'));
});

function processApp(appName) {
  const appPath = path.join(appsDir, appName);
  const schemaPath = path.join(appPath, 'prisma', 'schema.prisma');
  
  // Clean up old local client if exists
  const oldLocalClient = path.join(appPath, 'src', 'infrastructure', 'prisma', 'client');
  if (fs.existsSync(oldLocalClient)) {
    fs.rmSync(oldLocalClient, { recursive: true, force: true });
    console.log(`Removed old local client for ${appName}`);
  }

  // 1. Update schema.prisma
  const newOutput = `../../../node_modules/@prisma/client-${appName}`;
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // replace output = "../src/infrastructure/prisma/client" with the new one
  schemaContent = schemaContent.replace(/output\s*=\s*"[^"]+"/g, `output   = "${newOutput}"`);
  
  fs.writeFileSync(schemaPath, schemaContent);
  console.log(`Updated schema for ${appName} to ${newOutput}`);

  // 2. Find all .ts files
  const tsFiles = [];
  function findTsFiles(dir) {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules' && file !== 'dist' && file !== 'coverage') {
          findTsFiles(fullPath);
        }
      } else if (fullPath.endsWith('.ts')) {
        tsFiles.push(fullPath);
      }
    }
  }
  findTsFiles(appPath);

  // 3. Update imports in .ts files
  for (const file of tsFiles) {
    let content = fs.readFileSync(file, 'utf8');
    
    // We need to replace relative imports like:
    // from '../../infrastructure/prisma/client'
    // from '../../../infrastructure/prisma/client'
    // or from '@prisma/client' (if any were missed)
    // with from '@prisma/client-appName'
    
    const packageName = `@prisma/client-${appName}`;
    
    let newContent = content.replace(/from\s+['"](?:\.\.\/)+infrastructure\/prisma\/client['"]/g, `from '${packageName}'`);
    newContent = newContent.replace(/from\s+['"](?:\.\.\/)+prisma\/client['"]/g, `from '${packageName}'`); // for seed.ts
    newContent = newContent.replace(/from\s+['"](?:\.\.\/)+src\/infrastructure\/prisma\/client['"]/g, `from '${packageName}'`);
    newContent = newContent.replace(/from\s+['"]@prisma\/client['"]/g, `from '${packageName}'`);
    
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      console.log(`Updated imports in ${path.relative(__dirname, file)} -> ${packageName}`);
    }
  }
}

for (const app of apps) {
  processApp(app);
}

// Special case for api/setup_user.ts which might import from local
const setupUserPath = path.join(appsDir, 'api', 'setup_user.ts');
if (fs.existsSync(setupUserPath)) {
  let content = fs.readFileSync(setupUserPath, 'utf8');
  let newContent = content.replace(/from\s+['"](?:\.\/)+prisma\/generated\/client['"]/g, `from '@prisma/client-api'`);
  newContent = newContent.replace(/from\s+['"]@prisma\/client['"]/g, `from '@prisma/client-api'`);
  if (newContent !== content) {
    fs.writeFileSync(setupUserPath, newContent);
    console.log(`Updated imports in api/setup_user.ts -> @prisma/client-api`);
  }
}

console.log('Done!');
