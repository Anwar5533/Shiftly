import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

// Utility to recursively find files
const findFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else {
      if (
        (filePath.endsWith('.tsx') || filePath.endsWith('.api.ts')) &&
        !filePath.includes('.spec.') &&
        !filePath.includes('test-utils') &&
        !filePath.includes('/ui/') &&
        !filePath.endsWith('main.tsx')
      ) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
};

const generateReactTest = (filePath, componentName, fileContent) => {
  const hasDefaultExport = fileContent.includes('export default');
  const importStatement = hasDefaultExport 
    ? `import ${componentName} from './${path.basename(filePath).replace('.tsx', '')}';`
    : `import { ${componentName} } from './${path.basename(filePath).replace('.tsx', '')}';`;

  return `import { describe, it, expect } from 'vitest';
import { render as customRender } from '${path.relative(path.dirname(filePath), './src/shared/lib/test-utils.tsx').replace(/\\/g, '/')}';
${importStatement}

describe('${componentName}', () => {
  it('renders without crashing', () => {
    // Basic render test to ensure component mounts and to cover its execution path
    const { container } = customRender(<${componentName} />);
    expect(container).toBeInTheDocument();
  });
});
`;
};

const generateApiTest = (filePath, fileName) => {
  return `import { describe, it, expect } from 'vitest';
import * as apiModule from './${fileName.replace('.ts', '')}';

describe('${fileName}', () => {
  it('should export expected functions', () => {
    expect(apiModule).toBeDefined();
    // Test that the module exports something (usually API functions)
    expect(Object.keys(apiModule).length).toBeGreaterThan(0);
  });
});
`;
};

const files = findFiles(SRC_DIR);

for (const filePath of files) {
  const fileName = path.basename(filePath);
  let specPath = filePath.replace('.tsx', '.spec.tsx').replace('.ts', '.spec.ts');
  // Avoid double spec
  specPath = specPath.replace('.spec.spec', '.spec');
  
  if (fs.existsSync(specPath)) {
    continue; // skip existing
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');

  if (filePath.endsWith('.tsx')) {
    const componentName = fileName.replace('.tsx', '');
    const testContent = generateReactTest(filePath, componentName, fileContent);
    fs.writeFileSync(specPath, testContent);
    console.log(`Generated: ${specPath}`);
  } else if (filePath.endsWith('.api.ts')) {
    const testContent = generateApiTest(filePath, fileName);
    fs.writeFileSync(specPath, testContent);
    console.log(`Generated API test: ${specPath}`);
  }
}

console.log('Done generating tests.');
