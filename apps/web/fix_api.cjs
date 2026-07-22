const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json' // Path relative to apps/web
});

project.addSourceFilesAtPaths('src/features/**/*.api.ts');
project.addSourceFilesAtPaths('src/shared/lib/api.ts');

const sourceFiles = project.getSourceFiles('src/features/**/*.api.ts');

sourceFiles.forEach(sourceFile => {
  let changed = false;
  
  // Find all CallExpressions (e.g., api.get(...))
  const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
  
  callExpressions.forEach(callExpr => {
    const expr = callExpr.getExpression();
    if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
      const propAccess = expr;
      const expressionText = propAccess.getExpression().getText();
      const propertyName = propAccess.getName();
      
      if (expressionText === 'api' && ['get', 'post', 'put', 'patch', 'delete'].includes(propertyName)) {
        // If it already has type arguments, skip
        if (callExpr.getTypeArguments().length > 0) return;
        
        // Find the nearest enclosing ArrowFunction or FunctionDeclaration
        const enclosingFunc = callExpr.getFirstAncestorByKind(SyntaxKind.ArrowFunction) || 
                              callExpr.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) ||
                              callExpr.getFirstAncestorByKind(SyntaxKind.MethodDeclaration);
        
        if (enclosingFunc) {
          const returnTypeNode = enclosingFunc.getReturnTypeNode();
          if (returnTypeNode && returnTypeNode.getKind() === SyntaxKind.TypeReference) {
            const typeName = returnTypeNode.getTypeName().getText();
            if (typeName === 'Promise') {
              const typeArgs = returnTypeNode.getTypeArguments();
              if (typeArgs.length > 0) {
                const innerTypeNode = typeArgs[0];
                const innerType = innerTypeNode.getText();
                
                let typeToInject = innerType;
                if (innerType === 'any') {
                    typeToInject = 'Record<string, unknown>';
                    innerTypeNode.replaceWithText('Record<string, unknown>');
                } else if (innerType === 'any[]') {
                    typeToInject = 'Record<string, unknown>[]';
                    innerTypeNode.replaceWithText('Record<string, unknown>[]');
                }
                
                callExpr.addTypeArgument(`ApiResponse<${typeToInject}>`);
                changed = true;
              }
            }
          } else {
             // Implicit return type
             callExpr.addTypeArgument('ApiResponse<Record<string, unknown>>');
             changed = true;
          }
        }
      }
    }
  });

  if (changed) {
    // Add import { ApiResponse } from '@shiftly/shared-types'; if not exists
    const hasImport = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === '@shiftly/shared-types' && decl.getNamedImports().some(n => n.getName() === 'ApiResponse'));
    
    if (!hasImport) {
        let importDecl = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === '@shiftly/shared-types');
        if (importDecl) {
            importDecl.addNamedImport('ApiResponse');
        } else {
            sourceFile.addImportDeclaration({
                moduleSpecifier: '@shiftly/shared-types',
                namedImports: ['ApiResponse']
            });
        }
    }

    console.log(`Fixed ${sourceFile.getFilePath()}`);
    sourceFile.saveSync();
  }
});
