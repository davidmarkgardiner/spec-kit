// Content processing utilities - helpers for working with CMS content
// Provides formatting, validation, and transformation utilities

import { sanityHelpers, type SanityBlockContent } from '../lib/sanity'

// Type definitions for content utilities
export interface ContentMetrics {
  wordCount: number
  characterCount: number
  readingTime: number // in minutes
  paragraphCount: number
}

export interface ContentValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface SlugOptions {
  maxLength?: number
  preserveCase?: boolean
  allowNumbers?: boolean
  separator?: string
}

// Content processing utility class
export class ContentUtils {
  /**
   * Extract plain text from rich text content
   */
  static extractPlainText(content: SanityBlockContent[]): string {
    return sanityHelpers.getPlainText(content)
  }

  /**
   * Calculate content metrics
   */
  static calculateContentMetrics(content: SanityBlockContent[]): ContentMetrics {
    const plainText = this.extractPlainText(content)
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0)
    const paragraphs = content.filter(block => block._type === 'block')
    
    // Estimate reading time (average 200 words per minute)
    const readingTime = Math.ceil(words.length / 200)

    return {
      wordCount: words.length,
      characterCount: plainText.length,
      readingTime: Math.max(1, readingTime),
      paragraphCount: paragraphs.length
    }
  }

  /**
   * Generate content excerpt
   */
  static generateExcerpt(
    content: SanityBlockContent[],
    maxLength: number = 160,
    preserveWords: boolean = true
  ): string {
    const plainText = this.extractPlainText(content)
    
    if (plainText.length <= maxLength) {
      return plainText
    }

    let excerpt = plainText.slice(0, maxLength)
    
    if (preserveWords) {
      // Find the last complete word
      const lastSpace = excerpt.lastIndexOf(' ')
      if (lastSpace > maxLength * 0.8) {
        excerpt = excerpt.slice(0, lastSpace)
      }
    }

    return excerpt.trim() + '...'
  }

  /**
   * Extract headings from rich text content
   */
  static extractHeadings(content: SanityBlockContent[]): Array<{
    level: number
    text: string
    anchor: string
  }> {
    const headings: Array<{ level: number; text: string; anchor: string }> = []
    
    content.forEach(block => {
      if (block._type === 'block' && block.style?.startsWith('h')) {
        const level = parseInt(block.style.charAt(1)) || 1
        const text = block.children
          ?.map(child => child._type === 'span' ? child.text : '')
          .join('') || ''
        
        if (text.trim()) {
          headings.push({
            level,
            text: text.trim(),
            anchor: this.generateSlug(text.trim())
          })
        }
      }
    })

    return headings
  }

  /**
   * Generate URL-friendly slug from text
   */
  static generateSlug(text: string, options: SlugOptions = {}): string {
    const {
      maxLength = 50,
      preserveCase = false,
      allowNumbers = true,
      separator = '-'
    } = options

    let slug = text.trim()

    // Convert to lowercase unless preserveCase is true
    if (!preserveCase) {
      slug = slug.toLowerCase()
    }

    // Replace accented characters
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // Keep only alphanumeric characters, spaces, and hyphens
    const pattern = allowNumbers ? /[^a-zA-Z0-9\s-]/g : /[^a-zA-Z\s-]/g
    slug = slug.replace(pattern, '')

    // Replace multiple spaces or hyphens with single separator
    slug = slug.replace(/[\s-]+/g, separator)

    // Remove leading/trailing separators
    slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '')

    // Truncate to max length
    if (slug.length > maxLength) {
      slug = slug.slice(0, maxLength)
      // Remove trailing separator after truncation
      slug = slug.replace(new RegExp(`${separator}$`), '')
    }

    return slug
  }

  /**
   * Validate content structure and completeness
   */
  static validateContent(
    content: SanityBlockContent[],
    requirements: {
      minWords?: number
      maxWords?: number
      requiredHeadings?: string[]
      forbiddenWords?: string[]
    } = {}
  ): ContentValidation {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!content || !Array.isArray(content)) {
      errors.push('Content must be an array of blocks')
      return { isValid: false, errors, warnings }
    }

    const metrics = this.calculateContentMetrics(content)
    const plainText = this.extractPlainText(content).toLowerCase()

    // Check word count requirements
    if (requirements.minWords && metrics.wordCount < requirements.minWords) {
      errors.push(`Content must have at least ${requirements.minWords} words (current: ${metrics.wordCount})`)
    }

    if (requirements.maxWords && metrics.wordCount > requirements.maxWords) {
      warnings.push(`Content exceeds recommended ${requirements.maxWords} words (current: ${metrics.wordCount})`)
    }

    // Check for required headings
    if (requirements.requiredHeadings) {
      const headings = this.extractHeadings(content)
      const headingTexts = headings.map(h => h.text.toLowerCase())
      
      requirements.requiredHeadings.forEach(required => {
        if (!headingTexts.some(text => text.includes(required.toLowerCase()))) {
          warnings.push(`Missing recommended heading: "${required}"`)
        }
      })
    }

    // Check for forbidden words
    if (requirements.forbiddenWords) {
      requirements.forbiddenWords.forEach(forbidden => {
        if (plainText.includes(forbidden.toLowerCase())) {
          warnings.push(`Content contains discouraged word: "${forbidden}"`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string, format: 'display' | 'tel' = 'display'): string {
    if (!phone) return ''
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    if (format === 'tel') {
      // Format for tel: links
      if (digits.length === 10) {
        return `+1${digits}`
      }
      if (digits.length === 11 && digits[0] === '1') {
        return `+${digits}`
      }
      return `+1${digits}`
    }

    // Format for display
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    
    if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    
    return phone // Return original if can't format
  }

  /**
   * Format currency amount
   */
  static formatCurrency(
    amount: number,
    currency: string = 'USD',
    options: {
      showCents?: boolean
      style?: 'currency' | 'compact'
    } = {}
  ): string {
    const { showCents = true, style = 'currency' } = options

    if (style === 'compact') {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`
      }
      if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`
      }
    }

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0
    })

    return formatter.format(amount)
  }

  /**
   * Format date with relative time
   */
  static formatDate(
    date: string | Date,
    options: {
      style?: 'full' | 'medium' | 'short' | 'relative'
      includeTime?: boolean
    } = {}
  ): string {
    const { style = 'medium', includeTime = false } = options
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }

    if (style === 'relative') {
      return this.getRelativeTime(dateObj)
    }

    const formatOptions: Intl.DateTimeFormatOptions = {}

    switch (style) {
      case 'full':
        formatOptions.weekday = 'long'
        formatOptions.year = 'numeric'
        formatOptions.month = 'long'
        formatOptions.day = 'numeric'
        break
      case 'medium':
        formatOptions.year = 'numeric'
        formatOptions.month = 'long'
        formatOptions.day = 'numeric'
        break
      case 'short':
        formatOptions.year = 'numeric'
        formatOptions.month = 'short'
        formatOptions.day = 'numeric'
        break
    }

    if (includeTime) {
      formatOptions.hour = 'numeric'
      formatOptions.minute = '2-digit'
      formatOptions.timeZoneName = 'short'
    }

    return dateObj.toLocaleDateString('en-US', formatOptions)
  }

  /**
   * Get relative time description
   */
  private static getRelativeTime(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
  }

  /**
   * Generate table of contents from headings
   */
  static generateTableOfContents(content: SanityBlockContent[]): Array<{
    level: number
    text: string
    anchor: string
    children?: Array<{ text: string; anchor: string }>
  }> {
    const headings = this.extractHeadings(content)
    const toc: Array<{
      level: number
      text: string
      anchor: string
      children?: Array<{ text: string; anchor: string }>
    }> = []

    let currentParent: any = null

    headings.forEach(heading => {
      if (heading.level === 2) {
        currentParent = { ...heading, children: [] }
        toc.push(currentParent)
      } else if (heading.level === 3 && currentParent) {
        currentParent.children.push({
          text: heading.text,
          anchor: heading.anchor
        })
      } else if (heading.level === 1 || !currentParent) {
        currentParent = { ...heading, children: [] }
        toc.push(currentParent)
      }
    })

    return toc
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Generate social media sharing URLs
   */
  static generateSocialShareUrls(
    url: string,
    title: string,
    description?: string
  ): {
    facebook: string
    twitter: string
    linkedin: string
    email: string
  } {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description || title)

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    }
  }

  /**
   * Truncate text with word boundaries
   */
  static truncateText(
    text: string,
    maxLength: number,
    options: {
      preserveWords?: boolean
      suffix?: string
    } = {}
  ): string {
    const { preserveWords = true, suffix = '...' } = options

    if (text.length <= maxLength) {
      return text
    }

    let truncated = text.slice(0, maxLength - suffix.length)

    if (preserveWords) {
      const lastSpace = truncated.lastIndexOf(' ')
      if (lastSpace > truncated.length * 0.8) {
        truncated = truncated.slice(0, lastSpace)
      }
    }

    return truncated.trim() + suffix
  }
}

// Utility functions for common operations
export const contentUtils = {
  /**
   * Quick excerpt generation
   */
  excerpt: (content: SanityBlockContent[], length = 160) => {
    return ContentUtils.generateExcerpt(content, length)
  },

  /**
   * Quick slug generation
   */
  slug: (text: string) => {
    return ContentUtils.generateSlug(text)
  },

  /**
   * Quick reading time calculation
   */
  readingTime: (content: SanityBlockContent[]) => {
    return ContentUtils.calculateContentMetrics(content).readingTime
  },

  /**
   * Quick text truncation
   */
  truncate: (text: string, length = 100) => {
    return ContentUtils.truncateText(text, length)
  }
}

export default ContentUtils