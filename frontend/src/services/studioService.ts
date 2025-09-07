// Studio information service - manages studio data from Sanity CMS
// Implements the contract defined in studio-info.test.ts

import { sanityFetch, groqFragments, type SanityDocument, type SanityImage } from '../lib/sanity'

// Mock data for fallback
const mockStudioInfo = {
  _id: 'mock-studio',
  _type: 'studioInfo',
  _createdAt: new Date().toISOString(),
  _updatedAt: new Date().toISOString(),
  name: 'Serenity Yoga Studio',
  tagline: 'Find Your Inner Peace',
  description: 'A welcoming yoga studio offering classes for all levels, experienced instructors, and a supportive community focused on mindful movement and wellness.',
  address: {
    street: '123 Harmony Lane',
    city: 'Mindful Valley',
    state: 'CA',
    zipCode: '94501',
    country: 'USA'
  },
  phone: '(555) 123-YOGA',
  email: 'hello@serenityyoga.com',
  website: 'https://serenityyoga.com',
  hours: [
    { day: 'monday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'tuesday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'wednesday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'thursday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'friday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'saturday', openTime: '08:00', closeTime: '18:00', isClosed: false },
    { day: 'sunday', openTime: '08:00', closeTime: '18:00', isClosed: false }
  ],
  socialMedia: [
    { platform: 'instagram', url: 'https://instagram.com/serenityyoga' },
    { platform: 'facebook', url: 'https://facebook.com/serenityyoga' }
  ],
  isActive: true
}

// Type definitions based on studio info contract
export interface StudioAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country?: string
}

export interface SocialMediaLink {
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin'
  url: string
}

export interface BusinessHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  openTime?: string // HH:mm format (24-hour)
  closeTime?: string // HH:mm format (24-hour)
  isClosed: boolean
}

export interface StudioInfo extends SanityDocument {
  name: string
  tagline?: string
  description: string
  address: StudioAddress
  phone: string
  email: string
  website?: string
  logo?: SanityImage
  socialMedia?: SocialMediaLink[]
  hours: BusinessHours[]
  emergencyContact?: string
  parkingInstructions?: string
  accessibilityInfo?: string
  isActive: boolean
}

// GROQ queries for studio information
const studioInfoQuery = `
  *[_type == "studioInfo" && isActive == true][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    name,
    tagline,
    description,
    address {
      street,
      city,
      state,
      zipCode,
      country
    },
    phone,
    email,
    website,
    logo ${groqFragments.image},
    socialMedia[] {
      platform,
      url
    },
    hours[] {
      day,
      openTime,
      closeTime,
      isClosed
    },
    emergencyContact,
    parkingInstructions,
    accessibilityInfo,
    isActive
  }
`

// Service class for studio information operations
export class StudioService {
  /**
   * Get complete studio information
   */
  static async getStudioInfo(options?: { preview?: boolean }): Promise<StudioInfo | null> {
    try {
      const result = await sanityFetch<StudioInfo>(
        studioInfoQuery,
        {},
        {
          preview: options?.preview,
          tag: 'studio-info'
        }
      )

      if (!result) {
        console.warn('No studio information found in CMS, using mock data')
        return mockStudioInfo as StudioInfo
      }

      return result
    } catch (error) {
      console.error('Failed to fetch studio information, using mock data:', error)
      return mockStudioInfo as StudioInfo
    }
  }

  /**
   * Get basic studio information (name, address, contact)
   */
  static async getBasicStudioInfo(options?: { preview?: boolean }): Promise<Partial<StudioInfo> | null> {
    try {
      const basicQuery = `
        *[_type == "studioInfo" && isActive == true][0] {
          name,
          tagline,
          address {
            street,
            city,
            state,
            zipCode
          },
          phone,
          email,
          website
        }
      `

      const result = await sanityFetch<Partial<StudioInfo>>(
        basicQuery,
        {},
        {
          preview: options?.preview,
          tag: 'studio-info-basic'
        }
      )

      return result
    } catch (error) {
      console.error('Failed to fetch basic studio information:', error)
      throw new Error('Unable to load basic studio information')
    }
  }

  /**
   * Get studio business hours
   */
  static async getBusinessHours(options?: { preview?: boolean }): Promise<BusinessHours[]> {
    try {
      const hoursQuery = `
        *[_type == "studioInfo" && isActive == true][0].hours[] {
          day,
          openTime,
          closeTime,
          isClosed
        }
      `

      const result = await sanityFetch<BusinessHours[]>(
        hoursQuery,
        {},
        {
          preview: options?.preview,
          tag: 'studio-hours'
        }
      )

      return result || []
    } catch (error) {
      console.error('Failed to fetch business hours:', error)
      return []
    }
  }

  /**
   * Get studio contact information
   */
  static async getContactInfo(options?: { preview?: boolean }): Promise<{
    phone: string
    email: string
    address: StudioAddress
    socialMedia?: SocialMediaLink[]
    emergencyContact?: string
  } | null> {
    try {
      const contactQuery = `
        *[_type == "studioInfo" && isActive == true][0] {
          phone,
          email,
          address {
            street,
            city,
            state,
            zipCode,
            country
          },
          socialMedia[] {
            platform,
            url
          },
          emergencyContact
        }
      `

      const result = await sanityFetch<any>(
        contactQuery,
        {},
        {
          preview: options?.preview,
          tag: 'studio-contact'
        }
      )

      return result
    } catch (error) {
      console.error('Failed to fetch contact information:', error)
      throw new Error('Unable to load contact information')
    }
  }

  /**
   * Get studio social media links
   */
  static async getSocialMediaLinks(options?: { preview?: boolean }): Promise<SocialMediaLink[]> {
    try {
      const socialQuery = `
        *[_type == "studioInfo" && isActive == true][0].socialMedia[] {
          platform,
          url
        }
      `

      const result = await sanityFetch<SocialMediaLink[]>(
        socialQuery,
        {},
        {
          preview: options?.preview,
          tag: 'studio-social'
        }
      )

      return result || []
    } catch (error) {
      console.error('Failed to fetch social media links:', error)
      return []
    }
  }

  /**
   * Check if studio is currently open based on current time and business hours
   */
  static async isStudioOpen(options?: { preview?: boolean }): Promise<{
    isOpen: boolean
    currentDay: string
    todaysHours: BusinessHours | null
    nextOpenTime?: string
  }> {
    try {
      const hours = await this.getBusinessHours(options)
      
      if (!hours || hours.length === 0) {
        return {
          isOpen: false,
          currentDay: 'unknown',
          todaysHours: null
        }
      }

      const now = new Date()
      const currentDay = now.toLocaleLowerCase().split(' ')[0] // Get day name
      const currentTime = now.toTimeString().substring(0, 5) // HH:mm format

      const todaysHours = hours.find(h => h.day === currentDay.toLowerCase()) || null

      if (!todaysHours || todaysHours.isClosed) {
        // Find next open day
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        const currentDayIndex = dayOrder.indexOf(currentDay.toLowerCase())
        
        let nextOpenTime: string | undefined
        for (let i = 1; i <= 7; i++) {
          const nextDayIndex = (currentDayIndex + i) % 7
          const nextDay = hours.find(h => h.day === dayOrder[nextDayIndex])
          if (nextDay && !nextDay.isClosed && nextDay.openTime) {
            nextOpenTime = `${dayOrder[nextDayIndex]} ${nextDay.openTime}`
            break
          }
        }

        return {
          isOpen: false,
          currentDay: currentDay.toLowerCase(),
          todaysHours,
          nextOpenTime
        }
      }

      const isOpen = todaysHours.openTime && todaysHours.closeTime
        ? currentTime >= todaysHours.openTime && currentTime <= todaysHours.closeTime
        : false

      return {
        isOpen,
        currentDay: currentDay.toLowerCase(),
        todaysHours
      }
    } catch (error) {
      console.error('Failed to check if studio is open:', error)
      return {
        isOpen: false,
        currentDay: 'unknown',
        todaysHours: null
      }
    }
  }

  /**
   * Get formatted address string
   */
  static formatAddress(address: StudioAddress, options?: {
    includeCountry?: boolean
    multiLine?: boolean
  }): string {
    if (!address) return ''

    const parts = [
      address.street,
      `${address.city}, ${address.state} ${address.zipCode}`
    ]

    if (options?.includeCountry && address.country) {
      parts.push(address.country)
    }

    return options?.multiLine ? parts.join('\n') : parts.join(', ')
  }

  /**
   * Format phone number for display
   */
  static formatPhone(phone: string): string {
    if (!phone) return ''
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX for 10-digit US numbers
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    
    // Format as +X (XXX) XXX-XXXX for 11-digit numbers
    if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    
    // Return original if can't format
    return phone
  }

  /**
   * Format phone number for tel: links
   */
  static formatPhoneForTel(phone: string): string {
    if (!phone) return ''
    
    // Remove all non-digits and ensure it starts with +1 for US numbers
    const digits = phone.replace(/\D/g, '')
    
    if (digits.length === 10) {
      return `+1${digits}`
    }
    
    if (digits.length === 11 && digits[0] === '1') {
      return `+${digits}`
    }
    
    return `+1${digits}`
  }

  /**
   * Format business hours for display
   */
  static formatBusinessHours(hours: BusinessHours[]): Array<{
    day: string
    hours: string
    isToday: boolean
  }> {
    if (!hours || hours.length === 0) return []

    const today = new Date().toLocaleLowerCase().split(' ')[0].toLowerCase()
    
    return hours.map(dayHours => ({
      day: dayHours.day.charAt(0).toUpperCase() + dayHours.day.slice(1),
      hours: dayHours.isClosed 
        ? 'Closed'
        : `${this.formatTime(dayHours.openTime || '')} - ${this.formatTime(dayHours.closeTime || '')}`,
      isToday: dayHours.day === today
    }))
  }

  /**
   * Format time from 24-hour to 12-hour format
   */
  private static formatTime(time: string): string {
    if (!time) return ''
    
    const [hours, minutes] = time.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    
    return `${hour12}:${minutes} ${ampm}`
  }

  /**
   * Get social media platform icon/emoji
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
   * Validate studio info data structure
   */
  static validateStudioInfo(data: any): data is StudioInfo {
    if (!data || typeof data !== 'object') return false
    
    const required = ['name', 'description', 'address', 'phone', 'email', 'hours']
    
    return required.every(field => {
      if (field === 'address') {
        return data.address && 
               typeof data.address.street === 'string' &&
               typeof data.address.city === 'string' &&
               typeof data.address.state === 'string' &&
               typeof data.address.zipCode === 'string'
      }
      
      if (field === 'hours') {
        return Array.isArray(data.hours) && data.hours.length > 0
      }
      
      return typeof data[field] === 'string' && data[field].length > 0
    })
  }
}

// Default export for direct import
export default StudioService

// Named export functions for individual use
export const {
  getStudioInfo,
  getBasicStudioInfo,
  getBusinessHours,
  getContactInfo,
  getSocialMediaLinks,
  isStudioOpen,
  formatAddress,
  formatPhone,
  formatPhoneForTel,
  formatBusinessHours,
  getSocialIcon,
  validateStudioInfo
} = StudioService