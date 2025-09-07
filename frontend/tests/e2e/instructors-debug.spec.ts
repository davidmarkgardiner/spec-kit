import { test, expect } from '@playwright/test';

test.describe('Instructors Page Debug', () => {
  test('inspect instructors page for bugs', async ({ page }) => {
    // Navigate to the instructors page
    await page.goto('http://localhost:3001/instructors');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for basic page structure
    console.log('=== PAGE INSPECTION ===');
    
    // Check if page loads successfully
    const response = await page.goto('http://localhost:3001/instructors');
    console.log('Status Code:', response?.status());
    
    // Get page title
    const title = await page.title();
    console.log('Page Title:', title);
    
    // Check for common error indicators
    const errorElements = await page.locator('*').filter({ hasText: /error|404|not found|something went wrong/i }).count();
    console.log('Error indicators found:', errorElements);
    
    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Refresh to capture any console errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    if (consoleErrors.length > 0) {
      console.log('Console Errors:');
      consoleErrors.forEach(error => console.log('  -', error));
    }
    
    // Check for network failures
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    if (failedRequests.length > 0) {
      console.log('Failed Requests:');
      failedRequests.forEach(req => console.log('  -', req));
    }
    
    // Check page content structure
    const bodyText = await page.locator('body').textContent();
    console.log('Page has content:', bodyText && bodyText.length > 100);
    
    // Look for instructor-related elements
    const instructorElements = await page.locator('[class*="instructor"], [id*="instructor"], h1, h2, h3').count();
    console.log('Instructor-related elements found:', instructorElements);
    
    // Check for images and their loading status
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log('Total images found:', imageCount);
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        console.log(`Image ${i + 1}: src="${src}", alt="${alt}", loaded=${naturalWidth > 0}`);
      }
    }
    
    // Check for loading states or spinners
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]').count();
    console.log('Loading indicators found:', loadingElements);
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'tests/screenshots/instructors-debug.png', fullPage: true });
    console.log('Screenshot saved: tests/screenshots/instructors-debug.png');
    
    // Check for accessibility issues
    const missingAltImages = await page.locator('img:not([alt])').count();
    console.log('Images without alt text:', missingAltImages);
    
    // Check for empty content areas
    const emptyDivs = await page.locator('div:empty').count();
    console.log('Empty div elements:', emptyDivs);
    
    console.log('=== END INSPECTION ===');
    
    // Fail the test if major issues are found
    expect(response?.status()).toBe(200);
    expect(errorElements).toBe(0);
  });
});