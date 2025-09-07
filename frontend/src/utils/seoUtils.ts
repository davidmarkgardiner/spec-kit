// SEO utilities - helpers for search engine optimization
// Provides meta tag generation, structured data, and SEO analysis

import type { SanityImage } from '../lib/sanity'
import { urlFor } from '../lib/sanity'

// Type definitions for SEO utilities
export interface MetaTagsConfig {
  title: string
  description: string
  canonical?: string
  image?: SanityImage | string
  imageAlt?: string
  type?: 'website' | 'article' | 'profile'
  siteName?: string
  locale?: string
  twitterCard?: 'summary' | 'summary_large_image'
  noIndex?: boolean
  noFollow?: boolean
}

export interface StructuredDataConfig {
  type: 'Organization' | 'LocalBusiness' | 'Person' | 'Article' | 'Event' | 'Course'
  name: string
  description?: string
  url?: string
  image?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  contactPoint?: {
    telephone: string
    email: string
    contactType: string
  }
  openingHours?: string[]
  priceRange?: string
  sameAs?: string[]
}

export interface SEOAnalysis {
  score: number
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    field?: string
  }>
  recommendations: string[]
}

// SEO utility class
export class SEOUtils {
  /**
   * Generate HTML meta tags
   */
  static generateMetaTags(config: MetaTagsConfig): string {
    const tags: string[] = []

    // Basic meta tags
    tags.push(`<title>${this.escapeHtml(config.title)}</title>`)
    tags.push(`<meta name="description" content="${this.escapeHtml(config.description)}">`)
    
    if (config.canonical) {
      tags.push(`<link rel="canonical" href="${config.canonical}">`)
    }

    // Robots meta
    const robotsContent = []
    if (config.noIndex) robotsContent.push('noindex')
    if (config.noFollow) robotsContent.push('nofollow')
    if (robotsContent.length > 0) {
      tags.push(`<meta name="robots" content="${robotsContent.join(', ')}">`)
    }

    // Open Graph tags
    tags.push(`<meta property="og:title" content="${this.escapeHtml(config.title)}">`)
    tags.push(`<meta property="og:description" content="${this.escapeHtml(config.description)}">`)
    tags.push(`<meta property="og:type" content="${config.type || 'website'}">`)
    
    if (config.canonical) {
      tags.push(`<meta property="og:url" content="${config.canonical}">`)
    }
    
    if (config.siteName) {
      tags.push(`<meta property="og:site_name" content="${this.escapeHtml(config.siteName)}">`)
    }
    
    if (config.locale) {
      tags.push(`<meta property="og:locale" content="${config.locale}">`)
    }

    // Image meta tags
    if (config.image) {
      const imageUrl = typeof config.image === 'string' 
        ? config.image 
        : urlFor(config.image).width(1200).height(630).fit('crop').auto('format').url()
      
      tags.push(`<meta property="og:image" content="${imageUrl}">`)
      tags.push(`<meta property="og:image:width" content="1200">`)
      tags.push(`<meta property="og:image:height" content="630">`)
      
      if (config.imageAlt) {
        tags.push(`<meta property="og:image:alt" content="${this.escapeHtml(config.imageAlt)}">`)
      }
    }

    // Twitter Card tags
    const twitterCard = config.twitterCard || (config.image ? 'summary_large_image' : 'summary')
    tags.push(`<meta name="twitter:card" content="${twitterCard}">`)
    tags.push(`<meta name="twitter:title" content="${this.escapeHtml(config.title)}">`)
    tags.push(`<meta name="twitter:description" content="${this.escapeHtml(config.description)}">`)
    
    if (config.image) {
      const imageUrl = typeof config.image === 'string' 
        ? config.image 
        : urlFor(config.image).width(1200).height(630).fit('crop').auto('format').url()
      tags.push(`<meta name="twitter:image" content="${imageUrl}">`)
      
      if (config.imageAlt) {
        tags.push(`<meta name="twitter:image:alt" content="${this.escapeHtml(config.imageAlt)}">`)
      }
    }

    return tags.join('\n')
  }

  /**
   * Generate structured data (JSON-LD)
   */
  static generateStructuredData(config: StructuredDataConfig): string {
    const baseStructure: any = {
      '@context': 'https://schema.org',
      '@type': config.type,
      name: config.name
    }

    if (config.description) {
      baseStructure.description = config.description
    }

    if (config.url) {
      baseStructure.url = config.url
    }

    if (config.image) {
      baseStructure.image = config.image
    }

    // Add type-specific properties
    switch (config.type) {
      case 'LocalBusiness':
      case 'Organization':
        if (config.address) {
          baseStructure.address = {
            '@type': 'PostalAddress',
            ...config.address
          }
        }
        
        if (config.contactPoint) {
          baseStructure.contactPoint = {
            '@type': 'ContactPoint',
            ...config.contactPoint
          }
        }
        
        if (config.openingHours) {
          baseStructure.openingHours = config.openingHours
        }
        
        if (config.priceRange) {
          baseStructure.priceRange = config.priceRange
        }
        
        if (config.sameAs) {
          baseStructure.sameAs = config.sameAs
        }
        break

      case 'Person':
        if (config.sameAs) {
          baseStructure.sameAs = config.sameAs
        }
        break
    }

    return JSON.stringify(baseStructure, null, 2)
  }

  /**
   * Analyze SEO quality
   */
  static analyzeSEO(config: MetaTagsConfig): SEOAnalysis {
    const issues: SEOAnalysis['issues'] = []
    const recommendations: string[] = []
    let score = 100

    // Title analysis
    if (!config.title) {
      issues.push({
        type: 'error',
        message: 'Title is required',
        field: 'title'
      })
      score -= 30
    } else {
      if (config.title.length < 30) {
        issues.push({
          type: 'warning',
          message: 'Title is too short (recommended: 30-60 characters)',
          field: 'title'
        })
        score -= 10
      }
      
      if (config.title.length > 60) {
        issues.push({
          type: 'warning',
          message: 'Title is too long (recommended: 30-60 characters)',
          field: 'title'
        })
        score -= 10
      }
    }

    // Description analysis
    if (!config.description) {
      issues.push({
        type: 'error',
        message: 'Meta description is required',
        field: 'description'
      })
      score -= 25
    } else {
      if (config.description.length < 120) {
        issues.push({
          type: 'warning',
          message: 'Meta description is too short (recommended: 120-160 characters)',
          field: 'description'
        })
        score -= 10
      }
      
      if (config.description.length > 160) {
        issues.push({
          type: 'warning',
          message: 'Meta description is too long (recommended: 120-160 characters)',
          field: 'description'
        })
        score -= 10
      }
    }

    // Image analysis
    if (!config.image) {
      issues.push({
        type: 'info',
        message: 'Social media image not set',
        field: 'image'
      })
      score -= 5
      recommendations.push('Add a social media image to improve link previews')
    } else if (!config.imageAlt) {
      issues.push({
        type: 'warning',
        message: 'Image alt text is missing',
        field: 'imageAlt'
      })
      score -= 5
    }

    // Canonical URL
    if (!config.canonical) {
      issues.push({
        type: 'info',
        message: 'Canonical URL not set',
        field: 'canonical'
      })
      recommendations.push('Set canonical URL to prevent duplicate content issues')
    }

    // General recommendations
    if (score > 80) {
      recommendations.push('Great SEO setup! Consider testing with Google Search Console')
    } else if (score > 60) {
      recommendations.push('Good SEO foundation, address warnings to improve further')
    } else {
      recommendations.push('SEO needs improvement, focus on fixing errors first')
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    }
  }

  /**
   * Generate sitemap entry
   */
  static generateSitemapEntry(
    url: string,
    options: {
      lastmod?: string
      changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
      priority?: number
    } = {}
  ): string {
    const { lastmod, changefreq = 'weekly', priority = 0.5 } = options
    
    let entry = `  <url>\n    <loc>${url}</loc>`
    
    if (lastmod) {
      entry += `\n    <lastmod>${lastmod}</lastmod>`
    }
    
    entry += `\n    <changefreq>${changefreq}</changefreq>`
    entry += `\n    <priority>${priority.toFixed(1)}</priority>`
    entry += '\n  </url>'
    
    return entry
  }

  /**
   * Generate robots.txt content
   */
  static generateRobotsTxt(
    siteUrl: string,
    options: {
      disallowedPaths?: string[]
      sitemapUrl?: string
      crawlDelay?: number
    } = {}
  ): string {
    const { disallowedPaths = [], sitemapUrl, crawlDelay } = options
    
    let content = 'User-agent: *\n'
    
    if (disallowedPaths.length > 0) {
      disallowedPaths.forEach(path => {
        content += `Disallow: ${path}\n`
      })
    } else {
      content += 'Allow: /\n'
    }
    
    if (crawlDelay) {
      content += `Crawl-delay: ${crawlDelay}\n`
    }
    
    content += '\n'
    
    if (sitemapUrl) {
      content += `Sitemap: ${sitemapUrl}`
    } else {
      content += `Sitemap: ${siteUrl}/sitemap.xml`
    }
    
    return content
  }

  /**
   * Extract keywords from text
   */
  static extractKeywords(
    text: string,
    options: {
      minLength?: number
      maxKeywords?: number
      stopWords?: string[]
    } = {}
  ): Array<{ keyword: string; frequency: number }> {
    const { minLength = 3, maxKeywords = 10, stopWords = [] } = options
    
    const defaultStopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must'
    ]
    
    const allStopWords = [...defaultStopWords, ...stopWords]
    
    // Clean and split text
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length >= minLength && 
        !allStopWords.includes(word) &&
        !/^\d+$/.test(word) // Remove pure numbers
      )
    
    // Count frequency
    const frequency: Record<string, number> = {}
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })
    
    // Sort by frequency and return top keywords
    return Object.entries(frequency)
      .map(([keyword, freq]) => ({ keyword, frequency: freq }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, maxKeywords)
  }

  /**
   * Generate breadcrumb structured data
   */
  static generateBreadcrumbStructuredData(
    breadcrumbs: Array<{ name: string; url?: string }>
  ): string {
    const listItems = breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.url && { item: crumb.url })
    }))

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: listItems
    }

    return JSON.stringify(structuredData, null, 2)
  }

  /**
   * Escape HTML for meta tags
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Generate FAQ structured data
   */
  static generateFAQStructuredData(
    faqs: Array<{ question: string; answer: string }>
  ): string {
    const mainEntity = faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity
    }

    return JSON.stringify(structuredData, null, 2)
  }
}

// Utility functions for common SEO operations
export const seoUtils = {
  /**
   * Quick meta tags generation for pages
   */
  pageMeta: (title: string, description: string, canonical?: string) => {
    return SEOUtils.generateMetaTags({
      title,
      description,
      canonical,
      type: 'website'
    })
  },

  /**
   * Quick article meta generation
   */
  articleMeta: (title: string, description: string, canonical?: string, image?: SanityImage) => {
    return SEOUtils.generateMetaTags({
      title,
      description,
      canonical,
      image,
      type: 'article'
    })
  },

  /**
   * Quick SEO score check
   */
  checkSEO: (title: string, description: string) => {
    return SEOUtils.analyzeSEO({ title, description })
  }
}

export default SEOUtils