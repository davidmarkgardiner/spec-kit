import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Component test for ContactForm component
// This test MUST FAIL initially (TDD RED phase)
describe('ContactForm Component', () => {
  let ContactFormComponent: any

  beforeEach(async () => {
    // This will fail until we implement the ContactForm component
    const { default: ContactForm } = await import('../../src/components/ContactForm.astro')
    ContactFormComponent = ContactForm
  })

  it('should render form with all required fields', () => {
    const container = render(ContactFormComponent)
    
    const form = container.getByTestId('contact-form')
    expect(form).toBeInTheDocument()
    expect(form.tagName).toBe('FORM')
    
    // Required fields per contract
    const nameField = container.getByLabelText(/name/i)
    const emailField = container.getByLabelText(/email/i)
    const messageField = container.getByLabelText(/message/i)
    
    expect(nameField).toBeInTheDocument()
    expect(emailField).toBeInTheDocument()
    expect(messageField).toBeInTheDocument()
    
    // Fields should be marked as required
    expect(nameField).toHaveAttribute('required')
    expect(emailField).toHaveAttribute('required')
    expect(messageField).toHaveAttribute('required')
  })

  it('should have proper input types and attributes', () => {
    const container = render(ContactFormComponent)
    
    const nameField = container.getByLabelText(/name/i)
    const emailField = container.getByLabelText(/email/i)
    const messageField = container.getByLabelText(/message/i)
    
    // Name should be text input
    expect(nameField).toHaveAttribute('type', 'text')
    expect(nameField).toHaveAttribute('name', 'name')
    
    // Email should be email input for mobile optimization
    expect(emailField).toHaveAttribute('type', 'email')
    expect(emailField).toHaveAttribute('name', 'email')
    
    // Message should be textarea
    expect(messageField.tagName).toBe('TEXTAREA')
    expect(messageField).toHaveAttribute('name', 'message')
  })

  it('should include optional fields with proper setup', () => {
    const container = render(ContactFormComponent, { props: { showOptionalFields: true } })
    
    const phoneField = container.queryByLabelText(/phone/i)
    const subjectField = container.queryByLabelText(/subject/i)
    const preferredContactField = container.queryByLabelText(/preferred.*contact/i)
    
    if (phoneField) {
      expect(phoneField).toHaveAttribute('type', 'tel')
      expect(phoneField).not.toHaveAttribute('required')
    }
    
    if (subjectField) {
      expect(subjectField).toHaveAttribute('type', 'text')
      expect(subjectField).not.toHaveAttribute('required')
    }
    
    if (preferredContactField) {
      expect(preferredContactField.tagName).toBe('SELECT')
      
      // Should have enum options per contract
      const options = preferredContactField.querySelectorAll('option')
      const optionValues = Array.from(options).map(opt => opt.getAttribute('value'))
      expect(optionValues).toContain('email')
      expect(optionValues).toContain('phone')
      expect(optionValues).toContain('either')
    }
  })

  it('should have hidden form-name field for Netlify', () => {
    const container = render(ContactFormComponent)
    
    const formNameField = container.getByRole('form').querySelector('input[name="form-name"]')
    expect(formNameField).toBeInTheDocument()
    expect(formNameField).toHaveAttribute('type', 'hidden')
    expect(formNameField).toHaveAttribute('value', 'contact')
  })

  it('should validate required fields on submit', async () => {
    const container = render(ContactFormComponent)
    
    const submitButton = container.getByRole('button', { name: /send|submit/i })
    
    // Try to submit empty form
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      const nameError = container.queryByTestId('name-error')
      const emailError = container.queryByTestId('email-error')
      const messageError = container.queryByTestId('message-error')
      
      expect(nameError || container.getByText(/name.*required/i)).toBeInTheDocument()
      expect(emailError || container.getByText(/email.*required/i)).toBeInTheDocument()
      expect(messageError || container.getByText(/message.*required/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    const container = render(ContactFormComponent)
    
    const nameField = container.getByLabelText(/name/i)
    const emailField = container.getByLabelText(/email/i)
    const messageField = container.getByLabelText(/message/i)
    
    // Fill with invalid email
    fireEvent.change(nameField, { target: { value: 'John Doe' } })
    fireEvent.change(emailField, { target: { value: 'invalid-email' } })
    fireEvent.change(messageField, { target: { value: 'This is a test message that is long enough.' } })
    
    fireEvent.blur(emailField)
    
    await waitFor(() => {
      const emailError = container.getByText(/invalid email|email format/i)
      expect(emailError).toBeInTheDocument()
    })
  })

  it('should validate name format and length', async () => {
    const container = render(ContactFormComponent)
    
    const nameField = container.getByLabelText(/name/i)
    
    // Test too short name
    fireEvent.change(nameField, { target: { value: 'J' } })
    fireEvent.blur(nameField)
    
    await waitFor(() => {
      const nameError = container.getByText(/name.*2 characters|name too short/i)
      expect(nameError).toBeInTheDocument()
    })
    
    // Test invalid characters
    fireEvent.change(nameField, { target: { value: 'John123' } })
    fireEvent.blur(nameField)
    
    await waitFor(() => {
      const nameError = container.getByText(/invalid.*name|letters only/i)
      expect(nameError).toBeInTheDocument()
    })
  })

  it('should validate message minimum length', async () => {
    const container = render(ContactFormComponent)
    
    const messageField = container.getByLabelText(/message/i)
    
    fireEvent.change(messageField, { target: { value: 'Hi' } }) // Too short
    fireEvent.blur(messageField)
    
    await waitFor(() => {
      const messageError = container.getByText(/message.*10 characters|message too short/i)
      expect(messageError).toBeInTheDocument()
    })
  })

  it('should validate phone number when provided', async () => {
    const container = render(ContactFormComponent, { props: { showOptionalFields: true } })
    
    const phoneField = container.queryByLabelText(/phone/i)
    
    if (phoneField) {
      fireEvent.change(phoneField, { target: { value: '123' } }) // Too short
      fireEvent.blur(phoneField)
      
      await waitFor(() => {
        const phoneError = container.getByText(/invalid phone|phone format/i)
        expect(phoneError).toBeInTheDocument()
      })
    }
  })

  it('should handle successful form submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true })
    const container = render(ContactFormComponent, { props: { onSubmit } })
    
    const nameField = container.getByLabelText(/name/i)
    const emailField = container.getByLabelText(/email/i)
    const messageField = container.getByLabelText(/message/i)
    const submitButton = container.getByRole('button', { name: /send|submit/i })
    
    // Fill valid data
    fireEvent.change(nameField, { target: { value: 'Jane Doe' } })
    fireEvent.change(emailField, { target: { value: 'jane@example.com' } })
    fireEvent.change(messageField, { target: { value: 'I am interested in learning more about your beginner classes.' } })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        'form-name': 'contact',
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'I am interested in learning more about your beginner classes.'
      })
    })
    
    // Should show success message
    await waitFor(() => {
      const successMessage = container.getByTestId('success-message')
      expect(successMessage).toBeInTheDocument()
      expect(successMessage).toHaveTextContent(/thank you|success|received/i)
    })
  })

  it('should show loading state during submission', async () => {
    const onSubmit = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
    )
    
    const container = render(ContactFormComponent, { props: { onSubmit } })
    
    const nameField = container.getByLabelText(/name/i)
    const emailField = container.getByLabelText(/email/i)
    const messageField = container.getByLabelText(/message/i)
    const submitButton = container.getByRole('button', { name: /send|submit/i })
    
    // Fill valid data
    fireEvent.change(nameField, { target: { value: 'Jane Doe' } })
    fireEvent.change(emailField, { target: { value: 'jane@example.com' } })
    fireEvent.change(messageField, { target: { value: 'I am interested in learning more about your classes.' } })
    
    fireEvent.click(submitButton)
    
    // Should immediately show loading state
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent(/sending|loading|submitting/i)
    
    // Form fields should be disabled during submission
    expect(nameField).toBeDisabled()
    expect(emailField).toBeDisabled()
    expect(messageField).toBeDisabled()
  })

  it('should handle form submission errors', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    
    const container = render(ContactFormComponent, { props: { onSubmit } })
    
    const nameField = container.getByLabelText(/name/i)
    const emailField = container.getByLabelText(/email/i)
    const messageField = container.getByLabelText(/message/i)
    const submitButton = container.getByRole('button', { name: /send|submit/i })
    
    // Fill valid data
    fireEvent.change(nameField, { target: { value: 'Jane Doe' } })
    fireEvent.change(emailField, { target: { value: 'jane@example.com' } })
    fireEvent.change(messageField, { target: { value: 'I am interested in learning more about your classes.' } })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      const errorMessage = container.getByTestId('error-message')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/error|try again|problem/i)
    })
    
    // Form should be re-enabled after error
    expect(submitButton).not.toBeDisabled()
    expect(nameField).not.toBeDisabled()
  })

  it('should reset form after successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true })
    const container = render(ContactFormComponent, { props: { onSubmit, resetOnSuccess: true } })
    
    const nameField = container.getByLabelText(/name/i) as HTMLInputElement
    const emailField = container.getByLabelText(/email/i) as HTMLInputElement
    const messageField = container.getByLabelText(/message/i) as HTMLTextAreaElement
    const submitButton = container.getByRole('button', { name: /send|submit/i })
    
    // Fill and submit form
    fireEvent.change(nameField, { target: { value: 'Jane Doe' } })
    fireEvent.change(emailField, { target: { value: 'jane@example.com' } })
    fireEvent.change(messageField, { target: { value: 'Test message for yoga class inquiry.' } })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(nameField.value).toBe('')
      expect(emailField.value).toBe('')
      expect(messageField.value).toBe('')
    })
  })

  it('should be accessible with proper labels and ARIA', () => {
    const container = render(ContactFormComponent)
    
    const form = container.getByTestId('contact-form')
    expect(form).toHaveAttribute('role', 'form')
    
    // All form fields should have associated labels
    const nameField = container.getByLabelText(/name/i)
    const emailField = container.getByLabelText(/email/i)
    const messageField = container.getByLabelText(/message/i)
    
    expect(nameField).toHaveAttribute('id')
    expect(emailField).toHaveAttribute('id')
    expect(messageField).toHaveAttribute('id')
    
    // Submit button should have proper attributes
    const submitButton = container.getByRole('button', { name: /send|submit/i })
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should have proper form validation attributes', () => {
    const container = render(ContactFormComponent)
    
    const nameField = container.getByLabelText(/name/i)
    const emailField = container.getByLabelText(/email/i)
    const messageField = container.getByLabelText(/message/i)
    
    // Should have validation attributes
    expect(nameField).toHaveAttribute('minlength', '2')
    expect(nameField).toHaveAttribute('maxlength', '100')
    expect(nameField).toHaveAttribute('pattern', expect.stringMatching(/\^.*\$/)) // Regex pattern
    
    expect(emailField).toHaveAttribute('maxlength', '254')
    
    expect(messageField).toHaveAttribute('minlength', '10')
    expect(messageField).toHaveAttribute('maxlength', '2000')
  })

  it('should be mobile-friendly with proper touch targets', () => {
    const container = render(ContactFormComponent)
    
    const inputs = container.getByRole('form').querySelectorAll('input, textarea, button')
    
    inputs.forEach((input) => {
      const computedStyle = window.getComputedStyle(input)
      const minHeight = parseFloat(computedStyle.minHeight)
      expect(minHeight).toBeGreaterThanOrEqual(44) // 44px minimum touch target
    })
    
    // Form should be responsive
    const form = container.getByTestId('contact-form')
    expect(form).toHaveClass(/responsive|mobile/)
  })

  it('should support different form variants', () => {
    const compactContainer = render(ContactFormComponent, { props: { variant: 'compact' } })
    const compactForm = compactContainer.getByTestId('contact-form')
    expect(compactForm).toHaveClass('compact')
    
    const inlineContainer = render(ContactFormComponent, { props: { variant: 'inline' } })
    const inlineForm = inlineContainer.getByTestId('contact-form')
    expect(inlineForm).toHaveClass('inline')
  })

  it('should handle membership inquiry form type', () => {
    const container = render(ContactFormComponent, { props: { formType: 'membership-inquiry' } })
    
    const formNameField = container.getByRole('form').querySelector('input[name="form-name"]')
    expect(formNameField).toHaveAttribute('value', 'membership-inquiry')
    
    // Should show membership-specific fields
    const membershipInterest = container.queryByLabelText(/membership.*interest/i)
    const experienceLevel = container.queryByLabelText(/experience.*level/i)
    
    if (membershipInterest) {
      expect(membershipInterest).toBeInTheDocument()
    }
  })

  it('should have proper field placeholders', () => {
    const container = render(ContactFormComponent)
    
    const nameField = container.getByLabelText(/name/i)
    const emailField = container.getByLabelText(/email/i)
    const messageField = container.getByLabelText(/message/i)
    
    expect(nameField).toHaveAttribute('placeholder')
    expect(emailField).toHaveAttribute('placeholder')
    expect(messageField).toHaveAttribute('placeholder')
    
    // Placeholders should be helpful but not replace labels
    expect(nameField.getAttribute('placeholder')).toMatch(/first.*last|full name/i)
    expect(emailField.getAttribute('placeholder')).toMatch(/example.*com|email address/i)
    expect(messageField.getAttribute('placeholder')).toMatch(/tell us|message|inquiry/i)
  })

  it('should support custom CSS classes and theming', () => {
    const container = render(ContactFormComponent, { 
      props: { 
        className: 'custom-contact-form',
        theme: 'dark'
      } 
    })
    
    const form = container.getByTestId('contact-form')
    expect(form).toHaveClass('custom-contact-form')
    expect(form).toHaveClass('dark')
  })
})