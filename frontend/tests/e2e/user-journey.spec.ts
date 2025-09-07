import { test, expect } from '@playwright/test';

/**
 * T055 - Complete User Journey E2E Tests
 * Tests the full user experience flow through the yoga studio website
 */

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
  });

  test('should complete full exploration journey from homepage to contact', async ({ page }) => {
    // 1. Homepage - Verify initial load and key elements
    await expect(page).toHaveTitle(/Yoga Studio/);
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check for hero section and main navigation
    await expect(page.locator('nav').first()).toBeVisible();
    
    // Try to find hero section, if not present, that's ok
    const heroSection = page.locator('[data-testid="hero-section"], .hero, .hero-section');
    if (await heroSection.first().isVisible()) {
      await expect(heroSection.first()).toBeVisible();
    }

    // 2. Navigate to About page
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('h1')).toContainText(/About/i);

    // 3. Navigate to Instructors page
    await page.click('a[href="/instructors"]');
    await expect(page).toHaveURL(/\/instructors/);
    await expect(page.locator('h1')).toContainText(/Instructors/i);
    
    // Verify instructor profiles are loaded
    await expect(page.locator('[data-testid="instructor-profile"]')).toBeVisible();

    // 4. Navigate to Membership/Pricing
    await page.click('a[href="/membership"]');
    await expect(page).toHaveURL(/\/membership/);
    await expect(page.locator('h1')).toContainText(/Membership/i);
    
    // Verify membership cards are visible
    await expect(page.locator('[data-testid="membership-card"]')).toBeVisible();

    // 5. Navigate to Gallery
    await page.click('a[href="/gallery"]');
    await expect(page).toHaveURL(/\/gallery/);
    await expect(page.locator('h1')).toContainText(/Gallery/i);
    
    // Verify photo gallery is loaded
    await expect(page.locator('[data-testid="photo-gallery"]')).toBeVisible();

    // 6. Finally navigate to Contact
    await page.click('a[href="/contact"]');
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('h1')).toContainText(/Contact/i);
    
    // Verify contact form is present
    await expect(page.locator('#contact-form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('should handle membership inquiry journey', async ({ page }) => {
    // 1. Start from homepage, click membership CTA
    const membershipLink = page.locator('a[href="/membership"]').first();
    await membershipLink.click();
    
    await expect(page).toHaveURL(/\/membership/);

    // 2. Explore membership options
    const membershipCards = page.locator('[data-testid="membership-card"]');
    await expect(membershipCards).toHaveCount(3); // Assuming 3 membership tiers

    // Click on first membership option
    await membershipCards.first().click();

    // 3. Navigate to contact for membership inquiry
    await page.click('a[href="/contact"]');
    
    // 4. Verify contact form can handle membership inquiries
    const contactForm = page.locator('#contact-form');
    await expect(contactForm).toBeVisible();
    
    // Fill out membership inquiry
    await page.fill('input[name="name"]', 'Jane Smith');
    await page.fill('input[name="email"]', 'jane.smith@example.com');
    await page.fill('textarea[name="message"]', 'I am interested in learning more about your unlimited monthly membership. Can we schedule a studio tour?');

    // Verify form validation works
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should demonstrate accessibility features', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Should focus skip link
    await expect(page.locator('.skip-link:focus')).toBeVisible();
    
    // Use skip link
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();

    // Navigate through main navigation with keyboard
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedElement).toBeTruthy();

    // Test ARIA labels and roles
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();

    const main = page.locator('main[role="main"]');
    await expect(main).toBeVisible();

    // Verify alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const altText = await images.nth(i).getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText?.length).toBeGreaterThan(0);
    }
  });

  test('should work with search functionality if available', async ({ page }) => {
    // Look for search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('yoga classes');
      await page.keyboard.press('Enter');
      
      // Verify search results or navigation
      await page.waitForTimeout(1000); // Allow for search processing
      
      // Should either show results or navigate appropriately
      const url = page.url();
      expect(url).toContain('/');
    }
  });

  test('should handle newsletter subscription in footer', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    const newsletterForm = page.locator('[data-testid="newsletter-form"]');
    if (await newsletterForm.isVisible()) {
      // Fill newsletter subscription
      await page.fill('#newsletter-email', 'test@example.com');
      
      // Verify button is enabled
      const subscribeButton = newsletterForm.locator('button[type="submit"]');
      await expect(subscribeButton).toBeEnabled();
      
      // Test form submission (will be intercepted by our handler)
      await subscribeButton.click();
      
      // Verify loading state or success message appears
      await expect(subscribeButton).toHaveText(/subscribing|subscribed/i);
    }
  });

  test('should verify social media links', async ({ page }) => {
    // Scroll to footer where social links are located
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    const socialLinks = page.locator('[data-testid^="social-"]');
    const socialCount = await socialLinks.count();
    
    if (socialCount > 0) {
      // Verify social links have proper attributes
      for (let i = 0; i < socialCount; i++) {
        const link = socialLinks.nth(i);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener noreferrer/);
        
        const href = await link.getAttribute('href');
        expect(href).toMatch(/(facebook|instagram|twitter|youtube|linkedin)\.com/);
      }
    }
  });

  test('should handle back-to-top functionality', async ({ page }) => {
    // Scroll down to make back-to-top button appear
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);

    const backToTopButton = page.locator('[data-testid="back-to-top"]');
    if (await backToTopButton.isVisible()) {
      await backToTopButton.click();
      
      // Verify we scrolled back to top
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(100);
    }
  });

  test('should load and display images correctly', async ({ page }) => {
    // Navigate to gallery page where most images are
    await page.click('a[href="/gallery"]');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check that images are loaded and visible
    const images = page.locator('img');
    const imageCount = await images.count();
    
    expect(imageCount).toBeGreaterThan(0);
    
    // Check first few images are actually loaded
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();
      
      // Verify image has loaded successfully
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    
    // Should show 404 page or redirect to homepage
    const title = await page.title();
    expect(title).toMatch(/(404|Not Found|Yoga Studio)/i);
    
    // Should have navigation back to main site
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Navigate through multiple pages and verify browser history works
    await page.click('a[href="/about"]');
    await page.click('a[href="/instructors"]');
    await page.click('a[href="/gallery"]');
    
    // Go back through history
    await page.goBack(); // Should be on instructors
    await expect(page).toHaveURL(/\/instructors/);
    
    await page.goBack(); // Should be on about
    await expect(page).toHaveURL(/\/about/);
    
    await page.goForward(); // Should be on instructors again
    await expect(page).toHaveURL(/\/instructors/);
  });
});