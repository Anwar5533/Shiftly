const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json' // Path relative to execution dir
});

const sourceFiles = project.getSourceFiles('src/features/**/*.api.ts');
console.log(`Found ${sourceFiles.length} files`);
if (sourceFiles.length > 0) {
    const file = sourceFiles[0];
    console.log(file.getFilePath());
    const callExprs = file.getDescendantsOfKind(SyntaxKind.CallExpression);
    callExprs.forEach(c => {
        const expr = c.getExpression();
        if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
            console.log("Expr: " + expr.getExpression().getText() + " Prop: " + expr.getName());
        }
    });
}
