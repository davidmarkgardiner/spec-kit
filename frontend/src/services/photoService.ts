// Photos service - manages photo gallery data from Sanity CMS
// Implements the contract defined in photos.test.ts

import { sanityFetch, groqFragments, sanityHelpers, urlFor, type SanityDocument, type SanityImage } from '../lib/sanity'
import { mockStudioPhotos } from '../data/mockData'

// Mock photo data
const mockPhotos = [
  {
    _id: 'mock-photo-1',
    _type: 'studioPhoto',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    title: 'Main Practice Room',
    altText: 'Spacious yoga practice room with natural light',
    category: 'studio-space' as const,
    featured: true,
    sortOrder: 1,
    isActive: true,
    caption: 'Our beautiful main practice space with natural lighting'
  },
  {
    _id: 'mock-photo-2',
    _type: 'studioPhoto',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    title: 'Yoga Equipment',
    altText: 'Yoga mats, blocks, and props neatly arranged',
    category: 'equipment' as const,
    featured: true,
    sortOrder: 2,
    isActive: true,
    caption: 'High-quality yoga props available for all students'
  },
  {
    _id: 'mock-photo-3',
    _type: 'studioPhoto',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    title: 'Morning Class',
    altText: 'Students practicing yoga in morning session',
    category: 'classes-in-session' as const,
    featured: false,
    sortOrder: 3,
    isActive: true,
    caption: 'Peaceful morning yoga practice'
  }
]

// Type definitions based on photos contract
export interface StudioPhoto extends SanityDocument {
  title: string
  image: SanityImage
  altText?: string
  category: 'studio-space' | 'equipment' | 'classes-in-session' | 'exterior'
  featured: boolean
  sortOrder: number
  photographer?: string
  dateTaken?: string
  tags?: string[]
  caption?: string
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
}

export interface PhotoGalleryOptions {
  category?: string
  featured?: boolean
  limit?: number
  offset?: number
  sortBy?: 'sortOrder' | 'dateTaken' | 'title'
  sortOrder?: 'asc' | 'desc'
}

// GROQ queries for photos
const photosQuery = `
  *[_type == "photo" && isActive == true] | order(sortOrder asc, title asc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    title,
    image {
      _type,
      alt,
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          },
          lqip,
          hasAlpha,
          isOpaque
        }
      },
      hotspot,
      crop
    },
    altText,
    category,
    featured,
    sortOrder,
    photographer,
    dateTaken,
    tags,
    caption,
    isActive,
    seoTitle,
    seoDescription
  }
`

const featuredPhotosQuery = `
  *[_type == "photo" && isActive == true && featured == true] | order(sortOrder asc, title asc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    title,
    image {
      _type,
      alt,
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          },
          lqip,
          hasAlpha,
          isOpaque
        }
      },
      hotspot,
      crop
    },
    altText,
    category,
    featured,
    sortOrder,
    photographer,
    dateTaken,
    tags,
    caption,
    isActive,
    seoTitle,
    seoDescription
  }
`

const photosByCategoryQuery = `
  *[_type == "photo" && isActive == true && category == $category] | order(sortOrder asc, title asc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    title,
    image {
      _type,
      alt,
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          },
          lqip,
          hasAlpha,
          isOpaque
        }
      },
      hotspot,
      crop
    },
    altText,
    category,
    featured,
    sortOrder,
    photographer,
    dateTaken,
    tags,
    caption,
    isActive,
    seoTitle,
    seoDescription
  }
`

// Service class for photo gallery operations
export class PhotoService {
  /**
   * Get all active photos with optional filtering and sorting
   */
  static async getPhotos(options?: PhotoGalleryOptions & { preview?: boolean }): Promise<StudioPhoto[]> {
    try {
      let query = photosQuery
      let params: any = {}

      // Apply category filter
      if (options?.category) {
        query = photosByCategoryQuery
        params.category = options.category
      }

      // Apply featured filter
      if (options?.featured === true) {
        query = featuredPhotosQuery
      }

      // Apply custom sorting
      if (options?.sortBy) {
        const direction = options.sortOrder === 'desc' ? 'desc' : 'asc'
        const sortField = options.sortBy

        if (sortField === 'dateTaken') {
          query = query.replace('| order(sortOrder asc, title asc)', `| order(dateTaken ${direction}, title asc)`)
        } else if (sortField === 'title') {
          query = query.replace('| order(sortOrder asc, title asc)', `| order(title ${direction})`)
        } else {
          query = query.replace('| order(sortOrder asc, title asc)', `| order(sortOrder ${direction}, title asc)`)
        }
      }

      // Apply limit and offset
      if (options?.limit || options?.offset) {
        const offset = options.offset || 0
        const limit = options.limit || 50
        query += ` [${offset}...${offset + limit}]`
      }

      const result = await sanityFetch<StudioPhoto[]>(
        query,
        params,
        {
          preview: options?.preview,
          tag: options?.category ? `photos-${options.category}` : 'photos'
        }
      )

      return result || mockStudioPhotos.map(photo => ({
        ...photo,
        sizes: PhotoService.generateImageSizes(photo)
      }))
    } catch (error) {
      console.error('Failed to fetch photos, using mock data:', error)
      return mockStudioPhotos.map(photo => ({
        ...photo,
        sizes: PhotoService.generateImageSizes(photo)
      }))
    }
  }

  /**
   * Get photo by ID
   */
  static async getPhotoById(id: string, options?: { preview?: boolean }): Promise<StudioPhoto | null> {
    try {
      const query = `
        *[_type == "photo" && _id == $id && isActive == true][0] {
          _id,
          _type,
          _createdAt,
          _updatedAt,
          _rev,
          title,
          image ${groqFragments.image},
          altText,
          category,
          featured,
          sortOrder,
          photographer,
          dateTaken,
          tags,
          caption,
          isActive,
          seoTitle,
          seoDescription
        }
      `

      const result = await sanityFetch<StudioPhoto>(
        query,
        { id },
        {
          preview: options?.preview,
          tag: 'photo'
        }
      )

      return result
    } catch (error) {
      console.error('Failed to fetch photo by ID:', error)
      throw new Error('Unable to load photo')
    }
  }

  /**
   * Get featured photos
   */
  static async getFeaturedPhotos(options?: { 
    preview?: boolean
    category?: string
    limit?: number 
  }): Promise<StudioPhoto[]> {
    try {
      let query = featuredPhotosQuery
      let params: any = {}

      if (options?.category) {
        query = `
          *[_type == "photo" && isActive == true && featured == true && category == $category] | order(sortOrder asc, title asc) {
            _id,
            _type,
            _createdAt,
            _updatedAt,
            _rev,
            title,
            image ${groqFragments.image},
            altText,
            category,
            featured,
            sortOrder,
            photographer,
            dateTaken,
            tags,
            caption,
            isActive,
            seoTitle,
            seoDescription
          }
        `
        params.category = options.category
      }

      if (options?.limit) {
        query += ` [0...${options.limit}]`
      }

      const result = await sanityFetch<StudioPhoto[]>(
        query,
        params,
        {
          preview: options?.preview,
          tag: options?.category ? `featured-photos-${options.category}` : 'featured-photos'
        }
      )

      // If no featured photos found, fallback to all photos with same filters
      if (!result || result.length === 0) {
        console.log('No featured photos found, falling back to all photos')
        return await PhotoService.getPhotos({
          preview: options?.preview,
          category: options?.category,
          limit: options?.limit
        })
      }

      return result
    } catch (error) {
      console.error('Failed to fetch featured photos, falling back to all photos:', error)
      // Fallback to all photos
      try {
        return await PhotoService.getPhotos({
          preview: options?.preview,
          category: options?.category,
          limit: options?.limit
        })
      } catch (fallbackError) {
        console.error('Fallback to all photos also failed, using mock data:', fallbackError)
        let filteredMock = mockPhotos.filter(p => p.featured)
        if (options?.category) {
          filteredMock = filteredMock.filter(p => p.category === options.category)
        }
        if (options?.limit) {
          filteredMock = filteredMock.slice(0, options.limit)
        }
        return filteredMock.map(photo => ({
          ...photo,
          sizes: PhotoService.generateImageSizes(photo)
        }))
      }
    }
  }

  /**
   * Get photos by category
   */
  static async getPhotosByCategory(
    category: string,
    options?: { 
      preview?: boolean
      limit?: number
      featured?: boolean
    }
  ): Promise<StudioPhoto[]> {
    try {
      let query = photosByCategoryQuery
      
      if (options?.featured === true) {
        query = `
          *[_type == "photo" && isActive == true && category == $category && featured == true] | order(sortOrder asc, title asc) {
            _id,
            _type,
            _createdAt,
            _updatedAt,
            _rev,
            title,
            image ${groqFragments.image},
            altText,
            category,
            featured,
            sortOrder,
            photographer,
            dateTaken,
            tags,
            caption,
            isActive,
            seoTitle,
            seoDescription
          }
        `
      }

      if (options?.limit) {
        query += ` [0...${options.limit}]`
      }

      const result = await sanityFetch<StudioPhoto[]>(
        query,
        { category },
        {
          preview: options?.preview,
          tag: `photos-category-${category}`
        }
      )

      return result || mockStudioPhotos.map(photo => ({
        ...photo,
        sizes: PhotoService.generateImageSizes(photo)
      })).filter(p => p.category === category)
    } catch (error) {
      console.error(`Failed to fetch photos for category ${category}, using mock data:`, error)
      return mockStudioPhotos.map(photo => ({
        ...photo,
        sizes: PhotoService.generateImageSizes(photo)
      })).filter(p => p.category === category)
    }
  }

  /**
   * Get photos grouped by category
   */
  static async getPhotosGroupedByCategory(options?: { 
    preview?: boolean
    featured?: boolean
  }): Promise<Record<string, StudioPhoto[]>> {
    try {
      const categories = ['studio-space', 'equipment', 'classes-in-session', 'exterior']
      const grouped: Record<string, StudioPhoto[]> = {}

      for (const category of categories) {
        grouped[category] = await PhotoService.getPhotosByCategory(category, {
          preview: options?.preview,
          featured: options?.featured
        })
      }

      return grouped
    } catch (error) {
      console.error('Failed to group photos by category:', error)
      throw new Error('Unable to load grouped photos')
    }
  }

  /**
   * Search photos by title, tags, or caption
   */
  static async searchPhotos(
    searchTerm: string,
    options?: { preview?: boolean }
  ): Promise<StudioPhoto[]> {
    try {
      const query = `
        *[_type == "photo" && 
          isActive == true && 
          (title match $searchTerm + "*" || 
           tags[] match $searchTerm + "*" ||
           caption match $searchTerm + "*")] | order(sortOrder asc, title asc) {
          _id,
          _type,
          _createdAt,
          _updatedAt,
          _rev,
          title,
          image ${groqFragments.image},
          altText,
          category,
          featured,
          sortOrder,
          photographer,
          dateTaken,
          tags,
          caption,
          isActive,
          seoTitle,
          seoDescription
        }
      `

      const result = await sanityFetch<StudioPhoto[]>(
        query,
        { searchTerm },
        {
          preview: options?.preview,
          tag: 'photo-search'
        }
      )

      return result || []
    } catch (error) {
      console.error('Failed to search photos:', error)
      throw new Error('Unable to search photos')
    }
  }

  /**
   * Get random photos for variety
   */
  static async getRandomPhotos(
    count: number = 6,
    options?: { 
      preview?: boolean
      category?: string
      excludeIds?: string[]
    }
  ): Promise<StudioPhoto[]> {
    try {
      let query = `
        *[_type == "photo" && isActive == true
      `

      const params: any = {}

      if (options?.category) {
        query += ` && category == $category`
        params.category = options.category
      }

      if (options?.excludeIds && options.excludeIds.length > 0) {
        query += ` && !(_id in $excludeIds)`
        params.excludeIds = options.excludeIds
      }

      query += `] | order(_createdAt desc) {
          _id,
          _type,
          _createdAt,
          _updatedAt,
          _rev,
          title,
          image ${groqFragments.image},
          altText,
          category,
          featured,
          sortOrder,
          photographer,
          dateTaken,
          tags,
          caption,
          isActive,
          seoTitle,
          seoDescription
        } [0...${count * 3}]` // Get more than needed for randomization

      const result = await sanityFetch<StudioPhoto[]>(
        query,
        params,
        {
          preview: options?.preview,
          tag: 'random-photos'
        }
      )

      if (!result || result.length === 0) return []

      // Shuffle and take requested count
      const shuffled = result.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count)
    } catch (error) {
      console.error('Failed to fetch random photos:', error)
      throw new Error('Unable to load random photos')
    }
  }

  /**
   * Get photo gallery statistics
   */
  static async getPhotoStats(options?: { preview?: boolean }): Promise<{
    totalPhotos: number
    featuredPhotos: number
    photosByCategory: Record<string, number>
    photographers: string[]
    recentPhotos: number
  }> {
    try {
      const photos = await PhotoService.getPhotos({ preview: options?.preview })
      
      const featuredCount = photos.filter(p => p.featured).length
      
      const photosByCategory: Record<string, number> = {}
      photos.forEach(photo => {
        photosByCategory[photo.category] = (photosByCategory[photo.category] || 0) + 1
      })

      const photographers = Array.from(new Set(
        photos
          .filter(p => p.photographer)
          .map(p => p.photographer!)
      ))

      // Photos from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentPhotos = photos.filter(photo => {
        if (!photo.dateTaken) return false
        return new Date(photo.dateTaken) > thirtyDaysAgo
      }).length

      return {
        totalPhotos: photos.length,
        featuredPhotos: featuredCount,
        photosByCategory,
        photographers,
        recentPhotos
      }
    } catch (error) {
      console.error('Failed to calculate photo stats:', error)
      throw new Error('Unable to load photo statistics')
    }
  }

  /**
   * Generate optimized image URLs with different sizes
   */
  static generateImageSizes(photo: StudioPhoto): {
    thumbnail: string
    small: string
    medium: string
    large: string
    original: string
  } {
    if (!photo.image) {
      const placeholder = '/placeholder-photo.jpg'
      return {
        thumbnail: placeholder,
        small: placeholder,
        medium: placeholder,
        large: placeholder,
        original: placeholder
      }
    }

    return {
      thumbnail: urlFor(photo.image).width(200).height(150).fit('crop').auto('format').quality(80).url(),
      small: urlFor(photo.image).width(400).height(300).fit('crop').auto('format').quality(85).url(),
      medium: urlFor(photo.image).width(800).height(600).fit('crop').auto('format').quality(85).url(),
      large: urlFor(photo.image).width(1200).height(900).fit('crop').auto('format').quality(90).url(),
      original: urlFor(photo.image).auto('format').quality(95).url()
    }
  }

  /**
   * Generate responsive srcset for images
   */
  static generateSrcSet(photo: StudioPhoto, sizes?: number[]): string {
    if (!photo.image) return ''

    const defaultSizes = sizes || [400, 800, 1200, 1600]
    
    return defaultSizes
      .map(width => {
        const url = urlFor(photo.image)
          .width(width)
          .height(Math.round(width * 0.75)) // 4:3 aspect ratio
          .fit('crop')
          .auto('format')
          .quality(85)
          .url()
        return `${url} ${width}w`
      })
      .join(', ')
  }

  /**
   * Get category display name
   */
  static getCategoryDisplayName(category: string): string {
    const categoryMap: Record<string, string> = {
      'studio-space': 'Studio Space',
      'equipment': 'Equipment',
      'classes-in-session': 'Classes in Session',
      'exterior': 'Exterior'
    }
    
    return categoryMap[category] || category
  }

  /**
   * Format photo date for display
   */
  static formatPhotoDate(dateString?: string): string {
    if (!dateString) return ''
    
    return sanityHelpers.formatDate(dateString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Get photo aspect ratio
   */
  static getAspectRatio(photo: StudioPhoto): number {
    if (!photo.image?.asset?.metadata?.dimensions) return 4/3 // Default aspect ratio
    
    const { width, height } = photo.image.asset.metadata.dimensions
    return width / height
  }

  /**
   * Check if photo is landscape/portrait/square
   */
  static getOrientation(photo: StudioPhoto): 'landscape' | 'portrait' | 'square' {
    const aspectRatio = this.getAspectRatio(photo)
    
    if (aspectRatio > 1.1) return 'landscape'
    if (aspectRatio < 0.9) return 'portrait'
    return 'square'
  }

  /**
   * Generate photo alt text if missing
   */
  static generateAltText(photo: StudioPhoto): string {
    if (photo.altText) return photo.altText
    
    // Generate based on title, category, and other info
    const parts = [photo.title]
    
    if (photo.category) {
      const categoryName = this.getCategoryDisplayName(photo.category).toLowerCase()
      if (!photo.title.toLowerCase().includes(categoryName)) {
        parts.push(`in ${categoryName}`)
      }
    }
    
    if (photo.photographer) {
      parts.push(`by ${photo.photographer}`)
    }
    
    return parts.join(' ')
  }

  /**
   * Get related photos based on category and tags
   */
  static async getRelatedPhotos(
    photo: StudioPhoto,
    options?: { 
      preview?: boolean
      limit?: number
    }
  ): Promise<StudioPhoto[]> {
    try {
      const limit = options?.limit || 6

      // First try to find photos with matching tags
      if (photo.tags && photo.tags.length > 0) {
        const query = `
          *[_type == "photo" && 
            isActive == true && 
            _id != $id && 
            count(tags[@ in $tags]) > 0] | order(count(tags[@ in $tags]) desc, sortOrder asc) {
            _id,
            _type,
            _createdAt,
            _updatedAt,
            _rev,
            title,
            image ${groqFragments.image},
            altText,
            category,
            featured,
            sortOrder,
            photographer,
            dateTaken,
            tags,
            caption,
            isActive,
            seoTitle,
            seoDescription
          } [0...${limit}]
        `

        const tagMatches = await sanityFetch<StudioPhoto[]>(
          query,
          { id: photo._id, tags: photo.tags },
          {
            preview: options?.preview,
            tag: 'related-photos-tags'
          }
        )

        if (tagMatches && tagMatches.length >= limit) {
          return tagMatches
        }
      }

      // Fall back to same category photos
      const categoryPhotos = await PhotoService.getPhotosByCategory(photo.category, {
        preview: options?.preview,
        limit: limit + 1 // Get one extra to exclude current photo
      })

      return categoryPhotos.filter(p => p._id !== photo._id).slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch related photos:', error)
      return []
    }
  }

  /**
   * Validate photo data structure
   */
  static validatePhoto(data: any): data is StudioPhoto {
    if (!data || typeof data !== 'object') return false
    
    const required = ['title', 'image', 'category', 'isActive']
    
    return required.every(field => {
      if (field === 'image') {
        return data[field] && typeof data[field] === 'object'
      }
      
      if (field === 'category') {
        return ['studio-space', 'equipment', 'classes-in-session', 'exterior'].includes(data[field])
      }
      
      if (field === 'isActive') {
        return typeof data[field] === 'boolean'
      }
      
      return typeof data[field] === 'string' && data[field].length > 0
    })
  }

  /**
   * Get next/previous photo for navigation
   */
  static async getAdjacentPhotos(
    photo: StudioPhoto,
    options?: { preview?: boolean }
  ): Promise<{
    previous: StudioPhoto | null
    next: StudioPhoto | null
  }> {
    try {
      const allPhotos = await PhotoService.getPhotosByCategory(photo.category, {
        preview: options?.preview
      })
      
      const currentIndex = allPhotos.findIndex(p => p._id === photo._id)
      
      return {
        previous: currentIndex > 0 ? allPhotos[currentIndex - 1] : null,
        next: currentIndex < allPhotos.length - 1 ? allPhotos[currentIndex + 1] : null
      }
    } catch (error) {
      console.error('Failed to fetch adjacent photos:', error)
      return { previous: null, next: null }
    }
  }
}

// Default export for direct import
export default PhotoService

// Named export functions for individual use
export const {
  getPhotos,
  getPhotoById,
  getFeaturedPhotos,
  getPhotosByCategory,
  getPhotosGroupedByCategory,
  searchPhotos,
  getRandomPhotos,
  getPhotoStats,
  generateImageSizes,
  generateSrcSet,
  getCategoryDisplayName,
  formatPhotoDate,
  getAspectRatio,
  getOrientation,
  generateAltText,
  getRelatedPhotos,
  validatePhoto,
  getAdjacentPhotos
} = PhotoService