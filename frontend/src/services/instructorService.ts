// Instructors service - manages instructor data from Sanity CMS
// Implements the contract defined in instructors.test.ts

import { sanityFetch, groqFragments, sanityHelpers, type SanityDocument, type SanityImage, type SanityBlockContent } from '../lib/sanity'

// Mock instructor data
const mockInstructors = [
  {
    _id: 'mock-instructor-1',
    _type: 'instructor',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    name: 'Sarah Chen',
    title: 'Senior Instructor',
    bio: 'Sarah has been practicing yoga for over 15 years and teaching for 8. She specializes in Vinyasa and Yin yoga.',
    shortBio: 'Vinyasa & Yin specialist with 8+ years teaching experience',
    specialties: ['Vinyasa', 'Yin', 'Meditation'],
    certifications: ['RYT-500', 'Yin Yoga Certification'],
    experience: '8+ years',
    isActive: true,
    isFeatured: true,
    sortOrder: 1
  },
  {
    _id: 'mock-instructor-2',
    _type: 'instructor',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    name: 'Michael Rodriguez',
    title: 'Lead Instructor',
    bio: 'Michael brings a grounding presence to his classes, focusing on alignment and breath work.',
    shortBio: 'Hatha & Restorative yoga expert focusing on alignment',
    specialties: ['Hatha', 'Restorative', 'Pranayama'],
    certifications: ['RYT-200', 'Restorative Yoga Certification'],
    experience: '5+ years',
    isActive: true,
    isFeatured: true,
    sortOrder: 2
  },
  {
    _id: 'mock-instructor-3',
    _type: 'instructor',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    name: 'Emily Johnson',
    title: 'Instructor',
    bio: 'Emily loves creating fun, accessible classes for all levels with a focus on strength and flexibility.',
    shortBio: 'Power yoga instructor making classes accessible for all levels',
    specialties: ['Power Yoga', 'Beginner-Friendly', 'Strength Building'],
    certifications: ['RYT-200'],
    experience: '3+ years',
    isActive: true,
    isFeatured: true,
    sortOrder: 3
  }
]

// Type definitions based on instructors contract
export interface SocialMediaLink {
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin'
  url: string
}

export interface ClassScheduleItem {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  time: string
  class: string
}

export interface Instructor extends SanityDocument {
  name: string
  firstName: string
  lastName: string
  title?: string
  bio: SanityBlockContent[]
  photo: SanityImage
  certifications?: string[]
  specialties: string[]
  experience?: number
  email?: string
  socialMedia?: SocialMediaLink[]
  schedule?: ClassScheduleItem[]
  isActive: boolean
  featuredOrder?: number
}

// GROQ queries for instructors
const instructorsQuery = `
  *[_type == "instructor" && isActive == true] | order(featuredOrder asc, name asc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    name,
    firstName,
    lastName,
    title,
    bio[] ${groqFragments.portableText},
    photo ${groqFragments.image},
    certifications,
    specialties,
    experience,
    email,
    socialMedia[] ${groqFragments.socialMedia},
    schedule[] {
      day,
      time,
      class
    },
    isActive,
    featuredOrder
  }
`

const featuredInstructorsQuery = `
  *[_type == "instructor" && isActive == true && defined(featuredOrder)] | order(featuredOrder asc, name asc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    name,
    firstName,
    lastName,
    title,
    bio[] ${groqFragments.portableText},
    photo ${groqFragments.image},
    certifications,
    specialties,
    experience,
    email,
    socialMedia[] ${groqFragments.socialMedia},
    schedule[] {
      day,
      time,
      class
    },
    isActive,
    featuredOrder
  }
`

const instructorByIdQuery = `
  *[_type == "instructor" && _id == $id && isActive == true][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    name,
    firstName,
    lastName,
    title,
    bio[] ${groqFragments.portableText},
    photo ${groqFragments.image},
    certifications,
    specialties,
    experience,
    email,
    socialMedia[] ${groqFragments.socialMedia},
    schedule[] {
      day,
      time,
      class
    },
    isActive,
    featuredOrder
  }
`

// Service class for instructor operations
export class InstructorService {
  /**
   * Get all active instructors
   */
  static async getInstructors(options?: { preview?: boolean }): Promise<Instructor[]> {
    try {
      const result = await sanityFetch<Instructor[]>(
        instructorsQuery,
        {},
        {
          preview: options?.preview,
          tag: 'instructors'
        }
      )

      return result || mockInstructors
    } catch (error) {
      console.error('Failed to fetch instructors, using mock data:', error)
      return mockInstructors
    }
  }

  /**
   * Get instructor by ID
   */
  static async getInstructorById(id: string, options?: { preview?: boolean }): Promise<Instructor | null> {
    try {
      const result = await sanityFetch<Instructor>(
        instructorByIdQuery,
        { id },
        {
          preview: options?.preview,
          tag: 'instructor'
        }
      )

      return result
    } catch (error) {
      console.error('Failed to fetch instructor by ID:', error)
      throw new Error('Unable to load instructor')
    }
  }

  /**
   * Get featured instructors (those with featuredOrder defined)
   */
  static async getFeaturedInstructors(options?: { 
    preview?: boolean
    limit?: number 
  }): Promise<Instructor[]> {
    try {
      let query = featuredInstructorsQuery
      
      if (options?.limit) {
        query += ` [0...${options.limit}]`
      }

      const result = await sanityFetch<Instructor[]>(
        query,
        {},
        {
          preview: options?.preview,
          tag: 'featured-instructors'
        }
      )

      const featuredMock = mockInstructors.filter(i => i.isFeatured)
      if (options?.limit) {
        return result || featuredMock.slice(0, options.limit)
      }
      return result || featuredMock
    } catch (error) {
      console.error('Failed to fetch featured instructors, using mock data:', error)
      const featuredMock = mockInstructors.filter(i => i.isFeatured)
      if (options?.limit) {
        return featuredMock.slice(0, options.limit)
      }
      return featuredMock
    }
  }

  /**
   * Get instructors by specialty
   */
  static async getInstructorsBySpecialty(
    specialty: string,
    options?: { preview?: boolean }
  ): Promise<Instructor[]> {
    try {
      const query = `
        *[_type == "instructor" && isActive == true && $specialty in specialties] | order(featuredOrder asc, name asc) {
          _id,
          _type,
          _createdAt,
          _updatedAt,
          _rev,
          name,
          firstName,
          lastName,
          title,
          bio[] ${groqFragments.portableText},
          photo ${groqFragments.image},
          certifications,
          specialties,
          experience,
          email,
          socialMedia[] ${groqFragments.socialMedia},
          schedule[] {
            day,
            time,
            class
          },
          isActive,
          featuredOrder
        }
      `

      const result = await sanityFetch<Instructor[]>(
        query,
        { specialty },
        {
          preview: options?.preview,
          tag: `instructors-${specialty.toLowerCase().replace(/\s+/g, '-')}`
        }
      )

      return result || []
    } catch (error) {
      console.error(`Failed to fetch instructors for specialty ${specialty}:`, error)
      throw new Error(`Unable to load instructors for ${specialty}`)
    }
  }

  /**
   * Search instructors by name or specialty
   */
  static async searchInstructors(
    searchTerm: string,
    options?: { preview?: boolean }
  ): Promise<Instructor[]> {
    try {
      const query = `
        *[_type == "instructor" && 
          isActive == true && 
          (name match $searchTerm + "*" || 
           specialties[] match $searchTerm + "*" ||
           pt::text(bio) match $searchTerm + "*")] | order(featuredOrder asc, name asc) {
          _id,
          _type,
          _createdAt,
          _updatedAt,
          _rev,
          name,
          firstName,
          lastName,
          title,
          bio[] ${groqFragments.portableText},
          photo ${groqFragments.image},
          certifications,
          specialties,
          experience,
          email,
          socialMedia[] ${groqFragments.socialMedia},
          schedule[] {
            day,
            time,
            class
          },
          isActive,
          featuredOrder
        }
      `

      const result = await sanityFetch<Instructor[]>(
        query,
        { searchTerm },
        {
          preview: options?.preview,
          tag: 'instructor-search'
        }
      )

      return result || []
    } catch (error) {
      console.error('Failed to search instructors:', error)
      throw new Error('Unable to search instructors')
    }
  }

  /**
   * Get all unique specialties from all instructors
   */
  static async getAllSpecialties(options?: { preview?: boolean }): Promise<string[]> {
    try {
      const query = `
        array::unique(*[_type == "instructor" && isActive == true].specialties[])
      `

      const result = await sanityFetch<string[]>(
        query,
        {},
        {
          preview: options?.preview,
          tag: 'instructor-specialties'
        }
      )

      return result || []
    } catch (error) {
      console.error('Failed to fetch instructor specialties:', error)
      return []
    }
  }

  /**
   * Get instructors grouped by specialty
   */
  static async getInstructorsGroupedBySpecialty(options?: { 
    preview?: boolean
  }): Promise<Record<string, Instructor[]>> {
    try {
      const specialties = await InstructorService.getAllSpecialties(options)
      const grouped: Record<string, Instructor[]> = {}

      for (const specialty of specialties) {
        grouped[specialty] = await InstructorService.getInstructorsBySpecialty(specialty, options)
      }

      return grouped
    } catch (error) {
      console.error('Failed to group instructors by specialty:', error)
      throw new Error('Unable to load grouped instructors')
    }
  }

  /**
   * Get instructor statistics
   */
  static async getInstructorStats(options?: { preview?: boolean }): Promise<{
    totalInstructors: number
    featuredInstructors: number
    specialtyCount: number
    averageExperience: number
    topSpecialties: Array<{ specialty: string; count: number }>
  }> {
    try {
      const instructors = await InstructorService.getInstructors(options)
      const specialties = await InstructorService.getAllSpecialties(options)

      const featuredCount = instructors.filter(i => i.featuredOrder !== undefined).length
      const totalExperience = instructors
        .filter(i => i.experience)
        .reduce((sum, i) => sum + (i.experience || 0), 0)
      const instructorsWithExperience = instructors.filter(i => i.experience).length

      // Count specialty frequency
      const specialtyCount: Record<string, number> = {}
      instructors.forEach(instructor => {
        instructor.specialties?.forEach(specialty => {
          specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1
        })
      })

      const topSpecialties = Object.entries(specialtyCount)
        .map(([specialty, count]) => ({ specialty, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return {
        totalInstructors: instructors.length,
        featuredInstructors: featuredCount,
        specialtyCount: specialties.length,
        averageExperience: instructorsWithExperience > 0 
          ? Math.round(totalExperience / instructorsWithExperience)
          : 0,
        topSpecialties
      }
    } catch (error) {
      console.error('Failed to calculate instructor stats:', error)
      throw new Error('Unable to load instructor statistics')
    }
  }

  /**
   * Format instructor bio as plain text
   */
  static formatBioAsText(bio: SanityBlockContent[]): string {
    return sanityHelpers.getPlainText(bio)
  }

  /**
   * Get bio excerpt (first N characters)
   */
  static getBioExcerpt(bio: SanityBlockContent[], maxLength: number = 150): string {
    const plainText = this.formatBioAsText(bio)
    
    if (plainText.length <= maxLength) return plainText
    
    // Find the last complete word within the limit
    const truncated = plainText.slice(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastSpace > maxLength * 0.8) { // Only truncate at word boundary if it's close
      return truncated.slice(0, lastSpace) + '...'
    }
    
    return truncated + '...'
  }

  /**
   * Format instructor experience
   */
  static formatExperience(experience?: number): string {
    if (!experience) return ''
    
    if (experience === 1) return '1 year of teaching'
    return `${experience} years of teaching`
  }

  /**
   * Format instructor schedule for display
   */
  static formatSchedule(schedule?: ClassScheduleItem[]): Array<{
    day: string
    time: string
    class: string
    dayOfWeek: number
  }> {
    if (!schedule || schedule.length === 0) return []

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    return schedule
      .map(item => ({
        day: item.day.charAt(0).toUpperCase() + item.day.slice(1),
        time: item.time,
        class: item.class,
        dayOfWeek: dayOrder.indexOf(item.day.toLowerCase())
      }))
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  }

  /**
   * Get social media platform icon
   */
  static getSocialIcon(platform: string): string {
    const icons: Record<string, string> = {
      instagram: '📷',
      facebook: '📘',
      twitter: '🐦',
      youtube: '📹',
      tiktok: '🎵',
      linkedin: '💼'
    }
    
    return icons[platform.toLowerCase()] || '📱'
  }

  /**
   * Check if instructor teaches a specific specialty
   */
  static teachesSpecialty(instructor: Instructor, specialty: string): boolean {
    return instructor.specialties?.some(s => 
      s.toLowerCase().includes(specialty.toLowerCase())
    ) || false
  }

  /**
   * Get instructors for a specific class type
   */
  static async getInstructorsForClass(
    className: string,
    options?: { preview?: boolean }
  ): Promise<Instructor[]> {
    try {
      const query = `
        *[_type == "instructor" && 
          isActive == true && 
          (schedule[].class match $className + "*" || 
           specialties[] match $className + "*")] | order(featuredOrder asc, name asc) {
          _id,
          _type,
          _createdAt,
          _updatedAt,
          _rev,
          name,
          firstName,
          lastName,
          title,
          bio[] ${groqFragments.portableText},
          photo ${groqFragments.image},
          certifications,
          specialties,
          experience,
          email,
          socialMedia[] ${groqFragments.socialMedia},
          schedule[] {
            day,
            time,
            class
          },
          isActive,
          featuredOrder
        }
      `

      const result = await sanityFetch<Instructor[]>(
        query,
        { className },
        {
          preview: options?.preview,
          tag: `instructors-class-${className.toLowerCase().replace(/\s+/g, '-')}`
        }
      )

      return result || []
    } catch (error) {
      console.error(`Failed to fetch instructors for class ${className}:`, error)
      throw new Error(`Unable to load instructors for ${className}`)
    }
  }

  /**
   * Generate instructor URL slug
   */
  static generateSlug(instructor: Instructor): string {
    return sanityHelpers.createSlug(instructor.name)
  }

  /**
   * Get instructor by slug (name-based)
   */
  static async getInstructorBySlug(
    slug: string, 
    options?: { preview?: boolean }
  ): Promise<Instructor | null> {
    try {
      const instructors = await InstructorService.getInstructors(options)
      return instructors.find(instructor => 
        this.generateSlug(instructor) === slug
      ) || null
    } catch (error) {
      console.error('Failed to fetch instructor by slug:', error)
      return null
    }
  }

  /**
   * Calculate instructor profile completeness
   */
  static calculateProfileCompleteness(instructor: Instructor): {
    percentage: number
    missingFields: string[]
  } {
    const fields = [
      { key: 'name', weight: 10, required: true },
      { key: 'bio', weight: 15, check: (i: Instructor) => i.bio?.length > 0 },
      { key: 'photo', weight: 15, check: (i: Instructor) => !!i.photo },
      { key: 'title', weight: 10, check: (i: Instructor) => !!i.title },
      { key: 'specialties', weight: 15, check: (i: Instructor) => i.specialties?.length > 0 },
      { key: 'experience', weight: 10, check: (i: Instructor) => !!i.experience },
      { key: 'certifications', weight: 10, check: (i: Instructor) => i.certifications?.length > 0 },
      { key: 'email', weight: 5, check: (i: Instructor) => !!i.email },
      { key: 'socialMedia', weight: 5, check: (i: Instructor) => i.socialMedia?.length > 0 },
      { key: 'schedule', weight: 5, check: (i: Instructor) => i.schedule?.length > 0 }
    ]

    let totalScore = 0
    let maxScore = 0
    const missingFields: string[] = []

    fields.forEach(field => {
      maxScore += field.weight
      
      const hasField = field.check 
        ? field.check(instructor)
        : !!(instructor as any)[field.key]
      
      if (hasField) {
        totalScore += field.weight
      } else if (field.required) {
        missingFields.push(field.key)
      } else {
        missingFields.push(field.key)
      }
    })

    return {
      percentage: Math.round((totalScore / maxScore) * 100),
      missingFields
    }
  }

  /**
   * Validate instructor data structure
   */
  static validateInstructor(data: any): data is Instructor {
    if (!data || typeof data !== 'object') return false
    
    const required = ['name', 'firstName', 'lastName', 'bio', 'photo', 'specialties', 'isActive']
    
    return required.every(field => {
      if (field === 'bio') {
        return Array.isArray(data[field]) && data[field].length > 0
      }
      
      if (field === 'specialties') {
        return Array.isArray(data[field]) && data[field].length > 0
      }
      
      if (field === 'photo') {
        return data[field] && typeof data[field] === 'object'
      }
      
      if (field === 'isActive') {
        return typeof data[field] === 'boolean'
      }
      
      return typeof data[field] === 'string' && data[field].length > 0
    })
  }
}

// Default export for direct import
export default InstructorService

// Named export functions for individual use
export const {
  getInstructors,
  getInstructorById,
  getFeaturedInstructors,
  getInstructorsBySpecialty,
  searchInstructors,
  getAllSpecialties,
  getInstructorsGroupedBySpecialty,
  getInstructorStats,
  formatBioAsText,
  getBioExcerpt,
  formatExperience,
  formatSchedule,
  getSocialIcon,
  teachesSpecialty,
  getInstructorsForClass,
  generateSlug,
  getInstructorBySlug,
  calculateProfileCompleteness,
  validateInstructor
} = InstructorService