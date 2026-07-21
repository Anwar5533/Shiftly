import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should render login page with phone and email modes', async ({ page }) => {
    await page.goto('/login');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Shiftly/i);

    // Check that phone and email tabs exist
    await expect(page.locator('text=Phone OTP')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();

    // Click Email login toggle
    await page.click('text=Email');

    // Email inputs should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login');

    await page.click('text=Create an account');

    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h1', { hasText: 'Create an account' })).toBeVisible();
  });
});
