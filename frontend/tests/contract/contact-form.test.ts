import { describe, it, expect } from 'vitest'

// Contract test for contact form submission - based on contact-form-api.yaml
// This test MUST FAIL initially (TDD RED phase)
describe('Contact Form API Contract', () => {
  const mockContactFormData = {
    'form-name': 'contact',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 123-4567',
    subject: 'Class schedule inquiry',
    message: "I'm interested in learning more about your beginner classes.",
    preferred_contact: 'email',
    best_time: 'Weekday mornings',
    how_heard: 'google'
  }

  const mockMembershipInquiryData = {
    'form-name': 'membership-inquiry',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 987-6543',
    membership_interest: ['monthly', 'class-packages'],
    experience_level: 'beginner',
    class_preferences: ['morning', 'weekend'],
    yoga_styles: ['vinyasa', 'yin'],
    goals: 'Improve flexibility and reduce stress',
    injuries_limitations: 'Lower back sensitivity',
    preferred_contact: 'email',
    ready_to_start: 'this_week',
    questions: 'Do you offer trial classes?'
  }

  it('should submit contact form with required fields', async () => {
    // This will fail until we implement the form service
    const { submitContactForm } = await import('../../src/services/formService')
    
    const result = await submitContactForm({
      'form-name': 'contact',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      message: "I'm interested in learning more about your beginner classes."
    })
    
    // Should return success response
    expect(result).toHaveProperty('success')
    expect(result.success).toBe(true)
  })

  it('should validate required contact form fields', async () => {
    const { validateContactFormData } = await import('../../src/services/formService')
    
    // Missing required fields should fail validation
    const invalidData = {
      'form-name': 'contact',
      name: 'Jane Doe'
      // Missing email and message
    }
    
    const validation = validateContactFormData(invalidData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('email is required')
    expect(validation.errors).toContain('message is required')
  })

  it('should validate email format', async () => {
    const { validateContactFormData } = await import('../../src/services/formService')
    
    const invalidEmailData = {
      'form-name': 'contact',
      name: 'Jane Doe',
      email: 'invalid-email',
      message: 'Test message'
    }
    
    const validation = validateContactFormData(invalidEmailData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('invalid email format')
  })

  it('should validate phone number format when provided', async () => {
    const { validateContactFormData } = await import('../../src/services/formService')
    
    const invalidPhoneData = {
      'form-name': 'contact',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '123', // Too short
      message: 'Test message'
    }
    
    const validation = validateContactFormData(invalidPhoneData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('invalid phone format')
  })

  it('should validate name format and length', async () => {
    const { validateContactFormData } = await import('../../src/services/formService')
    
    const invalidNameData = {
      'form-name': 'contact',
      name: 'J', // Too short
      email: 'jane@example.com',
      message: 'Test message'
    }
    
    const validation = validateContactFormData(invalidNameData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('name must be at least 2 characters')
  })

  it('should validate message length', async () => {
    const { validateContactFormData } = await import('../../src/services/formService')
    
    const shortMessageData = {
      'form-name': 'contact',
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hi' // Too short
    }
    
    const validation = validateContactFormData(shortMessageData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('message must be at least 10 characters')
  })

  it('should validate preferred_contact enum values', async () => {
    const { validateContactFormData } = await import('../../src/services/formService')
    
    const invalidPreferredContactData = {
      'form-name': 'contact',
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Test message',
      preferred_contact: 'invalid' // Invalid enum value
    }
    
    const validation = validateContactFormData(invalidPreferredContactData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('preferred_contact must be one of: email, phone, either')
  })

  it('should validate how_heard enum values', async () => {
    const { validateContactFormData } = await import('../../src/services/formService')
    
    const invalidHowHeardData = {
      'form-name': 'contact',
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Test message',
      how_heard: 'invalid' // Invalid enum value
    }
    
    const validation = validateContactFormData(invalidHowHeardData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('how_heard must be one of: google, social_media, friend, drive_by, other')
  })

  it('should submit membership inquiry with required fields', async () => {
    const { submitMembershipInquiry } = await import('../../src/services/formService')
    
    const result = await submitMembershipInquiry({
      'form-name': 'membership-inquiry',
      name: 'John Smith',
      email: 'john.smith@example.com',
      membership_interest: ['monthly']
    })
    
    expect(result).toHaveProperty('success')
    expect(result.success).toBe(true)
  })

  it('should validate membership inquiry required fields', async () => {
    const { validateMembershipInquiryData } = await import('../../src/services/formService')
    
    const invalidData = {
      'form-name': 'membership-inquiry',
      name: 'John Smith'
      // Missing email and membership_interest
    }
    
    const validation = validateMembershipInquiryData(invalidData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('email is required')
    expect(validation.errors).toContain('membership_interest is required')
  })

  it('should validate membership_interest array', async () => {
    const { validateMembershipInquiryData } = await import('../../src/services/formService')
    
    const invalidMembershipData = {
      'form-name': 'membership-inquiry',
      name: 'John Smith',
      email: 'john@example.com',
      membership_interest: [] // Empty array
    }
    
    const validation = validateMembershipInquiryData(invalidMembershipData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('at least one membership interest is required')
  })

  it('should validate membership_interest enum values', async () => {
    const { validateMembershipInquiryData } = await import('../../src/services/formService')
    
    const invalidMembershipData = {
      'form-name': 'membership-inquiry',
      name: 'John Smith',
      email: 'john@example.com',
      membership_interest: ['invalid-type']
    }
    
    const validation = validateMembershipInquiryData(invalidMembershipData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('membership_interest must contain valid options: drop-in, monthly, annual, class-packages')
  })

  it('should validate experience_level enum when provided', async () => {
    const { validateMembershipInquiryData } = await import('../../src/services/formService')
    
    const invalidExperienceData = {
      'form-name': 'membership-inquiry',
      name: 'John Smith',
      email: 'john@example.com',
      membership_interest: ['monthly'],
      experience_level: 'invalid'
    }
    
    const validation = validateMembershipInquiryData(invalidExperienceData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('experience_level must be one of: beginner, intermediate, advanced, mixed')
  })

  it('should validate class_preferences enum values when provided', async () => {
    const { validateMembershipInquiryData } = await import('../../src/services/formService')
    
    const invalidPreferencesData = {
      'form-name': 'membership-inquiry',
      name: 'John Smith',
      email: 'john@example.com',
      membership_interest: ['monthly'],
      class_preferences: ['invalid-time']
    }
    
    const validation = validateMembershipInquiryData(invalidPreferencesData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('class_preferences must contain valid options: morning, afternoon, evening, weekend')
  })

  it('should validate string field lengths', async () => {
    const { validateMembershipInquiryData } = await import('../../src/services/formService')
    
    const longStringData = {
      'form-name': 'membership-inquiry',
      name: 'John Smith',
      email: 'john@example.com',
      membership_interest: ['monthly'],
      goals: 'x'.repeat(501) // Over 500 character limit
    }
    
    const validation = validateMembershipInquiryData(longStringData)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('goals must be 500 characters or less')
  })
})