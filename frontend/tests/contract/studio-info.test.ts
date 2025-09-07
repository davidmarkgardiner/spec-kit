import { describe, it, expect } from 'vitest'

// Contract test for studio info API - based on sanity-content-api.yaml
// This test MUST FAIL initially (TDD RED phase)
describe('Studio Info API Contract', () => {
  const mockStudioInfoResponse = {
    name: 'Serenity Yoga Studio',
    tagline: 'Find your inner peace',
    description: 'A welcoming community yoga studio offering classes for all levels',
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
        day: 'sunday',
        openTime: null,
        closeTime: null,
        isClosed: true
      }
    ]
  }

  it('should fetch studio information with correct structure', async () => {
    // This will fail until we implement the studio service
    const { getStudioInfo } = await import('../../src/services/studioService')
    
    const studioInfo = await getStudioInfo()
    
    // Required fields per contract
    expect(studioInfo).toHaveProperty('name')
    expect(studioInfo).toHaveProperty('address')
    expect(studioInfo).toHaveProperty('phone')
    expect(studioInfo).toHaveProperty('email')
    expect(studioInfo).toHaveProperty('hours')
    
    // Type validations
    expect(typeof studioInfo.name).toBe('string')
    expect(typeof studioInfo.phone).toBe('string')
    expect(typeof studioInfo.email).toBe('string')
    expect(Array.isArray(studioInfo.hours)).toBe(true)
    
    // Address structure
    expect(studioInfo.address).toHaveProperty('street')
    expect(studioInfo.address).toHaveProperty('city')
    expect(studioInfo.address).toHaveProperty('state')
    expect(studioInfo.address).toHaveProperty('zipCode')
  })

  it('should validate phone number format', async () => {
    const { getStudioInfo } = await import('../../src/services/studioService')
    
    const studioInfo = await getStudioInfo()
    
    // Phone validation per contract regex
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    const cleanPhone = studioInfo.phone.replace(/[\s\(\)\-]/g, '')
    expect(phoneRegex.test(cleanPhone)).toBe(true)
  })

  it('should validate email format', async () => {
    const { getStudioInfo } = await import('../../src/services/studioService')
    
    const studioInfo = await getStudioInfo()
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test(studioInfo.email)).toBe(true)
  })

  it('should validate business hours structure', async () => {
    const { getStudioInfo } = await import('../../src/services/studioService')
    
    const studioInfo = await getStudioInfo()
    
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    studioInfo.hours.forEach((hour: any) => {
      expect(hour).toHaveProperty('day')
      expect(hour).toHaveProperty('isClosed')
      expect(validDays).toContain(hour.day)
      expect(typeof hour.isClosed).toBe('boolean')
      
      if (!hour.isClosed) {
        expect(hour).toHaveProperty('openTime')
        expect(hour).toHaveProperty('closeTime')
        
        // Time format validation (HH:mm)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (hour.openTime) expect(timeRegex.test(hour.openTime)).toBe(true)
        if (hour.closeTime) expect(timeRegex.test(hour.closeTime)).toBe(true)
      }
    })
  })

  it('should validate social media links structure', async () => {
    const { getStudioInfo } = await import('../../src/services/studioService')
    
    const studioInfo = await getStudioInfo()
    
    if (studioInfo.socialMedia) {
      const validPlatforms = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok']
      
      studioInfo.socialMedia.forEach((social: any) => {
        expect(social).toHaveProperty('platform')
        expect(social).toHaveProperty('url')
        expect(validPlatforms).toContain(social.platform)
        expect(social.url).toMatch(/^https?:\/\//)
      })
    }
  })

  it('should validate zipCode format', async () => {
    const { getStudioInfo } = await import('../../src/services/studioService')
    
    const studioInfo = await getStudioInfo()
    
    // US zipcode format per contract
    const zipRegex = /^\d{5}(-\d{4})?$/
    expect(zipRegex.test(studioInfo.address.zipCode)).toBe(true)
  })
})