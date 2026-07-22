const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json'
});
project.addSourceFilesAtPaths('src/**/*.tsx');
project.addSourceFilesAtPaths('src/**/*.ts');
const sourceFiles = project.getSourceFiles();

sourceFiles.forEach(sourceFile => {
  let changed = false;

  // 1. Fix floating promises for .mutate() calls and clipboard
  const callExprs = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
  callExprs.forEach(call => {
    const text = call.getText();
    if (text.includes('.mutate(') || text.includes('navigator.clipboard.writeText')) {
      const parent = call.getParent();
      if (parent && parent.getKind() === SyntaxKind.ExpressionStatement) {
        if (!parent.getText().startsWith('void ')) {
          call.replaceWithText(`void ${text}`);
          changed = true;
        }
      } else if (parent && parent.getKind() === SyntaxKind.ArrowFunction) {
         // if it's an arrow function returning it like () => mutate()
         // we can change to () => { void mutate(); }
         if (parent.getBody() === call) {
            call.replaceWithText(`{ void ${text}; }`);
            changed = true;
         }
      }
    }
  });

  // 2. Fix onError: (err: any) =>
  const arrowFuncs = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
  arrowFuncs.forEach(arrow => {
    const params = arrow.getParameters();
    if (params.length === 1 && params[0].getName() === 'err') {
       const typeNode = params[0].getTypeNode();
       if (typeNode && typeNode.getText() === 'any') {
          typeNode.replaceWithText('import(\'axios\').AxiosError<{message?: string}>');
          changed = true;
       }
    }
  });

  if (changed) {
    console.log(`Fixed misc issues in ${sourceFile.getFilePath()}`);
    sourceFile.saveSync();
  }
});
