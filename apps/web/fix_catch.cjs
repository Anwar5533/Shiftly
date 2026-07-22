const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json'
});

project.addSourceFilesAtPaths('src/**/*.tsx');
project.addSourceFilesAtPaths('src/**/*.ts');
const sourceFiles = project.getSourceFiles();

sourceFiles.forEach(sourceFile => {
  let changed = false;
  
  const catchClauses = sourceFile.getDescendantsOfKind(SyntaxKind.CatchClause);
  
  catchClauses.forEach(catchClause => {
    const variable = catchClause.getVariableDeclaration();
    if (variable) {
      const varName = variable.getName();
      // If the block already contains `as import('axios')`, skip
      const block = catchClause.getBlock();
      if (block.getText().includes("as import('axios')")) return;
      
      // Rename variable to `_error`
      variable.rename('_error');
      
      // Insert assertion at the top of the block
      block.insertStatements(0, `const ${varName} = _error as import('axios').AxiosError<Record<string, unknown>>;`);
      changed = true;
    }
  });

  if (changed) {
    console.log(`Fixed catch blocks in ${sourceFile.getFilePath()}`);
    sourceFile.saveSync();
  }
});
