const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const filePath = path.join(appsDir, app, 'src/infrastructure/database/prisma.service.spec.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace require('@prisma/client').PrismaClient.prototype
    content = content.replace(
      /require\(['"]@prisma\/client['"]\)\.PrismaClient\.prototype/g,
      'PrismaService.prototype as any'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${app}`);
  }
});
