import { describe, it, expect } from 'vitest'

// Contract test for photos API - based on sanity-content-api.yaml
// This test MUST FAIL initially (TDD RED phase)
describe('Photos API Contract', () => {
  const mockPhoto = {
    title: 'Main yoga studio space',
    image: {
      _type: 'image',
      asset: {
        _ref: 'image-abc123-1920x1080-jpg',
        _type: 'reference'
      },
      hotspot: {
        x: 0.5,
        y: 0.4
      },
      crop: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      }
    },
    altText: 'Bright, spacious yoga studio with natural lighting and bamboo floors',
    category: 'studio-space',
    featured: false,
    sortOrder: 1,
    photographer: 'Jane Smith Photography',
    dateTaken: '2024-03-15'
  }

  it('should fetch photos with correct structure', async () => {
    // This will fail until we implement the photo service
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    // Should return an array
    expect(Array.isArray(photos)).toBe(true)
    expect(photos.length).toBeGreaterThan(0)
    
    // Each photo should have required fields per contract
    photos.forEach((photo: any) => {
      expect(photo).toHaveProperty('title')
      expect(photo).toHaveProperty('image')
      expect(photo).toHaveProperty('altText')
      expect(photo).toHaveProperty('category')
      
      // Type validations
      expect(typeof photo.title).toBe('string')
      expect(typeof photo.altText).toBe('string')
      expect(typeof photo.category).toBe('string')
    })
  })

  it('should validate image asset structure', async () => {
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    photos.forEach((photo: any) => {
      expect(photo.image).toHaveProperty('_type')
      expect(photo.image).toHaveProperty('asset')
      expect(photo.image._type).toBe('image')
      
      expect(photo.image.asset).toHaveProperty('_ref')
      expect(photo.image.asset).toHaveProperty('_type')
      expect(photo.image.asset._type).toBe('reference')
      expect(typeof photo.image.asset._ref).toBe('string')
    })
  })

  it('should validate category enum values', async () => {
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    const validCategories = ['studio-space', 'equipment', 'classes-in-session', 'exterior']
    
    photos.forEach((photo: any) => {
      expect(validCategories).toContain(photo.category)
    })
  })

  it('should validate required text fields are not empty', async () => {
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    photos.forEach((photo: any) => {
      expect(photo.title.length).toBeGreaterThan(0)
      expect(photo.altText.length).toBeGreaterThan(0) // Required for accessibility
    })
  })

  it('should validate hotspot coordinates when provided', async () => {
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    photos.forEach((photo: any) => {
      if (photo.image.hotspot) {
        expect(typeof photo.image.hotspot.x).toBe('number')
        expect(typeof photo.image.hotspot.y).toBe('number')
        expect(photo.image.hotspot.x).toBeGreaterThanOrEqual(0)
        expect(photo.image.hotspot.x).toBeLessThanOrEqual(1)
        expect(photo.image.hotspot.y).toBeGreaterThanOrEqual(0)
        expect(photo.image.hotspot.y).toBeLessThanOrEqual(1)
      }
    })
  })

  it('should validate crop coordinates when provided', async () => {
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    photos.forEach((photo: any) => {
      if (photo.image.crop) {
        expect(typeof photo.image.crop.left).toBe('number')
        expect(typeof photo.image.crop.top).toBe('number')
        expect(typeof photo.image.crop.right).toBe('number')
        expect(typeof photo.image.crop.bottom).toBe('number')
        
        // All crop values should be between 0 and 1
        Object.values(photo.image.crop).forEach((value: any) => {
          expect(value).toBeGreaterThanOrEqual(0)
          expect(value).toBeLessThanOrEqual(1)
        })
      }
    })
  })

  it('should validate boolean fields', async () => {
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    photos.forEach((photo: any) => {
      if (photo.hasOwnProperty('featured')) {
        expect(typeof photo.featured).toBe('boolean')
      }
    })
  })

  it('should validate sortOrder when provided', async () => {
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    photos.forEach((photo: any) => {
      if (photo.sortOrder !== null && photo.sortOrder !== undefined) {
        expect(typeof photo.sortOrder).toBe('number')
        expect(photo.sortOrder).toBeGreaterThan(0)
      }
    })
  })

  it('should validate date format when provided', async () => {
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    photos.forEach((photo: any) => {
      if (photo.dateTaken) {
        // Should be valid date string (YYYY-MM-DD format)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        expect(dateRegex.test(photo.dateTaken)).toBe(true)
        
        // Should be a valid date
        const date = new Date(photo.dateTaken)
        expect(date instanceof Date && !isNaN(date.getTime())).toBe(true)
      }
    })
  })

  it('should filter photos by category when requested', async () => {
    const { getPhotosByCategory } = await import('../../src/services/photoService')
    
    const studioSpacePhotos = await getPhotosByCategory('studio-space')
    
    studioSpacePhotos.forEach((photo: any) => {
      expect(photo.category).toBe('studio-space')
    })
  })

  it('should filter featured photos when requested', async () => {
    const { getFeaturedPhotos } = await import('../../src/services/photoService')
    
    const featuredPhotos = await getFeaturedPhotos()
    
    featuredPhotos.forEach((photo: any) => {
      expect(photo.featured).toBe(true)
    })
  })

  it('should limit featured photos per category', async () => {
    const { getFeaturedPhotos } = await import('../../src/services/photoService')
    
    const featuredPhotos = await getFeaturedPhotos()
    const validCategories = ['studio-space', 'equipment', 'classes-in-session', 'exterior']
    
    validCategories.forEach((category) => {
      const categoryFeatured = featuredPhotos.filter((photo: any) => photo.category === category)
      expect(categoryFeatured.length).toBeLessThanOrEqual(6) // Per contract limit
    })
  })

  it('should validate photographer field when provided', async () => {
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    
    photos.forEach((photo: any) => {
      if (photo.photographer) {
        expect(typeof photo.photographer).toBe('string')
        expect(photo.photographer.length).toBeGreaterThan(0)
      }
    })
  })
})