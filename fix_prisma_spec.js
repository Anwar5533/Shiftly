const fs = require('fs');
const path = require('path');

const apps = ['applications-service', 'payments-service'];

apps.forEach(app => {
  const filePath = path.join(__dirname, 'apps', app, 'src/infrastructure/database/prisma.service.spec.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace require('@prisma/client').PrismaClient.prototype
    content = content.replace(
      /require\('@prisma\/client'\)\.PrismaClient\.prototype/g,
      'PrismaService.prototype as any'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${app}`);
  }
});
