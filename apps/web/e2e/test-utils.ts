import { Page, expect } from '@playwright/test';

export async function loginAsEmployer(page: Page) {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.click('text=Email');
  await page.fill('input[type="email"]', 'employer@shiftly.local');
  await page.fill('input[type="password"]', 'Password-123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
}

export async function loginAsWorker(page: Page) {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.click('text=Email');
  await page.fill('input[type="email"]', 'worker@shiftly.local');
  await page.fill('input[type="password"]', 'Password-123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
}
