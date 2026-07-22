import { Page, expect } from '@playwright/test';

export async function loginAsEmployer(page: Page) {
  await page.goto('/login');
  await page.click('text=Email');
  await page.fill('input[type="email"]', 'employer@shiftly.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/);
}

export async function loginAsWorker(page: Page) {
  await page.goto('/login');
  await page.click('text=Email');
  await page.fill('input[type="email"]', 'worker@shiftly.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/);
}
