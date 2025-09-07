// Image optimization utilities - comprehensive image processing and optimization
// Handles Sanity image optimization, responsive images, and performance features

import { urlFor, type SanityImage } from '../lib/sanity'
import type { SanityImageSource } from '@sanity/image-url/lib/types'

// Type definitions for image optimization
export interface ImageSizeConfig {
  width: number
  height?: number
  aspectRatio?: number
  quality?: number
  format?: 'auto' | 'webp' | 'jpg' | 'png'
  fit?: 'crop' | 'fill' | 'max' | 'scale' | 'clip' | 'pad'
}

export interface ResponsiveImageConfig {
  sizes: number[]
  aspectRatio?: number
  quality?: number
  format?: 'auto' | 'webp' | 'jpg' | 'png'
  fit?: 'crop' | 'fill' | 'max' | 'scale' | 'clip' | 'pad'
  includeOriginal?: boolean
}

export interface OptimizedImageUrls {
  src: string
  srcset: string
  sizes: string
  width: number
  height: number
  aspectRatio: number
  placeholder?: string
}

export interface ImageMetadata {
  width: number
  height: number
  aspectRatio: number
  format: string
  size?: number
  hasAlpha?: boolean
  isOpaque?: boolean
  lqip?: string
  dominantColor?: string
}

// Pre-defined image size configurations
export const imageSizePresets = {
  thumbnail: { width: 150, height: 150, quality: 80, fit: 'crop' as const },
  small: { width: 300, height: 225, quality: 85, fit: 'crop' as const },
  medium: { width: 600, height: 450, quality: 85, fit: 'crop' as const },
  large: { width: 1200, height: 900, quality: 90, fit: 'crop' as const },
  xlarge: { width: 1800, height: 1350, quality: 90, fit: 'crop' as const },
  hero: { width: 1920, height: 1080, quality: 95, fit: 'crop' as const },
  
  // Square variants
  thumbnailSquare: { width: 150, height: 150, quality: 80, fit: 'crop' as const },
  smallSquare: { width: 300, height: 300, quality: 85, fit: 'crop' as const },
  mediumSquare: { width: 600, height: 600, quality: 85, fit: 'crop' as const },
  
  // Wide variants
  banner: { width: 1200, height: 400, quality: 90, fit: 'crop' as const },
  ultrawide: { width: 1600, height: 600, quality: 90, fit: 'crop' as const },
}

// Common breakpoints for responsive images
export const responsiveBreakpoints = {
  mobile: [320, 480, 640],
  tablet: [768, 1024],
  desktop: [1280, 1440, 1680, 1920],
  all: [320, 480, 640, 768, 1024, 1280, 1440, 1680, 1920]
}

// Image optimization utility class
export class ImageUtils {
  /**
   * Generate optimized image URL with specified configuration
   */
  static generateOptimizedUrl(
    image: SanityImageSource,
    config: ImageSizeConfig
  ): string {
    if (!image) return '/placeholder-image.jpg'

    let builder = urlFor(image)
      .width(config.width)
      .quality(config.quality || 85)
      .auto('format')

    if (config.height) {
      builder = builder.height(config.height)
    } else if (config.aspectRatio) {
      builder = builder.height(Math.round(config.width / config.aspectRatio))
    }

    if (config.fit) {
      builder = builder.fit(config.fit)
    }

    if (config.format && config.format !== 'auto') {
      builder = builder.format(config.format)
    }

    return builder.url()
  }

  /**
   * Generate responsive image URLs with srcset and sizes
   */
  static generateResponsiveImage(
    image: SanityImageSource,
    config: ResponsiveImageConfig
  ): OptimizedImageUrls {
    if (!image) {
      const placeholder = '/placeholder-image.jpg'
      return {
        src: placeholder,
        srcset: placeholder,
        sizes: '100vw',
        width: 800,
        height: 600,
        aspectRatio: 4/3
      }
    }

    const { sizes, aspectRatio = 4/3, quality = 85, format = 'auto', fit = 'crop' } = config

    // Generate srcset entries
    const srcsetEntries = sizes.map(width => {
      const height = Math.round(width / aspectRatio)
      let builder = urlFor(image)
        .width(width)
        .height(height)
        .quality(quality)
        .fit(fit)
        .auto('format')

      if (format !== 'auto') {
        builder = builder.format(format)
      }

      return `${builder.url()} ${width}w`
    })

    // Add original size if requested and not already included
    if (config.includeOriginal) {
      const originalUrl = urlFor(image).auto('format').quality(95).url()
      srcsetEntries.push(`${originalUrl} 2400w`)
    }

    const srcset = srcsetEntries.join(', ')

    // Primary src (use medium size as default)
    const primaryWidth = sizes[Math.floor(sizes.length / 2)] || sizes[0]
    const primaryHeight = Math.round(primaryWidth / aspectRatio)
    const src = urlFor(image)
      .width(primaryWidth)
      .height(primaryHeight)
      .quality(quality)
      .fit(fit)
      .auto('format')
      .url()

    // Generate sizes attribute based on breakpoints
    const sizesAttr = this.generateSizesAttribute(sizes)

    return {
      src,
      srcset,
      sizes: sizesAttr,
      width: primaryWidth,
      height: primaryHeight,
      aspectRatio,
      placeholder: this.generatePlaceholder(image)
    }
  }

  /**
   * Generate sizes attribute for responsive images
   */
  private static generateSizesAttribute(widths: number[]): string {
    // Create a reasonable sizes attribute based on common breakpoints
    const breakpoints = [
      '(max-width: 480px) 100vw',
      '(max-width: 768px) 90vw',
      '(max-width: 1024px) 80vw',
      '(max-width: 1440px) 70vw',
      '1200px'
    ]
    
    return breakpoints.join(', ')
  }

  /**
   * Generate low-quality image placeholder (LQIP)
   */
  static generatePlaceholder(image: SanityImageSource): string {
    if (!image) return ''

    return urlFor(image)
      .width(20)
      .height(15)
      .quality(20)
      .blur(20)
      .auto('format')
      .url()
  }

  /**
   * Extract image metadata from Sanity image
   */
  static extractImageMetadata(image: SanityImage): ImageMetadata | null {
    if (!image?.asset?.metadata) return null

    const metadata = image.asset.metadata
    const dimensions = metadata.dimensions

    return {
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.aspectRatio || dimensions.width / dimensions.height,
      format: image.asset.url?.split('.').pop()?.toLowerCase() || 'jpg',
      hasAlpha: metadata.hasAlpha,
      isOpaque: metadata.isOpaque,
      lqip: metadata.lqip,
      dominantColor: (metadata as any).palette?.dominant?.background
    }
  }

  /**
   * Generate art-directed responsive image for different breakpoints
   */
  static generateArtDirectedImage(
    image: SanityImageSource,
    configs: {
      mobile: ImageSizeConfig
      tablet: ImageSizeConfig
      desktop: ImageSizeConfig
    }
  ): {
    mobile: string
    tablet: string
    desktop: string
    sources: Array<{ media: string; srcset: string; sizes: string }>
  } {
    if (!image) {
      const placeholder = '/placeholder-image.jpg'
      return {
        mobile: placeholder,
        tablet: placeholder,
        desktop: placeholder,
        sources: []
      }
    }

    const mobile = this.generateOptimizedUrl(image, configs.mobile)
    const tablet = this.generateOptimizedUrl(image, configs.tablet)
    const desktop = this.generateOptimizedUrl(image, configs.desktop)

    const sources = [
      {
        media: '(min-width: 1024px)',
        srcset: desktop,
        sizes: '100vw'
      },
      {
        media: '(min-width: 768px)',
        srcset: tablet,
        sizes: '100vw'
      },
      {
        media: '(max-width: 767px)',
        srcset: mobile,
        sizes: '100vw'
      }
    ]

    return {
      mobile,
      tablet,
      desktop,
      sources
    }
  }

  /**
   * Generate image for specific use case
   */
  static generateImageForUseCase(
    image: SanityImageSource,
    useCase: keyof typeof imageSizePresets
  ): string {
    const config = imageSizePresets[useCase]
    return this.generateOptimizedUrl(image, config)
  }

  /**
   * Generate multiple image sizes at once
   */
  static generateImageSizes(
    image: SanityImageSource,
    presets: Array<keyof typeof imageSizePresets>
  ): Record<string, string> {
    if (!image) {
      const result: Record<string, string> = {}
      presets.forEach(preset => {
        result[preset] = '/placeholder-image.jpg'
      })
      return result
    }

    const result: Record<string, string> = {}
    
    presets.forEach(preset => {
      const config = imageSizePresets[preset]
      result[preset] = this.generateOptimizedUrl(image, config)
    })

    return result
  }

  /**
   * Calculate optimal image dimensions for container
   */
  static calculateOptimalDimensions(
    containerWidth: number,
    containerHeight: number,
    imageAspectRatio: number,
    fit: 'cover' | 'contain' | 'fill' = 'cover'
  ): { width: number; height: number } {
    const containerAspectRatio = containerWidth / containerHeight

    if (fit === 'fill') {
      return { width: containerWidth, height: containerHeight }
    }

    if (fit === 'contain') {
      if (imageAspectRatio > containerAspectRatio) {
        // Image is wider than container
        return {
          width: containerWidth,
          height: Math.round(containerWidth / imageAspectRatio)
        }
      } else {
        // Image is taller than container
        return {
          width: Math.round(containerHeight * imageAspectRatio),
          height: containerHeight
        }
      }
    }

    // Cover mode (default)
    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider than container
      return {
        width: Math.round(containerHeight * imageAspectRatio),
        height: containerHeight
      }
    } else {
      // Image is taller than container
      return {
        width: containerWidth,
        height: Math.round(containerWidth / imageAspectRatio)
      }
    }
  }

  /**
   * Generate CSS background-image with optimized URLs
   */
  static generateBackgroundImage(
    image: SanityImageSource,
    config?: ImageSizeConfig
  ): string {
    if (!image) return ''

    const defaultConfig: ImageSizeConfig = {
      width: 1920,
      height: 1080,
      quality: 85,
      fit: 'crop'
    }

    const finalConfig = { ...defaultConfig, ...config }
    const url = this.generateOptimizedUrl(image, finalConfig)

    return `url('${url}')`
  }

  /**
   * Validate image aspect ratio
   */
  static validateAspectRatio(
    image: SanityImage,
    expectedAspectRatio: number,
    tolerance: number = 0.1
  ): boolean {
    const metadata = this.extractImageMetadata(image)
    if (!metadata) return false

    const difference = Math.abs(metadata.aspectRatio - expectedAspectRatio)
    return difference <= tolerance
  }

  /**
   * Get image color palette information
   */
  static getImagePalette(image: SanityImage): {
    dominant?: string
    vibrant?: string
    muted?: string
    lightVibrant?: string
    lightMuted?: string
    darkVibrant?: string
    darkMuted?: string
  } {
    const metadata = image?.asset?.metadata as any
    
    if (!metadata?.palette) return {}

    const palette = metadata.palette
    
    return {
      dominant: palette.dominant?.background,
      vibrant: palette.vibrant?.background,
      muted: palette.muted?.background,
      lightVibrant: palette.lightVibrant?.background,
      lightMuted: palette.lightMuted?.background,
      darkVibrant: palette.darkVibrant?.background,
      darkMuted: palette.darkMuted?.background
    }
  }

  /**
   * Generate WebP and fallback URLs
   */
  static generateWebPWithFallback(
    image: SanityImageSource,
    config: ImageSizeConfig
  ): { webp: string; fallback: string } {
    if (!image) {
      const placeholder = '/placeholder-image.jpg'
      return { webp: placeholder, fallback: placeholder }
    }

    const webp = this.generateOptimizedUrl(image, { ...config, format: 'webp' })
    const fallback = this.generateOptimizedUrl(image, { ...config, format: 'jpg' })

    return { webp, fallback }
  }

  /**
   * Generate loading="lazy" compatible image attributes
   */
  static generateLazyImageAttributes(
    image: SanityImageSource,
    config: ResponsiveImageConfig & { alt: string }
  ): {
    src: string
    srcset: string
    sizes: string
    alt: string
    width: number
    height: number
    loading: 'lazy'
    decoding: 'async'
    style: string
  } {
    const optimized = this.generateResponsiveImage(image, config)
    const placeholder = this.generatePlaceholder(image)

    return {
      src: optimized.src,
      srcset: optimized.srcset,
      sizes: optimized.sizes,
      alt: config.alt,
      width: optimized.width,
      height: optimized.height,
      loading: 'lazy',
      decoding: 'async',
      style: placeholder ? `background-image: url('${placeholder}')` : ''
    }
  }

  /**
   * Calculate image file size estimate
   */
  static estimateFileSize(
    width: number,
    height: number,
    quality: number = 85,
    format: 'jpg' | 'webp' | 'png' = 'jpg'
  ): number {
    const pixels = width * height
    
    // Rough estimates based on typical compression ratios
    const compressionRatios = {
      jpg: quality / 100 * 0.1, // JPEG is very efficient
      webp: quality / 100 * 0.08, // WebP is more efficient than JPEG
      png: 0.3 // PNG is less efficient for photos
    }

    const bytesPerPixel = compressionRatios[format] * 3 // RGB
    return Math.round(pixels * bytesPerPixel)
  }

  /**
   * Get optimal quality based on image size
   */
  static getOptimalQuality(width: number, height: number): number {
    const pixels = width * height
    
    // Larger images can use lower quality while maintaining visual quality
    if (pixels > 2000000) return 80 // 2MP+
    if (pixels > 1000000) return 85 // 1-2MP
    if (pixels > 500000) return 90  // 0.5-1MP
    return 95 // Small images need higher quality
  }
}

// Utility functions for common operations
export const imageUtils = {
  /**
   * Quick responsive image generation
   */
  responsive: (image: SanityImageSource, aspectRatio: number = 4/3) => {
    return ImageUtils.generateResponsiveImage(image, {
      sizes: responsiveBreakpoints.all,
      aspectRatio,
      quality: 85
    })
  },

  /**
   * Quick thumbnail generation
   */
  thumbnail: (image: SanityImageSource) => {
    return ImageUtils.generateImageForUseCase(image, 'thumbnail')
  },

  /**
   * Quick hero image generation
   */
  hero: (image: SanityImageSource) => {
    return ImageUtils.generateImageForUseCase(image, 'hero')
  },

  /**
   * Quick placeholder generation
   */
  placeholder: (image: SanityImageSource) => {
    return ImageUtils.generatePlaceholder(image)
  }
}

// Export everything
export default ImageUtils