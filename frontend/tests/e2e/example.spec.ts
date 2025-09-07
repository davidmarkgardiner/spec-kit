import { test, expect } from '@playwright/test';

// Placeholder e2e test - actual tests will be implemented in T055-T058
test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Yoga Studio/);
  await expect(page.locator('h1')).toContainText('Welcome to our Yoga Studio');
});