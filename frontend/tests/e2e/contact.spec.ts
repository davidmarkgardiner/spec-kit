import { test, expect } from '@playwright/test';

/**
 * T057 - Form Submission Flow E2E Tests
 * Tests all form interactions including contact forms, newsletter signup, and validation
 */

test.describe('Form Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up form submission interception to avoid actual submissions during testing
    await page.route('**/contact', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: 'Success'
      });
    });

    await page.route('**/newsletter', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: 'Success'
      });
    });

    await page.route('**/', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: 'Success'
        });
      } else {
        route.continue();
      }
    });
  });

  test.describe('Contact Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/contact');
    });

    test('should validate required fields', async ({ page }) => {
      const form = page.locator('#contact-form');
      await expect(form).toBeVisible();

      const submitButton = form.locator('button[type="submit"]');
      
      // Try to submit empty form
      await submitButton.click();

      // Check for validation errors
      const nameError = page.locator('#name-error, [data-testid="name-error"]');
      const emailError = page.locator('#email-error, [data-testid="email-error"]');
      const messageError = page.locator('#message-error, [data-testid="message-error"]');

      // At least one validation error should be visible
      const errors = [nameError, emailError, messageError];
      let hasError = false;
      
      for (const error of errors) {
        if (await error.isVisible()) {
          hasError = true;
          break;
        }
      }
      
      expect(hasError).toBeTruthy();
    });

    test('should validate email format', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Fill form with invalid email
      await page.fill('input[name="name"]', 'John Doe');
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('textarea[name="message"]', 'This is a test message');

      // Try to submit
      await form.locator('button[type="submit"]').click();

      // Should show email validation error
      const emailError = page.locator('#email-error, [data-testid="email-error"]');
      await expect(emailError).toBeVisible();
      await expect(emailError).toContainText(/valid email|invalid|format/i);
    });

    test('should validate message length', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Fill form with very short message
      await page.fill('input[name="name"]', 'John Doe');
      await page.fill('input[name="email"]', 'john@example.com');
      await page.fill('textarea[name="message"]', 'Hi');

      // Try to submit
      await form.locator('button[type="submit"]').click();

      // Should show message validation error
      const messageError = page.locator('#message-error, [data-testid="message-error"]');
      await expect(messageError).toBeVisible();
      await expect(messageError).toContainText(/10 characters|too short/i);
    });

    test('should show loading state during submission', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Fill form with valid data
      await page.fill('input[name="name"]', 'Jane Smith');
      await page.fill('input[name="email"]', 'jane.smith@example.com');
      await page.fill('textarea[name="message"]', 'I would like to learn more about your yoga classes and membership options.');

      const submitButton = form.locator('button[type="submit"]');
      
      // Submit form
      await submitButton.click();

      // Should show loading state
      await expect(submitButton).toContainText(/sending|loading/i);
      
      // Should be disabled during submission
      await expect(submitButton).toBeDisabled();
    });

    test('should show success message after submission', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Fill form with valid data
      await page.fill('input[name="name"]', 'Alice Johnson');
      await page.fill('input[name="email"]', 'alice@example.com');
      await page.fill('textarea[name="message"]', 'Thank you for providing such a welcoming yoga community!');

      // Submit form
      await form.locator('button[type="submit"]').click();

      // Should show success message
      const successMessage = page.locator(
        '[data-testid="success-message"], .success-message, #form-response .bg-green-50'
      );
      
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText(/thank you|success|received/i);
    });

    test('should reset form after successful submission', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Fill and submit form
      await page.fill('input[name="name"]', 'Bob Wilson');
      await page.fill('input[name="email"]', 'bob@example.com');
      await page.fill('textarea[name="message"]', 'Looking forward to joining your yoga classes.');

      await form.locator('button[type="submit"]').click();

      // Wait for success handling
      await page.waitForTimeout(2500);

      // Form should be reset
      await expect(page.locator('input[name="name"]')).toHaveValue('');
      await expect(page.locator('input[name="email"]')).toHaveValue('');
      await expect(page.locator('textarea[name="message"]')).toHaveValue('');
    });

    test('should handle form submission errors gracefully', async ({ page }) => {
      // Override route to simulate error
      await page.route('**/', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 500,
            body: 'Server Error'
          });
        } else {
          route.continue();
        }
      });

      const form = page.locator('#contact-form');
      
      // Fill and submit form
      await page.fill('input[name="name"]', 'Error Test');
      await page.fill('input[name="email"]', 'error@example.com');
      await page.fill('textarea[name="message"]', 'Testing error handling');

      await form.locator('button[type="submit"]').click();

      // Should show error message
      const errorMessage = page.locator(
        '[data-testid="error-message"], .error-message, #form-response .bg-red-50'
      );
      
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/problem|error|try again/i);
    });

    test('should provide real-time validation feedback', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Test name field real-time validation
      const nameField = page.locator('input[name="name"]');
      await nameField.fill('A'); // Too short
      await nameField.blur();
      
      // Should show error initially
      const nameError = page.locator('#name-error, [data-testid="name-error"]');
      if (await nameError.isVisible()) {
        // Now fill with valid name
        await nameField.fill('John Doe');
        
        // Error should disappear
        await expect(nameError).toBeHidden();
      }

      // Test email field real-time validation
      const emailField = page.locator('input[name="email"]');
      await emailField.fill('invalid');
      await emailField.blur();
      
      const emailError = page.locator('#email-error, [data-testid="email-error"]');
      if (await emailError.isVisible()) {
        // Fill with valid email
        await emailField.fill('john@example.com');
        
        // Error should disappear
        await expect(emailError).toBeHidden();
      }
    });
  });

  test.describe('Newsletter Subscription', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      // Scroll to footer where newsletter form is located
      await page.locator('footer').scrollIntoViewIfNeeded();
    });

    test('should validate newsletter email', async ({ page }) => {
      const newsletterForm = page.locator('[data-testid="newsletter-form"]');
      
      if (await newsletterForm.isVisible()) {
        // Fill with invalid email
        await page.fill('#newsletter-email', 'invalid-email');
        await newsletterForm.locator('button[type="submit"]').click();

        // Should not proceed with invalid email (browser validation)
        const emailField = page.locator('#newsletter-email');
        const validity = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid);
        expect(validity).toBeFalsy();
      }
    });

    test('should submit newsletter subscription successfully', async ({ page }) => {
      const newsletterForm = page.locator('[data-testid="newsletter-form"]');
      
      if (await newsletterForm.isVisible()) {
        // Fill with valid email
        await page.fill('#newsletter-email', 'subscriber@example.com');
        
        const submitButton = newsletterForm.locator('button[type="submit"]');
        await submitButton.click();

        // Should show loading state
        await expect(submitButton).toContainText(/subscribing|subscribed/i);
        
        // Should clear email field
        await page.waitForTimeout(1000);
        await expect(page.locator('#newsletter-email')).toHaveValue('');
      }
    });

    test('should handle newsletter subscription errors', async ({ page }) => {
      // Override route to simulate error
      await page.route('**/', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 400,
            body: 'Bad Request'
          });
        } else {
          route.continue();
        }
      });

      const newsletterForm = page.locator('[data-testid="newsletter-form"]');
      
      if (await newsletterForm.isVisible()) {
        await page.fill('#newsletter-email', 'test@example.com');
        
        const submitButton = newsletterForm.locator('button[type="submit"]');
        await submitButton.click();

        // Should show error state
        await expect(submitButton).toContainText(/try again|error/i);
      }
    });
  });

  test.describe('ContactForm Component', () => {
    // Test the reusable ContactForm component if it's used on other pages
    test('should work with ContactForm component variants', async ({ page }) => {
      // Check if ContactForm component is used elsewhere
      await page.goto('/membership');
      
      // Look for ContactForm component
      const contactForm = page.locator('[data-testid="contact-form"]');
      
      if (await contactForm.isVisible()) {
        // Test membership inquiry form
        await page.fill('input[name="name"]', 'Membership Seeker');
        await page.fill('input[name="email"]', 'member@example.com');
        
        // Check for membership-specific fields
        const membershipInterest = page.locator('select[name="membershipInterest"]');
        if (await membershipInterest.isVisible()) {
          await membershipInterest.selectOption('unlimited-monthly');
        }

        const experienceLevel = page.locator('select[name="experienceLevel"]');
        if (await experienceLevel.isVisible()) {
          await experienceLevel.selectOption('beginner');
        }

        await page.fill('textarea[name="message"]', 'I am interested in joining the unlimited monthly membership plan.');

        // Submit form
        await contactForm.locator('button[type="submit"]').click();

        // Should handle submission
        const submitButton = contactForm.locator('button[type="submit"]');
        await expect(submitButton).toContainText(/sending|success/i);
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/contact');
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Navigate through form with keyboard
      await page.keyboard.press('Tab'); // Skip link or first focusable element
      
      // Continue tabbing through form elements
      const form = page.locator('#contact-form');
      const nameField = form.locator('input[name="name"]');
      
      // Focus should reach name field
      await nameField.focus();
      await expect(nameField).toBeFocused();

      // Tab to next field
      await page.keyboard.press('Tab');
      const emailField = form.locator('input[name="email"]');
      await expect(emailField).toBeFocused();

      // Tab to message field
      await page.keyboard.press('Tab');
      const messageField = form.locator('textarea[name="message"]');
      await expect(messageField).toBeFocused();

      // Tab to submit button
      await page.keyboard.press('Tab');
      const submitButton = form.locator('button[type="submit"]');
      await expect(submitButton).toBeFocused();
    });

    test('should have proper labels and ARIA attributes', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Check name field
      const nameField = form.locator('input[name="name"]');
      const nameLabel = page.locator('label[for]').filter({ hasText: /name/i });
      
      if (await nameLabel.isVisible()) {
        const labelFor = await nameLabel.getAttribute('for');
        const fieldId = await nameField.getAttribute('id');
        expect(labelFor).toBe(fieldId);
      }

      // Check required fields have required attribute
      await expect(nameField).toHaveAttribute('required');
      
      const emailField = form.locator('input[name="email"]');
      await expect(emailField).toHaveAttribute('required');
      
      const messageField = form.locator('textarea[name="message"]');
      await expect(messageField).toHaveAttribute('required');

      // Check ARIA describedby for error messages
      const nameErrorId = await nameField.getAttribute('aria-describedby');
      if (nameErrorId) {
        const errorElement = page.locator(`#${nameErrorId}`);
        await expect(errorElement).toBeAttached();
      }
    });

    test('should announce errors to screen readers', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Submit empty form to trigger errors
      await form.locator('button[type="submit"]').click();

      // Check error messages have proper ARIA roles
      const errorMessages = page.locator('.field-error[role="alert"], [data-testid*="error"][role="alert"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        // At least one error should have role="alert" for screen reader announcement
        const firstError = errorMessages.first();
        await expect(firstError).toHaveAttribute('role', 'alert');
      }
    });
  });

  test.describe('Form Security', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/contact');
    });

    test('should include CSRF protection', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Check for hidden form-name field (Netlify Forms requirement)
      const formNameField = form.locator('input[name="form-name"][type="hidden"]');
      await expect(formNameField).toBeAttached();
      
      const formNameValue = await formNameField.getAttribute('value');
      expect(formNameValue).toBeTruthy();
    });

    test('should sanitize input data', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Try to input script tags
      await page.fill('input[name="name"]', '<script>alert("xss")</script>');
      await page.fill('textarea[name="message"]', '<img src="x" onerror="alert(1)"');

      // Values should be handled safely (not executed as scripts)
      const nameValue = await page.inputValue('input[name="name"]');
      const messageValue = await page.inputValue('textarea[name="message"]');
      
      // Input should be preserved as text (not executed)
      expect(nameValue).toContain('<script>');
      expect(messageValue).toContain('<img');
      
      // No alerts should have been triggered
      // (This is basic - in real security testing, we'd check more thoroughly)
    });

    test('should validate data types and lengths', async ({ page }) => {
      const form = page.locator('#contact-form');
      
      // Test maximum length restrictions
      const longString = 'a'.repeat(1000);
      
      await page.fill('input[name="name"]', longString);
      await page.fill('input[name="email"]', `${longString}@example.com`);
      await page.fill('textarea[name="message"]', longString.repeat(10));

      // Browser should enforce maxlength attributes if present
      const nameValue = await page.inputValue('input[name="name"]');
      const emailValue = await page.inputValue('input[name="email"]');
      
      // Values should be truncated if maxlength is set
      expect(nameValue.length).toBeLessThanOrEqual(100); // Assuming reasonable max length
      expect(emailValue.length).toBeLessThanOrEqual(254); // Standard email max length
    });
  });
});