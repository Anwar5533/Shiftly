const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir).filter(app => fs.statSync(path.join(appsDir, app)).isDirectory());

for (const app of apps) {
  const webpackConfigPath = path.join(appsDir, app, 'webpack.config.js');
  if (fs.existsSync(webpackConfigPath)) {
    let content = fs.readFileSync(webpackConfigPath, 'utf8');
    
    // Check if it already has our regex
    if (!content.includes('/^@prisma\\/client-.*$/')) {
      content = content.replace(
        /options\.externals\s*=\s*\[\s*nodeExternals\(\{[^}]+\}\),?\s*\];?/,
        (match) => {
          // just insert our regex into the array
          return match.replace(/\];?$/, ', /^@prisma\\/client-.*$/];');
        }
      );
      fs.writeFileSync(webpackConfigPath, content);
      console.log(`Updated webpack config for ${app}`);
    }
  }
}
