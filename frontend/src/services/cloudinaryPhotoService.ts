// Enhanced Photo Service with Cloudinary Integration
// Extends the existing photo service with Cloudinary optimization

import { PhotoService, type StudioPhoto } from './photoService'
import { 
  getOptimizedImageUrl, 
  getResponsiveImageUrls, 
  getThumbnailUrl,
  type ImageOptions 
} from '../lib/cloudinary'

/**
 * Enhanced photo service that integrates Cloudinary for optimal image delivery
 * Falls back to Sanity image URLs when Cloudinary public IDs are not available
 */
export class CloudinaryPhotoService extends PhotoService {
  
  /**
   * Extract Cloudinary public ID from various sources
   */
  private static extractCloudinaryId(photo: StudioPhoto): string | null {
    // Try custom field that might contain Cloudinary public ID
    if ((photo as any).cloudinaryId) {
      return (photo as any).cloudinaryId
    }

    // Try to extract from Sanity asset reference as fallback
    if (photo.image?.asset?._ref) {
      // Use the asset reference as a fallback identifier
      return photo.image.asset._ref.replace('image-', '').replace('-jpg', '').replace('-png', '').slice(0, 20)
    }

    // For demo purposes, return a sample image ID
    return 'sample'
  }

  /**
   * Generate optimized image URLs with Cloudinary when available, fallback to Sanity
   */
  static generateOptimizedImageSizes(
    photo: StudioPhoto, 
    options: ImageOptions = {}
  ): {
    thumbnail: string
    small: string
    medium: string
    large: string
    original: string
  } {
    const cloudinaryId = this.extractCloudinaryId(photo)
    
    if (cloudinaryId) {
      // Use Cloudinary for optimization
      return {
        thumbnail: getThumbnailUrl(cloudinaryId, 200, { quality: 'auto', format: 'auto' }),
        small: getOptimizedImageUrl(cloudinaryId, { 
          width: 400, 
          height: 300, 
          crop: 'fill', 
          quality: 'auto', 
          format: 'auto',
          ...options 
        }),
        medium: getOptimizedImageUrl(cloudinaryId, { 
          width: 800, 
          height: 600, 
          crop: 'fill', 
          quality: 'auto', 
          format: 'auto',
          ...options 
        }),
        large: getOptimizedImageUrl(cloudinaryId, { 
          width: 1200, 
          height: 900, 
          crop: 'fill', 
          quality: 'auto:best', 
          format: 'auto',
          ...options 
        }),
        original: getOptimizedImageUrl(cloudinaryId, { 
          quality: 'auto:best', 
          format: 'auto',
          ...options 
        })
      }
    }

    // Fallback to parent class Sanity URLs
    return super.generateImageSizes(photo)
  }

  /**
   * Generate responsive srcset with Cloudinary optimization
   */
  static generateOptimizedSrcSet(
    photo: StudioPhoto, 
    sizes?: number[],
    options: ImageOptions = {}
  ): string {
    const cloudinaryId = this.extractCloudinaryId(photo)
    
    if (cloudinaryId) {
      const defaultSizes = sizes || [400, 800, 1200, 1600, 2000]
      
      return defaultSizes
        .map(width => {
          const url = getOptimizedImageUrl(cloudinaryId, {
            width,
            height: Math.round(width * 0.75), // 4:3 aspect ratio
            crop: 'fill',
            quality: 'auto',
            format: 'auto',
            ...options
          })
          return `${url} ${width}w`
        })
        .join(', ')
    }

    // Fallback to parent class
    return super.generateSrcSet(photo, sizes)
  }

  /**
   * Generate responsive image URLs for different breakpoints
   */
  static generateResponsiveUrls(
    photo: StudioPhoto,
    options: ImageOptions = {}
  ): {
    mobile: string
    tablet: string
    desktop: string
    large: string
    xlarge: string
  } {
    const cloudinaryId = this.extractCloudinaryId(photo)
    
    if (cloudinaryId) {
      return getResponsiveImageUrls(cloudinaryId, {
        quality: 'auto',
        format: 'auto',
        crop: 'fill',
        gravity: 'auto',
        ...options
      })
    }

    // Fallback to generate from Sanity URLs
    const sizes = this.generateOptimizedImageSizes(photo, options)
    return {
      mobile: sizes.small,
      tablet: sizes.medium,
      desktop: sizes.large,
      large: sizes.original,
      xlarge: sizes.original
    }
  }

  /**
   * Get hero image with specific optimizations for above-the-fold content
   */
  static generateHeroImage(
    photo: StudioPhoto,
    options: {
      width?: number
      height?: number
      brightness?: number
      contrast?: number
      saturation?: number
    } = {}
  ): {
    url: string
    webp: string
    avif: string
    placeholder: string
  } {
    const cloudinaryId = this.extractCloudinaryId(photo)
    const { width = 1920, height = 800, brightness, contrast, saturation } = options
    
    if (cloudinaryId) {
      const baseOptions: ImageOptions = {
        width,
        height,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:best',
        brightness,
        contrast,
        saturation
      }

      return {
        url: getOptimizedImageUrl(cloudinaryId, { ...baseOptions, format: 'auto' }),
        webp: getOptimizedImageUrl(cloudinaryId, { ...baseOptions, format: 'webp' }),
        avif: getOptimizedImageUrl(cloudinaryId, { ...baseOptions, format: 'avif' }),
        placeholder: getOptimizedImageUrl(cloudinaryId, { 
          ...baseOptions, 
          width: 50, 
          height: Math.round(50 * (height / width)),
          quality: 20,
          blur: 100
        })
      }
    }

    // Fallback to Sanity
    const sizes = this.generateOptimizedImageSizes(photo)
    return {
      url: sizes.large,
      webp: sizes.large,
      avif: sizes.large,
      placeholder: sizes.thumbnail
    }
  }

  /**
   * Generate image with text overlay for social sharing
   */
  static generateSocialShareImage(
    photo: StudioPhoto,
    text: string,
    options: {
      platform?: 'facebook' | 'twitter' | 'instagram' | 'linkedin'
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
    } = {}
  ): string {
    const cloudinaryId = this.extractCloudinaryId(photo)
    
    if (!cloudinaryId) {
      // Fallback to regular image
      return this.generateOptimizedImageSizes(photo).large
    }

    const { platform = 'facebook', position = 'bottom-right' } = options

    // Platform-specific dimensions
    const dimensions = {
      facebook: { width: 1200, height: 630 },
      twitter: { width: 1200, height: 675 },
      instagram: { width: 1080, height: 1080 },
      linkedin: { width: 1200, height: 627 }
    }

    const { width, height } = dimensions[platform]

    return getOptimizedImageUrl(cloudinaryId, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto',
      overlay: {
        text,
        position
      }
    })
  }

  /**
   * Generate gallery thumbnails with consistent styling
   */
  static generateGalleryThumbnails(
    photos: StudioPhoto[],
    options: {
      size?: number
      brightness?: number
      contrast?: number
      saturation?: number
      hoverEffect?: boolean
    } = {}
  ): Array<{
    photo: StudioPhoto
    thumbnail: string
    hover?: string
  }> {
    const { size = 300, brightness, contrast, saturation, hoverEffect = true } = options

    return photos.map(photo => {
      const cloudinaryId = this.extractCloudinaryId(photo)
      
      if (cloudinaryId) {
        const baseOptions: ImageOptions = {
          width: size,
          height: size,
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto',
          format: 'auto',
          brightness,
          contrast,
          saturation
        }

        const result: any = {
          photo,
          thumbnail: getOptimizedImageUrl(cloudinaryId, baseOptions)
        }

        if (hoverEffect) {
          result.hover = getOptimizedImageUrl(cloudinaryId, {
            ...baseOptions,
            brightness: (brightness || 0) + 10,
            contrast: (contrast || 0) + 5
          })
        }

        return result
      }

      // Fallback
      const sizes = this.generateOptimizedImageSizes(photo)
      return {
        photo,
        thumbnail: sizes.small,
        hover: hoverEffect ? sizes.medium : undefined
      }
    })
  }

  /**
   * Generate lazy loading configuration
   */
  static generateLazyLoadConfig(
    photo: StudioPhoto,
    options: {
      width?: number
      height?: number
      quality?: number
    } = {}
  ): {
    src: string
    placeholder: string
    srcset: string
    sizes: string
  } {
    const cloudinaryId = this.extractCloudinaryId(photo)
    const { width = 800, height = 600, quality = 80 } = options
    
    if (cloudinaryId) {
      const responsiveUrls = getResponsiveImageUrls(cloudinaryId, {
        quality: 'auto',
        format: 'auto',
        crop: 'fill'
      })

      return {
        src: responsiveUrls.desktop,
        placeholder: getOptimizedImageUrl(cloudinaryId, {
          width: 50,
          height: Math.round(50 * (height / width)),
          quality: 20,
          blur: 100,
          format: 'auto'
        }),
        srcset: this.generateOptimizedSrcSet(photo),
        sizes: '(max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px'
      }
    }

    // Fallback
    return {
      src: this.generateOptimizedImageSizes(photo).medium,
      placeholder: this.generateOptimizedImageSizes(photo).thumbnail,
      srcset: super.generateSrcSet(photo),
      sizes: '(max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px'
    }
  }

  /**
   * Generate performance-optimized image configuration for different use cases
   */
  static generatePerformanceConfig(
    photo: StudioPhoto,
    useCase: 'hero' | 'gallery' | 'thumbnail' | 'preview' | 'background'
  ): {
    preload?: boolean
    loading: 'eager' | 'lazy'
    fetchpriority?: 'high' | 'low' | 'auto'
    decoding: 'sync' | 'async' | 'auto'
    sizes: string
    quality: string
  } {
    const configs = {
      hero: {
        preload: true,
        loading: 'eager' as const,
        fetchpriority: 'high' as const,
        decoding: 'sync' as const,
        sizes: '100vw',
        quality: 'auto:best'
      },
      gallery: {
        loading: 'lazy' as const,
        fetchpriority: 'auto' as const,
        decoding: 'async' as const,
        sizes: '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
        quality: 'auto'
      },
      thumbnail: {
        loading: 'lazy' as const,
        fetchpriority: 'low' as const,
        decoding: 'async' as const,
        sizes: '150px',
        quality: 'auto:eco'
      },
      preview: {
        loading: 'lazy' as const,
        fetchpriority: 'auto' as const,
        decoding: 'async' as const,
        sizes: '(max-width: 768px) 100vw, 50vw',
        quality: 'auto'
      },
      background: {
        loading: 'eager' as const,
        fetchpriority: 'low' as const,
        decoding: 'async' as const,
        sizes: '100vw',
        quality: 'auto:eco'
      }
    }

    return configs[useCase]
  }

  /**
   * Batch process multiple photos for optimal delivery
   */
  static async processPhotosForGallery(
    photos: StudioPhoto[],
    options: {
      thumbnailSize?: number
      previewSize?: number
      brightness?: number
      contrast?: number
      saturation?: number
      enableHover?: boolean
    } = {}
  ): Promise<Array<{
    photo: StudioPhoto
    thumbnail: string
    preview: string
    hover?: string
    lazyConfig: ReturnType<typeof CloudinaryPhotoService.generateLazyLoadConfig>
  }>> {
    const { 
      thumbnailSize = 300, 
      previewSize = 800, 
      brightness, 
      contrast, 
      saturation, 
      enableHover = true 
    } = options

    return photos.map(photo => {
      const cloudinaryId = this.extractCloudinaryId(photo)
      
      if (cloudinaryId) {
        const baseOptions: ImageOptions = {
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto',
          format: 'auto',
          brightness,
          contrast,
          saturation
        }

        const result: any = {
          photo,
          thumbnail: getOptimizedImageUrl(cloudinaryId, {
            ...baseOptions,
            width: thumbnailSize,
            height: thumbnailSize
          }),
          preview: getOptimizedImageUrl(cloudinaryId, {
            ...baseOptions,
            width: previewSize,
            height: Math.round(previewSize * 0.75)
          }),
          lazyConfig: this.generateLazyLoadConfig(photo, {
            width: previewSize,
            height: Math.round(previewSize * 0.75)
          })
        }

        if (enableHover) {
          result.hover = getOptimizedImageUrl(cloudinaryId, {
            ...baseOptions,
            width: thumbnailSize,
            height: thumbnailSize,
            brightness: (brightness || 0) + 10,
            contrast: (contrast || 0) + 5
          })
        }

        return result
      }

      // Fallback for non-Cloudinary images
      const sizes = this.generateOptimizedImageSizes(photo)
      return {
        photo,
        thumbnail: sizes.small,
        preview: sizes.medium,
        hover: enableHover ? sizes.medium : undefined,
        lazyConfig: this.generateLazyLoadConfig(photo)
      }
    })
  }
}

export default CloudinaryPhotoService

// Export commonly used functions
export const {
  generateOptimizedImageSizes,
  generateOptimizedSrcSet,
  generateResponsiveUrls,
  generateHeroImage,
  generateSocialShareImage,
  generateGalleryThumbnails,
  generateLazyLoadConfig,
  generatePerformanceConfig,
  processPhotosForGallery
} = CloudinaryPhotoService