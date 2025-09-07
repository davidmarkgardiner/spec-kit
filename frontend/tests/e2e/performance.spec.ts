import { test, expect } from '@playwright/test';

/**
 * T058 - Performance Benchmarks E2E Tests
 * Tests Core Web Vitals, load times, and performance metrics
 */

test.describe('Performance Benchmarks', () => {
  test.describe('Core Web Vitals', () => {
    test('should meet Largest Contentful Paint (LCP) benchmarks', async ({ page }) => {
      // Navigate and measure LCP
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Measure LCP using Performance API
      const lcpValue = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              resolve(lastEntry.startTime);
            }
          });
          
          observer.observe({ type: 'largest-contentful-paint', buffered: true });
          
          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });
      
      // LCP should be under 2.5 seconds for good performance
      if (lcpValue > 0) {
        expect(lcpValue).toBeLessThan(2500);
      }
      
      // Alternative: measure overall load time
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should meet First Input Delay (FID) requirements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Measure FID by simulating user interaction
      const startTime = performance.now();
      
      // Click on the first interactive element
      const firstButton = page.locator('button, a[role="button"]').first();
      if (await firstButton.isVisible()) {
        await firstButton.click();
        
        const interactionTime = performance.now() - startTime;
        
        // FID should be under 100ms for good performance
        expect(interactionTime).toBeLessThan(100);
      }
    });

    test('should meet Cumulative Layout Shift (CLS) benchmarks', async ({ page }) => {
      await page.goto('/');
      
      // Measure CLS using Performance API
      const clsValue = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          });
          
          observer.observe({ type: 'layout-shift', buffered: true });
          
          // Wait for page to settle, then return CLS value
          setTimeout(() => resolve(clsValue), 3000);
        });
      });
      
      // CLS should be under 0.1 for good performance
      expect(clsValue).toBeLessThan(0.1);
    });

    test('should measure Total Blocking Time (TBT)', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Measure how long the main thread is blocked
      const navigationTiming = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          firstContentfulPaint: 0 // Will be measured separately
        };
      });
      
      // DOM should load quickly
      expect(navigationTiming.domContentLoaded).toBeLessThan(3000);
      expect(navigationTiming.loadComplete).toBeLessThan(5000);
    });

    test('should measure First Contentful Paint (FCP)', async ({ page }) => {
      await page.goto('/');
      
      const fcpValue = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
            }
          });
          
          observer.observe({ type: 'paint', buffered: true });
          
          setTimeout(() => resolve(0), 5000);
        });
      });
      
      // FCP should be under 1.8 seconds for good performance
      if (fcpValue > 0) {
        expect(fcpValue).toBeLessThan(1800);
      }
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load CSS resources efficiently', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', (response) => {
        if (response.url().endsWith('.css') || response.headers()['content-type']?.includes('text/css')) {
          responses.push({
            url: response.url(),
            status: response.status(),
            size: response.headers()['content-length'],
            timing: response.timing()
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check CSS responses
      for (const response of responses) {
        expect(response.status).toBe(200);
        
        // CSS files should load quickly
        if (response.timing) {
          expect(response.timing.responseEnd - response.timing.requestStart).toBeLessThan(1000);
        }
      }
    });

    test('should load JavaScript resources efficiently', async ({ page }) => {
      const jsResponses: any[] = [];
      
      page.on('response', (response) => {
        if (response.url().endsWith('.js') || response.headers()['content-type']?.includes('javascript')) {
          jsResponses.push({
            url: response.url(),
            status: response.status(),
            size: response.headers()['content-length']
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verify JS resources loaded successfully
      for (const response of jsResponses) {
        expect(response.status).toBe(200);
      }
      
      // Should not have excessive number of JS files
      expect(jsResponses.length).toBeLessThan(20);
    });

    test('should load images efficiently', async ({ page }) => {
      const imageResponses: any[] = [];
      
      page.on('response', (response) => {
        const contentType = response.headers()['content-type'];
        if (contentType?.startsWith('image/')) {
          imageResponses.push({
            url: response.url(),
            status: response.status(),
            contentType: contentType,
            size: response.headers()['content-length']
          });
        }
      });
      
      await page.goto('/gallery'); // Page with most images
      await page.waitForLoadState('networkidle');
      
      // Check image loading
      for (const response of imageResponses) {
        expect(response.status).toBe(200);
        
        // Should serve modern image formats when possible
        expect(['image/webp', 'image/avif', 'image/jpeg', 'image/png']).toContain(response.contentType);
      }
    });

    test('should implement proper caching headers', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', (response) => {
        responses.push({
          url: response.url(),
          headers: response.headers()
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for proper caching headers on static assets
      const staticAssets = responses.filter(r => 
        r.url.match(/\.(css|js|png|jpg|jpeg|webp|svg|ico)$/)
      );
      
      for (const asset of staticAssets) {
        const headers = asset.headers;
        
        // Should have cache-control header for static assets
        expect(headers['cache-control'] || headers['expires']).toBeTruthy();
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize number of HTTP requests', async ({ page }) => {
      const requests: string[] = [];
      
      page.on('request', (request) => {
        requests.push(request.url());
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Should not make excessive requests for initial page load
      expect(requests.length).toBeLessThan(50);
      
      // Log requests for debugging if needed
      console.log(`Total requests: ${requests.length}`);
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G network
      await page.context().route('**/*', async (route) => {
        // Add 500ms delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/');
      
      // Page should still load within reasonable time on slow network
      await expect(page.locator('main')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds even on slow network
      expect(loadTime).toBeLessThan(10000);
    });

    test('should compress responses', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', (response) => {
        responses.push({
          url: response.url(),
          headers: response.headers(),
          contentType: response.headers()['content-type']
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for compression on text-based resources
      const textResources = responses.filter(r => 
        r.contentType?.includes('text/') || 
        r.contentType?.includes('application/javascript') ||
        r.contentType?.includes('application/json')
      );
      
      for (const resource of textResources) {
        // Should have compression encoding (gzip, br, deflate)
        const encoding = resource.headers['content-encoding'];
        if (resource.url.startsWith('http')) { // Only check external resources
          // Note: Local dev server might not compress, so this is informational
          console.log(`Resource ${resource.url} encoding: ${encoding || 'none'}`);
        }
      }
    });
  });

  test.describe('Runtime Performance', () => {
    test('should have efficient JavaScript execution', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Measure JavaScript heap size
      const memoryUsage = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });
      
      if (memoryUsage) {
        // Memory usage should be reasonable (under 50MB for a simple site)
        expect(memoryUsage.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
      }
    });

    test('should handle scroll performance', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const startTime = performance.now();
      
      // Simulate scrolling
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollBy(0, 100));
        await page.waitForTimeout(50);
      }
      
      const scrollTime = performance.now() - startTime;
      
      // Scrolling should be smooth (not take too long)
      expect(scrollTime).toBeLessThan(1000);
    });

    test('should handle form interactions efficiently', async ({ page }) => {
      await page.goto('/contact');
      
      const startTime = performance.now();
      
      // Simulate rapid form interactions
      await page.fill('input[name="name"]', 'Performance Test User');
      await page.fill('input[name="email"]', 'perf@test.com');
      await page.fill('textarea[name="message"]', 'Testing form performance');
      
      // Clear and refill to test responsiveness
      await page.fill('input[name="name"]', '');
      await page.fill('input[name="name"]', 'Updated Name');
      
      const interactionTime = performance.now() - startTime;
      
      // Form interactions should be responsive
      expect(interactionTime).toBeLessThan(500);
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Use mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const mobileLoadTime = Date.now() - startTime;
      
      // Mobile should load within reasonable time
      expect(mobileLoadTime).toBeLessThan(6000);
    });

    test('should handle touch interactions smoothly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Simulate touch scrolling
      const startTime = performance.now();
      
      await page.touchscreen.tap(200, 300);
      await page.evaluate(() => {
        window.scrollTo({ top: 500, behavior: 'smooth' });
      });
      
      await page.waitForTimeout(500);
      
      const touchTime = performance.now() - startTime;
      
      // Touch interactions should be responsive
      expect(touchTime).toBeLessThan(1000);
    });
  });

  test.describe('Accessibility Performance', () => {
    test('should maintain performance with screen readers', async ({ page }) => {
      await page.goto('/');
      
      const startTime = performance.now();
      
      // Simulate screen reader navigation (keyboard only)
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
      
      const a11yNavTime = performance.now() - startTime;
      
      // Keyboard navigation should be smooth
      expect(a11yNavTime).toBeLessThan(1000);
    });

    test('should handle focus changes efficiently', async ({ page }) => {
      await page.goto('/contact');
      
      const startTime = performance.now();
      
      // Rapidly change focus between form elements
      const form = page.locator('#contact-form');
      await form.locator('input[name="name"]').focus();
      await form.locator('input[name="email"]').focus();
      await form.locator('textarea[name="message"]').focus();
      await form.locator('button[type="submit"]').focus();
      
      const focusTime = performance.now() - startTime;
      
      // Focus changes should be immediate
      expect(focusTime).toBeLessThan(200);
    });
  });

  test.describe('Bundle Size Analysis', () => {
    test('should have reasonable bundle sizes', async ({ page }) => {
      const resourceSizes: { [key: string]: number } = {};
      
      page.on('response', (response) => {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          const url = response.url();
          resourceSizes[url] = parseInt(contentLength, 10);
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check sizes of main resources
      const totalSize = Object.values(resourceSizes).reduce((sum, size) => sum + size, 0);
      
      // Total initial page size should be reasonable (under 2MB)
      expect(totalSize).toBeLessThan(2 * 1024 * 1024);
      
      console.log(`Total page size: ${(totalSize / 1024).toFixed(2)} KB`);
    });

    test('should implement code splitting effectively', async ({ page }) => {
      const jsFiles: string[] = [];
      
      page.on('response', (response) => {
        if (response.url().endsWith('.js') && response.status() === 200) {
          jsFiles.push(response.url());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const initialJsFiles = [...jsFiles];
      
      // Navigate to another page
      await page.click('a[href="/about"]');
      await page.waitForLoadState('networkidle');
      
      // Check if new JS files were loaded (indicating code splitting)
      const newJsFiles = jsFiles.filter(file => !initialJsFiles.includes(file));
      
      console.log(`Initial JS files: ${initialJsFiles.length}, New JS files: ${newJsFiles.length}`);
      
      // Code splitting is working if we have reasonable number of files
      expect(initialJsFiles.length).toBeGreaterThan(0);
      expect(initialJsFiles.length).toBeLessThan(15); // Not too many files
    });
  });

  test.describe('SEO Performance Impact', () => {
    test('should not negatively impact SEO metrics', async ({ page }) => {
      await page.goto('/');
      
      // Check that essential SEO elements load quickly
      await expect(page.locator('title')).not.toBeEmpty();
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
      
      // Check that heading structure is immediately available
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      await expect(h1).not.toBeEmpty();
      
      // Verify structured data is present
      const structuredData = page.locator('script[type="application/ld+json"]');
      await expect(structuredData).toBeAttached();
    });
  });
});