const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir).filter(app => fs.statSync(path.join(appsDir, app)).isDirectory());

for (const app of apps) {
  const webpackConfigPath = path.join(appsDir, app, 'webpack.config.js');
  if (fs.existsSync(webpackConfigPath)) {
    const config = `const nodeExternals = require('webpack-node-externals');

module.exports = function (options, webpack) {
  options.externals = [
    nodeExternals({
      allowlist: [/^@shiftly\\//],
    }),
    /^@prisma\\/client-.*$/
  ];
  return options;
};
`;
    fs.writeFileSync(webpackConfigPath, config);
    console.log(`Fixed webpack config for ${app}`);
  }
}
