import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Component test for StudioInfo display component
// This test MUST FAIL initially (TDD RED phase)
describe('StudioInfo Component', () => {
  const mockStudioData = {
    name: 'Serenity Yoga Studio',
    tagline: 'Find your inner peace',
    description: 'A welcoming community yoga studio offering classes for all levels in a peaceful, mindful environment.',
    address: {
      street: '123 Peaceful Lane',
      city: 'Mindful City',
      state: 'CA',
      zipCode: '90210'
    },
    phone: '(555) 123-4567',
    email: 'hello@serenityyoga.com',
    website: 'https://serenityyoga.com',
    socialMedia: [
      {
        platform: 'instagram',
        url: 'https://instagram.com/serenityyoga'
      },
      {
        platform: 'facebook',
        url: 'https://facebook.com/serenityyoga'
      }
    ],
    hours: [
      {
        day: 'monday',
        openTime: '06:00',
        closeTime: '21:00',
        isClosed: false
      },
      {
        day: 'tuesday',
        openTime: '06:00',
        closeTime: '21:00',
        isClosed: false
      },
      {
        day: 'sunday',
        openTime: null,
        closeTime: null,
        isClosed: true
      }
    ]
  }

  let StudioInfoComponent: any

  beforeEach(async () => {
    // This will fail until we implement the StudioInfo component
    const { default: StudioInfo } = await import('../../src/components/StudioInfo.astro')
    StudioInfoComponent = StudioInfo
  })

  it('should render studio name prominently', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const studioName = container.getByTestId('studio-name')
    expect(studioName).toBeInTheDocument()
    expect(studioName).toHaveTextContent('Serenity Yoga Studio')
    
    // Should be rendered as a heading for semantic structure
    expect(studioName.tagName).toMatch(/^H[1-6]$/)
  })

  it('should display tagline when provided', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const tagline = container.getByTestId('studio-tagline')
    expect(tagline).toBeInTheDocument()
    expect(tagline).toHaveTextContent('Find your inner peace')
  })

  it('should handle missing tagline gracefully', () => {
    const dataWithoutTagline = { ...mockStudioData, tagline: undefined }
    const container = render(StudioInfoComponent, { props: { studioData: dataWithoutTagline } })
    
    const tagline = container.queryByTestId('studio-tagline')
    expect(tagline).not.toBeInTheDocument()
  })

  it('should display full studio description', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const description = container.getByTestId('studio-description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveTextContent(mockStudioData.description)
  })

  it('should render complete address with proper structure', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const address = container.getByTestId('studio-address')
    expect(address).toBeInTheDocument()
    
    // Should contain all address components
    expect(address).toHaveTextContent('123 Peaceful Lane')
    expect(address).toHaveTextContent('Mindful City')
    expect(address).toHaveTextContent('CA')
    expect(address).toHaveTextContent('90210')
    
    // Should have proper semantic structure (address element)
    expect(address.tagName).toBe('ADDRESS')
  })

  it('should render phone number as clickable link', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const phoneLink = container.getByTestId('studio-phone')
    expect(phoneLink).toBeInTheDocument()
    expect(phoneLink.tagName).toBe('A')
    expect(phoneLink).toHaveAttribute('href', 'tel:+15551234567')
    expect(phoneLink).toHaveTextContent('(555) 123-4567')
  })

  it('should render email as clickable mailto link', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const emailLink = container.getByTestId('studio-email')
    expect(emailLink).toBeInTheDocument()
    expect(emailLink.tagName).toBe('A')
    expect(emailLink).toHaveAttribute('href', 'mailto:hello@serenityyoga.com')
    expect(emailLink).toHaveTextContent('hello@serenityyoga.com')
  })

  it('should display business hours with proper formatting', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const hours = container.getByTestId('business-hours')
    expect(hours).toBeInTheDocument()
    
    // Should show operating days
    expect(hours).toHaveTextContent(/monday/i)
    expect(hours).toHaveTextContent(/tuesday/i)
    
    // Should show formatted times
    expect(hours).toHaveTextContent(/6:00 AM/i)
    expect(hours).toHaveTextContent(/9:00 PM/i)
    
    // Should show closed days
    expect(hours).toHaveTextContent(/sunday.*closed/i)
  })

  it('should handle 24-hour to 12-hour time conversion', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const hours = container.getByTestId('business-hours')
    
    // 06:00 should display as 6:00 AM
    expect(hours).toHaveTextContent(/6:00 AM/i)
    // 21:00 should display as 9:00 PM
    expect(hours).toHaveTextContent(/9:00 PM/i)
  })

  it('should render social media links when provided', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const socialLinks = container.getAllByTestId(/social-link/)
    expect(socialLinks).toHaveLength(2)
    
    const instagramLink = container.getByTestId('social-link-instagram')
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/serenityyoga')
    expect(instagramLink).toHaveAttribute('target', '_blank')
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')
    
    const facebookLink = container.getByTestId('social-link-facebook')
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/serenityyoga')
  })

  it('should handle missing social media gracefully', () => {
    const dataWithoutSocial = { ...mockStudioData, socialMedia: [] }
    const container = render(StudioInfoComponent, { props: { studioData: dataWithoutSocial } })
    
    const socialSection = container.queryByTestId('social-media-section')
    expect(socialSection).not.toBeInTheDocument()
  })

  it('should display website link when provided', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const websiteLink = container.getByTestId('studio-website')
    expect(websiteLink).toBeInTheDocument()
    expect(websiteLink).toHaveAttribute('href', 'https://serenityyoga.com')
    expect(websiteLink).toHaveAttribute('target', '_blank')
    expect(websiteLink).toHaveTextContent(/visit our website|serenityyoga.com/i)
  })

  it('should have proper accessibility attributes', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    // Phone link should have aria-label
    const phoneLink = container.getByTestId('studio-phone')
    expect(phoneLink).toHaveAttribute('aria-label', expect.stringMatching(/call|phone/i))
    
    // Email link should have aria-label
    const emailLink = container.getByTestId('studio-email')
    expect(emailLink).toHaveAttribute('aria-label', expect.stringMatching(/email|contact/i))
    
    // Social links should have descriptive aria-labels
    const socialLinks = container.getAllByTestId(/social-link/)
    socialLinks.forEach((link) => {
      expect(link).toHaveAttribute('aria-label')
      const ariaLabel = link.getAttribute('aria-label')
      expect(ariaLabel).toMatch(/instagram|facebook|twitter|youtube/i)
    })
  })

  it('should be responsive with mobile-friendly layout', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const component = container.getByTestId('studio-info')
    expect(component).toHaveClass(/responsive|mobile|grid|flex/)
    
    // Contact links should have adequate touch targets
    const phoneLink = container.getByTestId('studio-phone')
    const computedStyle = window.getComputedStyle(phoneLink)
    const minHeight = parseFloat(computedStyle.minHeight)
    expect(minHeight).toBeGreaterThanOrEqual(44) // 44px minimum touch target
  })

  it('should handle incomplete address data', () => {
    const dataWithIncompleteAddress = {
      ...mockStudioData,
      address: {
        street: '123 Peaceful Lane',
        city: 'Mindful City',
        state: '', // Missing state
        zipCode: '90210'
      }
    }
    
    const container = render(StudioInfoComponent, { props: { studioData: dataWithIncompleteAddress } })
    
    const address = container.getByTestId('studio-address')
    expect(address).toBeInTheDocument()
    expect(address).toHaveTextContent('123 Peaceful Lane')
    expect(address).toHaveTextContent('Mindful City')
    expect(address).toHaveTextContent('90210')
    // Should handle missing state gracefully without extra commas or spaces
  })

  it('should format business hours consistently', () => {
    const container = render(StudioInfoComponent, { props: { studioData: mockStudioData } })
    
    const hours = container.getByTestId('business-hours')
    
    // Each day should be in a consistent format
    const dayElements = hours.querySelectorAll('[data-testid^="hours-"]')
    dayElements.forEach((dayElement) => {
      const dayText = dayElement.textContent
      
      if (dayText?.includes('closed')) {
        expect(dayText).toMatch(/\w+day.*closed/i)
      } else {
        // Should follow format: "Monday: 6:00 AM - 9:00 PM"
        expect(dayText).toMatch(/\w+day.*\d{1,2}:\d{2}\s*(AM|PM)/i)
      }
    })
  })

  it('should validate prop types and required fields', () => {
    // Test with minimal required data
    const minimalData = {
      name: 'Test Studio',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      phone: '(555) 123-4567',
      email: 'test@example.com',
      hours: []
    }
    
    expect(() => {
      render(StudioInfoComponent, { props: { studioData: minimalData } })
    }).not.toThrow()
    
    // Test with missing required fields should handle gracefully
    const incompleteData = {
      name: 'Test Studio'
      // Missing address, phone, email, hours
    }
    
    expect(() => {
      render(StudioInfoComponent, { props: { studioData: incompleteData } })
    }).not.toThrow()
  })

  it('should support custom CSS classes and styling props', () => {
    const container = render(StudioInfoComponent, { 
      props: { 
        studioData: mockStudioData, 
        className: 'custom-studio-info',
        variant: 'compact' 
      } 
    })
    
    const component = container.getByTestId('studio-info')
    expect(component).toHaveClass('custom-studio-info')
    expect(component).toHaveClass('compact')
  })
})