import { test, expect } from '@playwright/test';
import { loginAsWorker } from './test-utils';

test.describe('Application Cancellation Workflow', () => {
  test('Worker can apply and cancel an application', async ({ page }) => {
    // 1. Log in as a worker
    await loginAsWorker(page);

    // 2. Go to jobs page and find a job to apply to
    await page.goto('/jobs');

    // Wait for jobs to load
    await page.waitForSelector('text=Apply');

    // Click on the first job link
    const firstJobLink = page.locator('a[href^="/jobs/"]').first();
    await firstJobLink.click();

    // 3. Apply to the job
    const applyButton = page.locator('button:has-text("Apply for this Job")');
    // Ensure the button is visible and active
    await expect(applyButton).toBeVisible();
    await applyButton.click();

    // The button should change to Applied Successfully or Pending and show Cancel Application
    await expect(
      page.locator('text=Applied Successfully').or(page.locator('text=Shortlisted')),
    ).toBeVisible();

    const cancelButton = page.locator('button:has-text("Cancel Application")');
    await expect(cancelButton).toBeVisible();

    // 4. Cancel the application
    // Mock the window.confirm dialogue to always return true
    page.on('dialog', (dialog) => dialog.accept());

    await cancelButton.click();

    // 5. Verify the application is withdrawn
    await expect(page.locator('text=Withdrawn')).toBeVisible();

    // The cancel button should be gone
    await expect(page.locator('button:has-text("Cancel Application")')).toHaveCount(0);
  });
});
