// Global validation rules and helpers for Sanity schemas
// Ensures consistency across all content types

export const phoneRegex = /^\+?[1-9]\d{1,14}$/
export const usZipRegex = /^\d{5}(-\d{4})?$/
export const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
export const stripePriceIdRegex = /^price_[a-zA-Z0-9]+$/

// Common validation functions
export const validatePhoneNumber = (Rule: any) =>
  Rule.regex(phoneRegex, {
    name: 'phone number',
    invert: false,
  }).error('Please enter a valid phone number')

export const validateUSZipCode = (Rule: any) =>
  Rule.regex(usZipRegex, {
    name: 'US ZIP code',
    invert: false,
  }).error('Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)')

export const validateTime24Hour = (Rule: any) =>
  Rule.regex(timeRegex, {
    name: '24-hour time',
    invert: false,
  }).error('Please enter time in HH:mm format (e.g., 09:00 or 21:00)')

export const validateStripePriceId = (Rule: any) =>
  Rule.regex(stripePriceIdRegex, {
    name: 'Stripe Price ID',
    invert: false,
  }).error('Please enter a valid Stripe Price ID (starts with "price_")')

// Text length validators
export const validateBioLength = (Rule: any) =>
  Rule.custom((bio: any) => {
    if (!bio || !Array.isArray(bio)) return 'Bio is required'
    
    // Calculate text length from rich text blocks
    let textLength = 0
    bio.forEach((block: any) => {
      if (block._type === 'block' && block.children) {
        block.children.forEach((child: any) => {
          if (child._type === 'span' && child.text) {
            textLength += child.text.length
          }
        })
      }
    })
    
    if (textLength < 100) {
      return 'Bio must be at least 100 characters long for meaningful instructor profiles'
    }
    
    if (textLength > 2000) {
      return 'Bio should be under 2000 characters for better readability'
    }
    
    return true
  })

// Business rule validators
export const validatePopularPlanLimit = async (document: any, context: any) => {
  if (!document?.isPopular) return true
  
  const { getClient } = context
  const client = getClient({ apiVersion: '2024-01-01' })
  
  const query = `count(*[_type == "membershipPlan" && 
                          _id != $id && 
                          isPopular == true && 
                          billingCycle == $billingCycle &&
                          isActive == true])`
  
  const existingPopular = await client.fetch(query, {
    id: document._id,
    billingCycle: document.billingCycle,
  })
  
  if (existingPopular >= 1) {
    return `Only one plan per billing cycle can be marked as popular. There is already a popular ${document.billingCycle} plan.`
  }
  
  return true
}

export const validateFeaturedPhotoLimit = async (document: any, context: any) => {
  if (!document?.featured) return true
  
  const { getClient } = context
  const client = getClient({ apiVersion: '2024-01-01' })
  
  const query = `count(*[_type == "photo" && 
                          _id != $id && 
                          featured == true && 
                          category == $category &&
                          isActive == true])`
  
  const featuredCount = await client.fetch(query, {
    id: document._id,
    category: document.category,
  })
  
  if (featuredCount >= 6) {
    return `Maximum 6 featured photos per category. There are already ${featuredCount} featured ${document.category} photos.`
  }
  
  return true
}

export const validateSingletonDocument = async (document: any, context: any, docType: string) => {
  const { getClient } = context
  const client = getClient({ apiVersion: '2024-01-01' })
  
  const query = `count(*[_type == $docType && _id != $id])`
  
  const existingCount = await client.fetch(query, {
    id: document._id,
    docType,
  })
  
  if (existingCount >= 1) {
    return `Only one ${docType} document is allowed. Please edit the existing document instead of creating a new one.`
  }
  
  return true
}

// Content quality validators
export const validateImageAltText = (Rule: any) =>
  Rule.custom((alt: string) => {
    if (!alt || alt.length < 10) {
      return 'Alt text must be at least 10 characters for proper accessibility'
    }
    
    if (alt.length > 200) {
      return 'Alt text should be under 200 characters for better usability'
    }
    
    // Check for generic alt text
    const genericPhrases = ['image', 'photo', 'picture', 'img']
    const lowerAlt = alt.toLowerCase()
    
    if (genericPhrases.some(phrase => lowerAlt === phrase)) {
      return 'Alt text should be descriptive, not just generic terms like "image" or "photo"'
    }
    
    return true
  })

// URL validators
export const validateSocialMediaUrl = (Rule: any, platform?: string) =>
  Rule.uri({
    allowRelative: false,
    scheme: ['http', 'https'],
  }).custom((url: string) => {
    if (!url) return true
    
    // Platform-specific validation
    if (platform) {
      const platformDomains: { [key: string]: string[] } = {
        instagram: ['instagram.com', 'www.instagram.com'],
        facebook: ['facebook.com', 'www.facebook.com', 'fb.com'],
        twitter: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
        youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'],
        tiktok: ['tiktok.com', 'www.tiktok.com'],
        linkedin: ['linkedin.com', 'www.linkedin.com'],
      }
      
      if (platformDomains[platform]) {
        const urlObj = new URL(url)
        if (!platformDomains[platform].includes(urlObj.hostname)) {
          return `Please enter a valid ${platform} URL`
        }
      }
    }
    
    return true
  })

// Price validators
export const validatePositivePrice = (Rule: any) =>
  Rule.positive()
    .precision(2)
    .min(0.01)
    .max(9999.99)
    .error('Price must be a positive number between $0.01 and $9999.99')

// Name validators
export const validatePersonName = (Rule: any) =>
  Rule.regex(/^[a-zA-Z\s\-\.\']+$/, {
    name: 'person name',
    invert: false,
  }).error('Names should only contain letters, spaces, hyphens, periods, and apostrophes')

// Array validators
export const validateNonEmptyArray = (Rule: any, fieldName: string, minItems = 1) =>
  Rule.min(minItems).error(`Please add at least ${minItems} ${fieldName}`)

// Date validators
export const validateFutureDate = (Rule: any) =>
  Rule.custom((date: string) => {
    if (!date) return true
    
    const inputDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (inputDate < today) {
      return 'Date cannot be in the past'
    }
    
    return true
  })

export const validatePastOrTodayDate = (Rule: any) =>
  Rule.custom((date: string) => {
    if (!date) return true
    
    const inputDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    if (inputDate > today) {
      return 'Date cannot be in the future'
    }
    
    return true
  })