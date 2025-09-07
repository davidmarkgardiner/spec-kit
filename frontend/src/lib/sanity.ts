// Sanity client configuration and utilities
// Handles connection to Sanity CMS with proper error handling and TypeScript support

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types'

// Environment configuration
const projectId = import.meta.env.SANITY_PROJECT_ID || 'rwm8hvis'
const dataset = import.meta.env.SANITY_DATASET || 'production'
const apiVersion = import.meta.env.SANITY_API_VERSION || '2024-01-01'
const useCdn = import.meta.env.PROD // Use CDN in production

// Sanity client configuration
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published',
  stega: {
    enabled: false, // Disable visual editing in production
    studioUrl: import.meta.env.SANITY_STUDIO_URL || '/studio',
  },
})

// Preview client for draft content (used in development/preview mode)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Never use CDN for preview content
  perspective: 'previewDrafts',
  token: import.meta.env.SANITY_API_TOKEN, // Required for draft access
})

// Image URL builder
const builder = imageUrlBuilder(client)

/**
 * Generate optimized image URLs from Sanity image assets
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

/**
 * Get the appropriate client based on preview mode
 */
export function getClient(preview = false) {
  if (preview && import.meta.env.SANITY_API_TOKEN) {
    return previewClient
  }
  return client
}

// Common GROQ query fragments for reuse
export const groqFragments = {
  // Image with hotspot and crop data
  image: `{
    _type,
    asset->{
      _id,
      _ref,
      url,
      metadata {
        dimensions,
        lqip,
        hasAlpha,
        isOpaque
      }
    },
    hotspot,
    crop,
    alt
  }`,

  // Portable text (rich text) content
  portableText: `{
    ...,
    markDefs[]{
      ...,
      _type == "link" => {
        ...,
        href
      }
    }
  }`,

  // Social media link object
  socialMedia: `{
    platform,
    url
  }`,

  // Address object
  address: `{
    street,
    city,
    state,
    zipCode,
    country
  }`,

  // Business hours object
  businessHours: `{
    day,
    openTime,
    closeTime,
    isClosed
  }`
}

// Type definitions for common Sanity document types
export interface SanityDocument {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  _rev: string
}

export interface SanityImage {
  _type: 'image'
  asset: {
    _id: string
    _ref: string
    url: string
    metadata: {
      dimensions: {
        width: number
        height: number
        aspectRatio: number
      }
      lqip: string
      hasAlpha: boolean
      isOpaque: boolean
    }
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
  alt?: string
}

export interface SanityBlockContent {
  _type: 'block'
  _key: string
  style?: string
  children: Array<{
    _type: 'span'
    _key: string
    text: string
    marks?: string[]
  }>
  markDefs?: Array<{
    _type: string
    _key: string
    [key: string]: any
  }>
}

// Utility functions for working with Sanity data
export const sanityHelpers = {
  /**
   * Extract plain text from portable text content
   */
  getPlainText(blocks: SanityBlockContent[]): string {
    return blocks
      ?.map(block => 
        block._type === 'block'
          ? block.children?.map(child => child.text).join('')
          : ''
      )
      .join(' ') || ''
  },

  /**
   * Get the first image from portable text content
   */
  getFirstImage(blocks: any[]): SanityImage | null {
    const imageBlock = blocks?.find(block => block._type === 'image')
    return imageBlock || null
  },

  /**
   * Format Sanity date strings
   */
  formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
    if (!dateString) return ''
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    
    return new Date(dateString).toLocaleDateString('en-US', {
      ...defaultOptions,
      ...options
    })
  },

  /**
   * Generate srcset for responsive images
   */
  generateSrcSet(source: SanityImageSource, widths: number[]): string {
    return widths
      .map(width => {
        const url = urlFor(source).width(width).auto('format').url()
        return `${url} ${width}w`
      })
      .join(', ')
  },

  /**
   * Create a slug from a string (useful for URLs)
   */
  createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  },

  /**
   * Check if we're in preview mode
   */
  isPreviewMode(): boolean {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('preview=true')
    }
    return false
  }
}

// Error handling utilities
export class SanityError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'SanityError'
  }
}

/**
 * Wrapper for Sanity client fetch with error handling
 */
export async function sanityFetch<T = any>(
  query: string,
  params?: Record<string, any>,
  options?: {
    preview?: boolean
    tag?: string
  }
): Promise<T> {
  try {
    const client = getClient(options?.preview)
    
    const result = await client.fetch<T>(query, params, {
      cache: options?.preview ? 'no-cache' : 'force-cache',
      next: {
        tags: options?.tag ? [options.tag] : undefined,
        revalidate: options?.preview ? 0 : 3600, // 1 hour cache for production
      }
    })
    
    return result
  } catch (error) {
    console.error('Sanity fetch error:', error)
    
    if (error instanceof Error) {
      throw new SanityError(
        `Failed to fetch from Sanity: ${error.message}`,
        500,
        error
      )
    }
    
    throw new SanityError('Unknown error occurred while fetching from Sanity')
  }
}

/**
 * Configuration validation
 */
export function validateSanityConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!projectId || projectId === 'your-project-id') {
    errors.push('SANITY_PROJECT_ID environment variable is required')
  }
  
  if (!dataset) {
    errors.push('SANITY_DATASET environment variable is required')
  }
  
  if (!apiVersion) {
    errors.push('SANITY_API_VERSION environment variable is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Initialize and validate configuration on module load
if (import.meta.env.NODE_ENV !== 'test') {
  const validation = validateSanityConfig()
  if (!validation.isValid) {
    console.warn('Sanity configuration issues:', validation.errors)
  }
}

// Export client instance for direct use when needed
export default client