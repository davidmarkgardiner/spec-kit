import { describe, it, expect } from 'vitest'

// Contract test for instructors API - based on sanity-content-api.yaml
// This test MUST FAIL initially (TDD RED phase)
describe('Instructors API Contract', () => {
  const mockInstructor = {
    name: 'Sarah Johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'RYT-500, Senior Instructor',
    bio: 'Sarah has been practicing yoga for over 15 years and teaching for 8 years. She brings a gentle yet challenging approach to her classes, emphasizing breath awareness and mindful movement.',
    photo: {
      _type: 'image',
      asset: {
        _ref: 'image-abc123-1920x1080-jpg',
        _type: 'reference'
      }
    },
    certifications: ['RYT-500', 'Yin Yoga Certified', 'Meditation Teacher'],
    specialties: ['Vinyasa Flow', 'Restorative Yoga', 'Meditation'],
    experience: 8,
    email: 'sarah@serenityyoga.com',
    socialMedia: [
      {
        platform: 'instagram',
        url: 'https://instagram.com/sarahyoga'
      }
    ],
    isActive: true
  }

  it('should fetch active instructors with correct structure', async () => {
    // This will fail until we implement the instructor service
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    // Should return an array
    expect(Array.isArray(instructors)).toBe(true)
    expect(instructors.length).toBeGreaterThan(0)
    
    // Each instructor should have required fields per contract
    instructors.forEach((instructor: any) => {
      expect(instructor).toHaveProperty('name')
      expect(instructor).toHaveProperty('firstName')
      expect(instructor).toHaveProperty('lastName')
      expect(instructor).toHaveProperty('bio')
      expect(instructor).toHaveProperty('photo')
      expect(instructor).toHaveProperty('isActive')
      
      // Type validations
      expect(typeof instructor.name).toBe('string')
      expect(typeof instructor.firstName).toBe('string')
      expect(typeof instructor.lastName).toBe('string')
      expect(typeof instructor.bio).toBe('string')
      expect(typeof instructor.isActive).toBe('boolean')
    })
  })

  it('should validate bio minimum length', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    instructors.forEach((instructor: any) => {
      expect(instructor.bio.length).toBeGreaterThanOrEqual(100) // Per contract requirement
    })
  })

  it('should validate photo structure', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    instructors.forEach((instructor: any) => {
      expect(instructor.photo).toHaveProperty('_type')
      expect(instructor.photo).toHaveProperty('asset')
      expect(instructor.photo._type).toBe('image')
      
      expect(instructor.photo.asset).toHaveProperty('_ref')
      expect(instructor.photo.asset).toHaveProperty('_type')
      expect(instructor.photo.asset._type).toBe('reference')
      expect(typeof instructor.photo.asset._ref).toBe('string')
    })
  })

  it('should validate experience when provided', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    instructors.forEach((instructor: any) => {
      if (instructor.experience !== null && instructor.experience !== undefined) {
        expect(typeof instructor.experience).toBe('number')
        expect(instructor.experience).toBeGreaterThanOrEqual(0)
      }
    })
  })

  it('should validate certifications array when provided', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    instructors.forEach((instructor: any) => {
      if (instructor.certifications) {
        expect(Array.isArray(instructor.certifications)).toBe(true)
        instructor.certifications.forEach((cert: any) => {
          expect(typeof cert).toBe('string')
          expect(cert.length).toBeGreaterThan(0)
        })
      }
    })
  })

  it('should validate specialties array when provided', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    instructors.forEach((instructor: any) => {
      if (instructor.specialties) {
        expect(Array.isArray(instructor.specialties)).toBe(true)
        expect(instructor.specialties.length).toBeGreaterThan(0) // At least one specialty required
        instructor.specialties.forEach((specialty: any) => {
          expect(typeof specialty).toBe('string')
          expect(specialty.length).toBeGreaterThan(0)
        })
      }
    })
  })

  it('should validate email format when provided', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    instructors.forEach((instructor: any) => {
      if (instructor.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(emailRegex.test(instructor.email)).toBe(true)
      }
    })
  })

  it('should validate social media links when provided', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    const validPlatforms = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok']
    
    instructors.forEach((instructor: any) => {
      if (instructor.socialMedia) {
        expect(Array.isArray(instructor.socialMedia)).toBe(true)
        instructor.socialMedia.forEach((social: any) => {
          expect(social).toHaveProperty('platform')
          expect(social).toHaveProperty('url')
          expect(validPlatforms).toContain(social.platform)
          expect(social.url).toMatch(/^https?:\/\//)
        })
      }
    })
  })

  it('should filter only active instructors', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    // All returned instructors should be active
    instructors.forEach((instructor: any) => {
      expect(instructor.isActive).toBe(true)
    })
  })

  it('should validate name consistency', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    instructors.forEach((instructor: any) => {
      // Full name should include first and last name
      expect(instructor.name).toContain(instructor.firstName)
      expect(instructor.name).toContain(instructor.lastName)
      
      // Names should not be empty
      expect(instructor.firstName.length).toBeGreaterThan(0)
      expect(instructor.lastName.length).toBeGreaterThan(0)
    })
  })

  it('should validate optional title format', async () => {
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    
    instructors.forEach((instructor: any) => {
      if (instructor.title) {
        expect(typeof instructor.title).toBe('string')
        expect(instructor.title.length).toBeGreaterThan(0)
      }
    })
  })
})