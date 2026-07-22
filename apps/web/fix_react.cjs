const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json'
});

// Load the files that still have errors
const filesToFix = [
  'src/features/admin/pages/PlatformAnalyticsPage.tsx',
  'src/features/admin/pages/SystemLogsPage.tsx',
  'src/features/applications/pages/JobApplicationsPage.tsx',
  'src/features/applications/pages/MyApplicationsPage.tsx',
  'src/features/auth/pages/LoginPage.tsx',
  'src/features/auth/pages/OtpPage.tsx',
  'src/features/auth/pages/RegisterPage.tsx',
  'src/features/billing/pages/BillingPage.tsx',
  'src/features/candidates/pages/CandidatesPage.tsx',
  'src/features/dashboard/pages/EmployerDashboard.tsx',
  'src/features/dashboard/pages/RecruiterDashboard.tsx',
  'src/features/dashboard/pages/WorkerDashboard.spec.tsx',
  'src/features/jobs/pages/ActiveShiftPage.tsx',
  'src/features/jobs/pages/JobDetailPage.tsx',
  'src/features/jobs/pages/JobsListPage.tsx',
  'src/features/jobs/pages/ManageJobsPage.tsx',
  'src/features/jobs/pages/PostJobPage.tsx',
  'src/features/kyc/pages/VerificationPage.tsx',
  'src/features/messaging/pages/MessagesPage.tsx',
  'src/features/notifications/pages/NotificationsPage.tsx',
  'src/features/onboarding/pages/OnboardingPage.tsx',
  'src/features/profile/pages/EmployerProfilePage.tsx',
  'src/features/profile/pages/RecruiterProfilePage.tsx',
  'src/features/profile/pages/WorkerProfilePage.tsx',
  'src/features/reviews/components/ReviewModal.tsx',
  'src/features/settings/pages/SettingsPage.tsx',
  'src/features/timesheets/pages/TimesheetApprovalPage.tsx',
  'src/features/wallet/pages/WalletPage.tsx',
  'src/layouts/DashboardLayout.tsx',
  'src/shared/components/ErrorBoundaryPage.tsx',
  'src/shared/hooks/useAuthInit.ts',
  'src/shared/lib/api.ts'
];

project.addSourceFilesAtPaths(filesToFix);
const sourceFiles = project.getSourceFiles();

sourceFiles.forEach(sourceFile => {
  let changed = false;
  
  // Fix 1: no-floating-promises (Expression statements that contain call expressions returning promises without void/await)
  // Finding call expressions inside expression statements that might be promises.
  // Actually, navigating to `navigate(...)` is a classic case.
  const exprStatements = sourceFile.getDescendantsOfKind(SyntaxKind.ExpressionStatement);
  exprStatements.forEach(stmt => {
      const expr = stmt.getExpression();
      if (expr.getKind() === SyntaxKind.CallExpression) {
          const text = expr.getText();
          if (text.startsWith('navigate(') || text.startsWith('fetch') || text.startsWith('load') || text.startsWith('init')) {
             if (!stmt.getText().startsWith('void ')) {
                 expr.replaceWithText(`void ${text}`);
                 changed = true;
             }
          }
      }
  });
  
  // For JSX Attributes causing misused promises
  const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  jsxAttributes.forEach(attr => {
      const initializer = attr.getInitializer();
      if (initializer && initializer.getKind() === SyntaxKind.JsxExpression) {
          const expr = initializer.getExpression();
          if (expr && expr.getKind() === SyntaxKind.ArrowFunction) {
              const arrowFunc = expr;
              if (arrowFunc.isAsync()) {
                  // Found async () => ...
                  const params = arrowFunc.getParameters().map(p => p.getText()).join(', ');
                  const body = arrowFunc.getBody().getText();
                  
                  // Convert to non-async wrapper:
                  // (...args) => { void (async () => { ... })() }
                  const newText = `(${params}) => { void (async () => ${body.startsWith('{') ? body : `{ return ${body}; }`})(); }`;
                  arrowFunc.replaceWithText(newText);
                  changed = true;
              }
          }
      }
  });

  if (changed) {
    console.log(`Fixed React patterns in ${sourceFile.getFilePath()}`);
    sourceFile.saveSync();
  }
});
