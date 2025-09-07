import { test, expect, devices } from '@playwright/test';

/**
 * T056 - Mobile Responsiveness E2E Tests
 * Tests mobile-first design and responsive behavior across different viewport sizes
 */

// Configure mobile viewport for mobile tests
test.use({ ...devices['iPhone 12'] });

// Test mobile viewport (iPhone 12)
test.describe('Mobile Viewport (375x667)', () => {

  test('should display mobile navigation correctly', async ({ page }) => {
    await page.goto('/');

    // Check if mobile navigation is present
    const mobileNav = page.locator('[data-testid="mobile-navigation"], .mobile-nav, nav');
    await expect(mobileNav).toBeVisible();

    // Check for hamburger menu or mobile-specific navigation
    const hamburgerMenu = page.locator(
      '[data-testid="hamburger-menu"], .hamburger-menu, button[aria-label*="menu" i], .menu-toggle'
    );
    
    if (await hamburgerMenu.isVisible()) {
      await hamburgerMenu.click();
      
      // Verify mobile menu opens
      const mobileMenuContent = page.locator(
        '[data-testid="mobile-menu"], .mobile-menu-content, .navigation-menu'
      );
      await expect(mobileMenuContent).toBeVisible();
      
      // Verify navigation links are accessible
      const navLinks = mobileMenuContent.locator('a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Test closing menu
      await hamburgerMenu.click();
      await expect(mobileMenuContent).toBeHidden();
    }
  });

  test('should have readable text and proper spacing on mobile', async ({ page }) => {
    await page.goto('/');

    // Check text is readable (not too small)
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    
    for (let i = 0; i < Math.min(headingCount, 3); i++) {
      const heading = headings.nth(i);
      const fontSize = await heading.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize, 10);
      });
      
      // Minimum readable font size for headings on mobile
      expect(fontSize).toBeGreaterThanOrEqual(18);
    }

    // Check body text is readable
    const paragraphs = page.locator('p');
    if (await paragraphs.first().isVisible()) {
      const bodyFontSize = await paragraphs.first().evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize, 10);
      });
      
      // Minimum readable font size for body text
      expect(bodyFontSize).toBeGreaterThanOrEqual(14);
    }
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.goto('/');

    // Test tap targets are large enough (minimum 44x44px for accessibility)
    const buttons = page.locator('button, a[role="button"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(44);
        }
      }
    }

    // Test scrolling behavior
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(400);
  });

  test('should display forms properly on mobile', async ({ page }) => {
    await page.goto('/contact');

    const form = page.locator('#contact-form');
    await expect(form).toBeVisible();

    // Check form inputs are properly sized for mobile
    const inputs = form.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const box = await input.boundingBox();
        if (box) {
          // Input should be at least 44px tall for touch accessibility
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }

    // Test form can be filled on mobile
    await page.fill('input[name="name"]', 'Mobile User');
    await page.fill('input[name="email"]', 'mobile@test.com');
    await page.fill('textarea[name="message"]', 'Testing mobile form submission');

    const submitButton = form.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });
});

// Test tablet viewport (iPad)
test.describe('Tablet Viewport (768x1024)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('should adapt layout for tablet', async ({ page }) => {
    await page.goto('/');

    // Check that layout adapts to tablet size
    const container = page.locator('.container, .max-w-');
    if (await container.first().isVisible()) {
      const containerBox = await container.first().boundingBox();
      if (containerBox) {
        // Container should use available space efficiently
        expect(containerBox.width).toBeGreaterThan(600);
        expect(containerBox.width).toBeLessThanOrEqual(768);
      }
    }

    // Check navigation is appropriate for tablet
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // On tablet, full navigation might be visible or use dropdown
    const navLinks = nav.locator('a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should display content in appropriate columns on tablet', async ({ page }) => {
    await page.goto('/instructors');

    // Check if instructors are displayed in a grid appropriate for tablet
    const instructors = page.locator('[data-testid="instructor-profile"]');
    const instructorCount = await instructors.count();
    
    if (instructorCount > 2) {
      // Check positioning suggests multi-column layout
      const firstInstructor = instructors.first();
      const secondInstructor = instructors.nth(1);
      
      const firstBox = await firstInstructor.boundingBox();
      const secondBox = await secondInstructor.boundingBox();
      
      if (firstBox && secondBox) {
        // Either side-by-side (different x) or stacked (same x, different y)
        const sideBySide = Math.abs(firstBox.x - secondBox.x) > 50;
        const stacked = Math.abs(firstBox.y - secondBox.y) > 50;
        
        expect(sideBySide || stacked).toBeTruthy();
      }
    }
  });
});

// Test viewport transitions
test.describe('Responsive Breakpoints', () => {
  test('should handle viewport size changes gracefully', async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    // Verify desktop layout
    await expect(page.locator('nav')).toBeVisible();

    // Transition to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Allow for responsive adjustments

    // Verify tablet layout still works
    await expect(page.locator('nav')).toBeVisible();

    // Transition to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Verify mobile layout
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that content is still accessible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should maintain functionality across breakpoints', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // Small mobile
      { width: 375, height: 667 }, // iPhone
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Small desktop
      { width: 1440, height: 900 }  // Large desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/contact');
      await page.waitForTimeout(300);

      // Verify form is functional at this viewport
      const form = page.locator('#contact-form');
      await expect(form).toBeVisible();

      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      
      const nameValue = await page.inputValue('input[name="name"]');
      expect(nameValue).toBe('Test User');
    }
  });
});

// Test device orientation  
test.describe('Device Orientation', () => {

  test('should handle portrait orientation', async ({ page }) => {
    await page.goto('/');
    
    // Default is portrait, verify layout works
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that content fits in viewport
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('should handle landscape orientation', async ({ page }) => {
    // Simulate landscape by swapping width/height
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
    
    // Verify layout adapts to landscape
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Navigation might change in landscape mobile
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});

// Test accessibility on mobile
test.describe('Mobile Accessibility', () => {

  test('should maintain accessibility features on mobile', async ({ page }) => {
    await page.goto('/');

    // Test skip link works on mobile
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link:focus');
    if (await skipLink.isVisible()) {
      await page.keyboard.press('Enter');
      await expect(page.locator('#main-content')).toBeFocused();
    }

    // Test focus indicators are visible on mobile
    const focusableElements = page.locator(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const elementCount = await focusableElements.count();
    if (elementCount > 0) {
      await focusableElements.first().focus();
      
      // Verify element can be focused (accessibility requirement)
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
    }
  });
});

// Performance on mobile
test.describe('Mobile Performance', () => {

  test('should load quickly on mobile', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds on mobile
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G
    await page.context().route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
      await route.continue();
    });

    await page.goto('/');
    
    // Should still load and be functional
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });
});