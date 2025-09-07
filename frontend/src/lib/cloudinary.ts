// Cloudinary integration utilities
import { Cloudinary } from '@cloudinary/url-gen'
import { auto, fill } from '@cloudinary/url-gen/actions/resize'
import { quality, format } from '@cloudinary/url-gen/actions/delivery'

// Initialize Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgkk4uhse'
  }
})

// Export for direct use
export { cld }

/**
 * Image transformation options
 */
export interface ImageOptions {
  width?: number
  height?: number
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
  blur?: number
  brightness?: number
  contrast?: number
  saturation?: number
  overlay?: {
    text?: string
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  }
}

/**
 * Get optimized image URL from Cloudinary with advanced transformations
 * @param publicId - The public ID of the image in Cloudinary
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: ImageOptions = {}
): string {
  const image = cld.image(publicId)
  
  // Apply resizing
  if (options.width && options.height) {
    if (options.crop === 'fill') {
      image.resize(fill().width(options.width).height(options.height))
    } else {
      image.resize(auto().width(options.width).height(options.height))
    }
  } else if (options.width) {
    image.resize(auto().width(options.width))
  } else if (options.height) {
    image.resize(auto().height(options.height))
  }
  
  // Apply quality optimization
  if (options.quality) {
    if (typeof options.quality === 'string') {
      image.delivery(quality('auto'))
    } else {
      image.delivery(quality(options.quality))
    }
  } else {
    image.delivery(quality('auto')) // Default to auto quality
  }
  
  // Apply format optimization
  if (options.format) {
    image.delivery(format(options.format))
  } else {
    image.delivery(format('auto')) // Automatic format selection
  }
  
  // Apply effects using URL parameters (simpler approach)
  const params = []
  if (options.blur) params.push(`e_blur:${options.blur}`)
  if (options.brightness) params.push(`e_brightness:${options.brightness}`)
  if (options.contrast) params.push(`e_contrast:${options.contrast}`)
  if (options.saturation) params.push(`e_saturation:${options.saturation}`)
  
  let url = image.toURL()
  
  // Add effects as URL parameters if any
  if (params.length > 0) {
    const separator = url.includes('/upload/') ? '/' : ','
    url = url.replace('/upload/', `/upload/${params.join(',')}${separator}`)
  }
  
  // Add text overlay if specified
  if (options.overlay?.text) {
    const overlayText = options.overlay.text.replace(/\s+/g, '%20')
    const position = options.overlay.position || 'center'
    const positionMap = {
      'top-left': 'g_north_west',
      'top-right': 'g_north_east', 
      'bottom-left': 'g_south_west',
      'bottom-right': 'g_south_east',
      'center': 'g_center'
    }
    const overlayParam = `l_text:Arial_40:${overlayText},${positionMap[position]}`
    url = url.replace('/upload/', `/upload/${overlayParam}/`)
  }
  
  return url
}

/**
 * Generate responsive image URLs for different screen sizes
 * @param publicId - The public ID of the image in Cloudinary
 * @param options - Base transformation options to apply to all sizes
 * @returns Object with URLs for different breakpoints
 */
export function getResponsiveImageUrls(publicId: string, options: Omit<ImageOptions, 'width'> = {}) {
  return {
    mobile: getOptimizedImageUrl(publicId, { ...options, width: 640 }),
    tablet: getOptimizedImageUrl(publicId, { ...options, width: 768 }),
    desktop: getOptimizedImageUrl(publicId, { ...options, width: 1024 }),
    large: getOptimizedImageUrl(publicId, { ...options, width: 1920 }),
    xlarge: getOptimizedImageUrl(publicId, { ...options, width: 2560 }),
  }
}

/**
 * Generate a thumbnail URL with consistent sizing
 * @param publicId - The public ID of the image in Cloudinary
 * @param size - Thumbnail size (defaults to 150x150)
 * @returns Thumbnail URL
 */
export function getThumbnailUrl(
  publicId: string, 
  size: number = 150,
  options: Omit<ImageOptions, 'width' | 'height'> = {}
): string {
  return getOptimizedImageUrl(publicId, {
    ...options,
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'auto'
  })
}

/**
 * Generate a placeholder/loading image URL
 * @param width - Image width
 * @param height - Image height
 * @param text - Optional text to display
 * @returns Placeholder image URL
 */
export function getPlaceholderUrl(
  width: number = 800,
  height: number = 600,
  text?: string
): string {
  // Using a sample placeholder from Cloudinary
  const placeholderText = text || `${width}x${height}`
  return getOptimizedImageUrl('sample', {
    width,
    height,
    crop: 'fill',
    quality: 'auto:eco',
    overlay: {
      text: placeholderText,
      position: 'center'
    }
  })
}

/**
 * Upload configuration for different content types
 */
export const uploadPresets = {
  gallery: 'yoga_gallery',
  instructor: 'yoga_instructor',
  general: 'yoga_general'
} as const

/**
 * Transform video URLs (if using Cloudinary for videos)
 * @param publicId - The public ID of the video in Cloudinary
 * @param options - Video transformation options
 * @returns Optimized video URL
 */
export function getOptimizedVideoUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco'
    format?: 'auto' | 'mp4' | 'webm'
  } = {}
): string {
  const video = cld.video(publicId)
  
  if (options.width) {
    video.resize(auto().width(options.width))
  }
  
  if (options.quality) {
    video.delivery(quality(options.quality))
  } else {
    video.delivery(quality('auto'))
  }
  
  if (options.format) {
    video.delivery(format(options.format))
  } else {
    video.delivery(format('auto'))
  }
  
  return video.toURL()
}

export default cld