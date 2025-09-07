import { describe, it, expect, beforeEach } from 'vitest'
import { getByRole, getByLabelText, getByText, fireEvent, waitFor } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Integration test for contact form workflow - based on user stories from quickstart.md
// This test MUST FAIL initially (TDD RED phase)
describe('Contact Form Workflow Integration', () => {
  let contactPageElement: HTMLElement

  beforeEach(async () => {
    // This will fail until we implement the contact page
    const { renderContactPage } = await import('../../src/pages/contact.astro')
    contactPageElement = await renderContactPage()
  })

  it('should display contact form with required fields', async () => {
    // Based on user story: visitor wants to submit an inquiry
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    expect(form).toBeInTheDocument()

    // Required fields per contract
    const nameField = getByLabelText(form!, /name/i)
    const emailField = getByLabelText(form!, /email/i)
    const messageField = getByLabelText(form!, /message/i)
    
    expect(nameField).toBeInTheDocument()
    expect(emailField).toBeInTheDocument()
    expect(messageField).toBeInTheDocument()
    
    // Fields should be properly marked as required
    expect(nameField).toHaveAttribute('required')
    expect(emailField).toHaveAttribute('required')
    expect(messageField).toHaveAttribute('required')
  })

  it('should have optional contact preference fields', async () => {
    // Based on contract: optional fields for better service
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    
    const phoneField = form?.querySelector('input[name="phone"]')
    const subjectField = form?.querySelector('input[name="subject"]')
    const preferredContactField = form?.querySelector('select[name="preferred_contact"]')
    
    if (phoneField) {
      expect(phoneField).not.toHaveAttribute('required')
    }
    
    if (preferredContactField) {
      expect(preferredContactField).toBeInTheDocument()
      
      // Should have enum options per contract
      const options = preferredContactField.querySelectorAll('option')
      const optionValues = Array.from(options).map(opt => opt.getAttribute('value'))
      expect(optionValues).toContain('email')
      expect(optionValues).toContain('phone')
      expect(optionValues).toContain('either')
    }
  })

  it('should show clear form validation messages', async () => {
    // Based on acceptance criteria: clear form validation messages
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    const submitButton = form?.querySelector('button[type="submit"]')
    
    // Try to submit empty form
    fireEvent.click(submitButton!)
    
    await waitFor(() => {
      const validationMessages = form?.querySelectorAll('[data-testid="validation-error"]')
      expect(validationMessages?.length).toBeGreaterThan(0)
    })
    
    // Should show specific error messages
    expect(form).toHaveTextContent(/name.*required/i)
    expect(form).toHaveTextContent(/email.*required/i)
    expect(form).toHaveTextContent(/message.*required/i)
  })

  it('should validate email format', async () => {
    // Based on contract: email format validation
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    const emailField = getByLabelText(form!, /email/i) as HTMLInputElement
    const submitButton = form?.querySelector('button[type="submit"]')
    
    // Fill in required fields with invalid email
    const nameField = getByLabelText(form!, /name/i) as HTMLInputElement
    const messageField = getByLabelText(form!, /message/i) as HTMLTextAreaElement
    
    fireEvent.change(nameField, { target: { value: 'John Doe' } })
    fireEvent.change(emailField, { target: { value: 'invalid-email' } })
    fireEvent.change(messageField, { target: { value: 'This is a test message that is long enough.' } })
    
    fireEvent.click(submitButton!)
    
    await waitFor(() => {
      expect(form).toHaveTextContent(/invalid email|email format/i)
    })
  })

  it('should validate phone number format when provided', async () => {
    // Based on contract: phone validation
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    const phoneField = form?.querySelector('input[name="phone"]') as HTMLInputElement
    
    if (phoneField) {
      fireEvent.change(phoneField, { target: { value: '123' } }) // Too short
      fireEvent.blur(phoneField)
      
      await waitFor(() => {
        expect(form).toHaveTextContent(/invalid phone|phone format/i)
      })
    }
  })

  it('should validate message minimum length', async () => {
    // Based on contract: message min length 10 characters
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    const messageField = getByLabelText(form!, /message/i) as HTMLTextAreaElement
    const submitButton = form?.querySelector('button[type="submit"]')
    
    const nameField = getByLabelText(form!, /name/i) as HTMLInputElement
    const emailField = getByLabelText(form!, /email/i) as HTMLInputElement
    
    fireEvent.change(nameField, { target: { value: 'John Doe' } })
    fireEvent.change(emailField, { target: { value: 'john@example.com' } })
    fireEvent.change(messageField, { target: { value: 'Hi' } }) // Too short
    
    fireEvent.click(submitButton!)
    
    await waitFor(() => {
      expect(form).toHaveTextContent(/message.*10 characters|message too short/i)
    })
  })

  it('should submit valid form successfully', async () => {
    // Based on acceptance criteria: successful submission experience
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    const submitButton = form?.querySelector('button[type="submit"]')
    
    // Fill in valid data
    const nameField = getByLabelText(form!, /name/i) as HTMLInputElement
    const emailField = getByLabelText(form!, /email/i) as HTMLInputElement
    const messageField = getByLabelText(form!, /message/i) as HTMLTextAreaElement
    
    fireEvent.change(nameField, { target: { value: 'Jane Doe' } })
    fireEvent.change(emailField, { target: { value: 'jane@example.com' } })
    fireEvent.change(messageField, { target: { value: 'I am interested in learning more about your beginner classes and schedule.' } })
    
    // Mock successful form submission
    const { submitContactForm } = await import('../../src/services/formService')
    vi.mocked(submitContactForm).mockResolvedValue({ success: true })
    
    fireEvent.click(submitButton!)
    
    await waitFor(() => {
      const successMessage = contactPageElement.querySelector('[data-testid="success-message"]')
      expect(successMessage).toBeInTheDocument()
      expect(successMessage).toHaveTextContent(/thank you|success|received/i)
    })
  })

  it('should display studio contact information', async () => {
    // Based on acceptance criteria: contact information easily accessible
    const contactInfo = contactPageElement.querySelector('[data-testid="studio-contact-info"]')
    expect(contactInfo).toBeInTheDocument()
    
    // Should show phone number (clickable)
    const phoneLink = contactInfo?.querySelector('a[href^="tel:"]')
    expect(phoneLink).toBeInTheDocument()
    
    // Should show email (clickable)
    const emailLink = contactInfo?.querySelector('a[href^="mailto:"]')
    expect(emailLink).toBeInTheDocument()
    
    // Should show address
    const address = contactInfo?.querySelector('[data-testid="studio-address"]')
    expect(address).toBeInTheDocument()
    expect(address).toHaveTextContent(/street|avenue|road|lane/i)
  })

  it('should include business hours', async () => {
    // Based on acceptance criteria: operating hours displayed
    const hoursSection = contactPageElement.querySelector('[data-testid="business-hours"]')
    expect(hoursSection).toBeInTheDocument()
    
    // Should list days of the week
    expect(hoursSection).toHaveTextContent(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i)
    
    // Should show time information
    expect(hoursSection).toHaveTextContent(/\d{1,2}:\d{2}|am|pm|closed/i)
  })

  it('should integrate with Google Maps or location service', async () => {
    // Enhanced UX: map integration
    const mapContainer = contactPageElement.querySelector('[data-testid="studio-map"]')
    const mapLink = contactPageElement.querySelector('a[href*="maps.google.com"], a[href*="goo.gl/maps"]')
    
    // Should have either embedded map or link to map
    expect(mapContainer || mapLink).toBeTruthy()
    
    if (mapContainer) {
      // Embedded map should have proper attributes
      expect(mapContainer).toHaveAttribute('src')
      expect(mapContainer.getAttribute('src')).toMatch(/maps|embed/i)
    }
    
    if (mapLink) {
      expect(mapLink).toHaveTextContent(/directions|map|location/i)
    }
  })

  it('should handle form submission errors gracefully', async () => {
    // Error handling requirement
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    const submitButton = form?.querySelector('button[type="submit"]')
    
    // Fill in valid data
    const nameField = getByLabelText(form!, /name/i) as HTMLInputElement
    const emailField = getByLabelText(form!, /email/i) as HTMLInputElement
    const messageField = getByLabelText(form!, /message/i) as HTMLTextAreaElement
    
    fireEvent.change(nameField, { target: { value: 'Jane Doe' } })
    fireEvent.change(emailField, { target: { value: 'jane@example.com' } })
    fireEvent.change(messageField, { target: { value: 'I am interested in learning more about your beginner classes.' } })
    
    // Mock failed form submission
    const { submitContactForm } = await import('../../src/services/formService')
    vi.mocked(submitContactForm).mockRejectedValue(new Error('Network error'))
    
    fireEvent.click(submitButton!)
    
    await waitFor(() => {
      const errorMessage = contactPageElement.querySelector('[data-testid="error-message"]')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/error|try again|problem/i)
    })
  })

  it('should show loading state during submission', async () => {
    // UX requirement: loading feedback
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement
    
    // Fill in valid data
    const nameField = getByLabelText(form!, /name/i) as HTMLInputElement
    const emailField = getByLabelText(form!, /email/i) as HTMLInputElement
    const messageField = getByLabelText(form!, /message/i) as HTMLTextAreaElement
    
    fireEvent.change(nameField, { target: { value: 'Jane Doe' } })
    fireEvent.change(emailField, { target: { value: 'jane@example.com' } })
    fireEvent.change(messageField, { target: { value: 'I am interested in learning more about your beginner classes.' } })
    
    // Mock slow form submission
    const { submitContactForm } = await import('../../src/services/formService')
    vi.mocked(submitContactForm).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
    )
    
    fireEvent.click(submitButton)
    
    // Should show loading state immediately
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent(/sending|loading|submitting/i)
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    }, { timeout: 2000 })
  })

  it('should have membership inquiry form option', async () => {
    // Based on contract: separate membership inquiry form
    const membershipForm = contactPageElement.querySelector('form[data-testid="membership-inquiry-form"]')
    const membershipTab = contactPageElement.querySelector('[data-testid="membership-inquiry-tab"]')
    
    if (membershipForm || membershipTab) {
      const form = membershipForm || (membershipTab ? 
        contactPageElement.querySelector('form[data-form-type="membership"]') : null)
      
      if (form) {
        // Should have membership-specific fields
        const membershipInterest = form.querySelector('input[name="membership_interest"], select[name="membership_interest"]')
        expect(membershipInterest).toBeInTheDocument()
        
        const experienceLevel = form.querySelector('select[name="experience_level"]')
        if (experienceLevel) {
          const options = experienceLevel.querySelectorAll('option')
          const optionValues = Array.from(options).map(opt => opt.getAttribute('value'))
          expect(optionValues).toContain('beginner')
          expect(optionValues).toContain('intermediate')
        }
      }
    }
  })

  it('should be mobile-friendly with touch-optimized inputs', async () => {
    // Mobile UX requirement
    const form = contactPageElement.querySelector('form[data-testid="contact-form"]')
    const inputs = form?.querySelectorAll('input, textarea, select')
    
    inputs?.forEach((input) => {
      // Inputs should have adequate touch target size
      const computedStyle = window.getComputedStyle(input)
      const height = parseFloat(computedStyle.height)
      expect(height).toBeGreaterThanOrEqual(44) // 44px minimum touch target
      
      // Mobile-specific input types
      if (input.getAttribute('name') === 'email') {
        expect(input).toHaveAttribute('type', 'email')
      }
      if (input.getAttribute('name') === 'phone') {
        expect(input).toHaveAttribute('type', 'tel')
      }
    })
  })
})