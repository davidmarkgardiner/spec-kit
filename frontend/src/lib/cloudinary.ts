// Cloudinary integration utilities
import { Cloudinary } from '@cloudinary/url-gen'

// Initialize Cloudinary instance
// Note: Cloud name should come from environment variables
const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'
  }
})

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - The public ID of the image in Cloudinary
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string
    format?: string
  } = {}
): string {
  const image = cld.image(publicId)
  
  if (options.width) {
    image.resize(`w_${options.width}`)
  }
  
  if (options.height) {
    image.resize(`h_${options.height}`)
  }
  
  if (options.quality) {
    image.quality(options.quality)
  }
  
  if (options.format) {
    image.format(options.format)
  } else {
    image.format('auto') // Automatic format selection
  }
  
  return image.toURL()
}

/**
 * Generate responsive image URLs for different screen sizes
 * @param publicId - The public ID of the image in Cloudinary
 * @returns Object with URLs for different breakpoints
 */
export function getResponsiveImageUrls(publicId: string) {
  return {
    mobile: getOptimizedImageUrl(publicId, { width: 640, quality: '80' }),
    tablet: getOptimizedImageUrl(publicId, { width: 768, quality: '80' }),
    desktop: getOptimizedImageUrl(publicId, { width: 1024, quality: '85' }),
    large: getOptimizedImageUrl(publicId, { width: 1920, quality: '85' }),
  }
}

export default cld