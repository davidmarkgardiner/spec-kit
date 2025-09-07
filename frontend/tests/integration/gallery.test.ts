import { describe, it, expect, beforeEach } from 'vitest'
import { getByRole, getAllByTestId, fireEvent, waitFor } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Integration test for photo gallery - based on user stories from quickstart.md
// This test MUST FAIL initially (TDD RED phase)
describe('Photo Gallery Integration', () => {
  let galleryPageElement: HTMLElement

  beforeEach(async () => {
    // This will fail until we implement the gallery page
    const { renderGalleryPage } = await import('../../src/pages/gallery.astro')
    galleryPageElement = await renderGalleryPage()
  })

  it('should display high-quality images of studio spaces', async () => {
    // Based on user story: someone wants to see the facility
    const studioPhotos = getAllByTestId(galleryPageElement, 'studio-photo')
    expect(studioPhotos.length).toBeGreaterThan(0)

    studioPhotos.forEach((photo) => {
      const img = photo.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt')
      expect(img?.getAttribute('alt')?.length).toBeGreaterThan(0)
      
      // Should have proper dimensions for high quality
      expect(img).toHaveAttribute('width')
      expect(img).toHaveAttribute('height')
      
      const width = parseInt(img?.getAttribute('width') || '0')
      expect(width).toBeGreaterThanOrEqual(600) // Minimum quality threshold
    })
  })

  it('should load images quickly and display properly', async () => {
    // Based on acceptance criteria: photos load quickly
    const images = galleryPageElement.querySelectorAll('img')
    
    images.forEach((img) => {
      // Should use lazy loading for performance
      expect(img).toHaveAttribute('loading', 'lazy')
      
      // Should use optimized image service
      const src = img.getAttribute('src')
      expect(src).toMatch(/cloudinary|sanity|optimized/i)
    })
  })

  it('should be optimized for mobile viewing', async () => {
    // Based on acceptance criteria: images optimized for mobile
    const images = galleryPageElement.querySelectorAll('img')
    
    images.forEach((img) => {
      // Should have responsive attributes
      expect(img).toHaveAttribute('srcset') // For different screen sizes
      
      // Should use CSS classes for responsive behavior
      expect(img).toHaveClass(/responsive|fluid|mobile/i)
    })
  })

  it('should organize photos by category', async () => {
    // Based on contract: photos have categories
    const categories = ['studio-space', 'equipment', 'classes-in-session', 'exterior']
    
    categories.forEach((category) => {
      const categorySection = galleryPageElement.querySelector(`[data-category="${category}"]`)
      if (categorySection) {
        const categoryPhotos = categorySection.querySelectorAll('[data-testid="studio-photo"]')
        expect(categoryPhotos.length).toBeGreaterThan(0)
      }
    })
  })

  it('should provide category filter functionality', async () => {
    // Enhanced UX: filter photos by category
    const filterButtons = galleryPageElement.querySelectorAll('[data-testid="category-filter"]')
    
    if (filterButtons.length > 0) {
      expect(filterButtons.length).toBeGreaterThanOrEqual(4) // At least main categories
      
      filterButtons.forEach((button) => {
        expect(button).toHaveTextContent(/studio|equipment|classes|exterior|all/i)
      })
      
      // Test filter functionality
      const studioFilter = Array.from(filterButtons).find(btn => 
        btn.textContent?.toLowerCase().includes('studio')
      )
      
      if (studioFilter) {
        fireEvent.click(studioFilter)
        
        const visiblePhotos = galleryPageElement.querySelectorAll('[data-testid="studio-photo"]:not([style*="display: none"])')
        visiblePhotos.forEach((photo) => {
          expect(photo).toHaveAttribute('data-category', 'studio-space')
        })
      }
    }
  })

  it('should load photo data from CMS', async () => {
    // Integration with photo service
    const { getPhotos } = await import('../../src/services/photoService')
    
    const photos = await getPhotos()
    expect(photos.length).toBeGreaterThan(0)
    
    // Gallery should display the CMS data
    photos.forEach((photo) => {
      if (photo.title) {
        expect(galleryPageElement).toHaveTextContent(photo.title)
      }
    })
  })

  it('should implement lightbox or modal functionality', async () => {
    // Enhanced UX: full-size image viewing
    const photos = getAllByTestId(galleryPageElement, 'studio-photo')
    
    if (photos.length > 0) {
      const firstPhoto = photos[0]
      fireEvent.click(firstPhoto)
      
      await waitFor(() => {
        const lightbox = document.querySelector('[data-testid="photo-lightbox"]')
        expect(lightbox).toBeInTheDocument()
        
        const lightboxImage = lightbox?.querySelector('img')
        expect(lightboxImage).toBeInTheDocument()
        
        // Should have close functionality
        const closeButton = lightbox?.querySelector('[data-testid="close-lightbox"]')
        expect(closeButton).toBeInTheDocument()
      })
    }
  })

  it('should support keyboard navigation in lightbox', async () => {
    // Accessibility requirement
    const photos = getAllByTestId(galleryPageElement, 'studio-photo')
    
    if (photos.length > 1) {
      // Open lightbox
      fireEvent.click(photos[0])
      
      await waitFor(() => {
        const lightbox = document.querySelector('[data-testid="photo-lightbox"]')
        expect(lightbox).toBeInTheDocument()
      })
      
      const lightbox = document.querySelector('[data-testid="photo-lightbox"]')
      
      // Test arrow key navigation
      fireEvent.keyDown(lightbox!, { key: 'ArrowRight' })
      
      await waitFor(() => {
        // Should navigate to next image
        const currentImage = lightbox?.querySelector('img')
        expect(currentImage).toBeInTheDocument()
      })
      
      // Test escape key to close
      fireEvent.keyDown(lightbox!, { key: 'Escape' })
      
      await waitFor(() => {
        expect(lightbox).not.toBeInTheDocument()
      })
    }
  })

  it('should display photo captions and metadata', async () => {
    // Based on contract: photos have titles and alt text
    const photos = getAllByTestId(galleryPageElement, 'studio-photo')
    
    photos.forEach((photo) => {
      const caption = photo.querySelector('[data-testid="photo-caption"]')
      const title = photo.querySelector('[data-testid="photo-title"]')
      
      // Should have either caption or title
      expect(caption || title).toBeTruthy()
      
      if (caption) {
        expect(caption.textContent?.length).toBeGreaterThan(0)
      }
      
      if (title) {
        expect(title.textContent?.length).toBeGreaterThan(0)
      }
    })
  })

  it('should handle featured photos prominently', async () => {
    // Based on contract: photos can be featured
    const { getFeaturedPhotos } = await import('../../src/services/photoService')
    
    const featuredPhotos = await getFeaturedPhotos()
    
    if (featuredPhotos.length > 0) {
      const featuredSection = galleryPageElement.querySelector('[data-testid="featured-photos"]')
      expect(featuredSection).toBeInTheDocument()
      
      const featuredImages = featuredSection?.querySelectorAll('[data-testid="featured-photo"]')
      expect(featuredImages?.length).toBeGreaterThan(0)
      expect(featuredImages?.length).toBeLessThanOrEqual(6) // Per contract limit
    }
  })

  it('should implement infinite scroll or pagination', async () => {
    // Performance: handle large photo collections
    const loadMoreButton = galleryPageElement.querySelector('[data-testid="load-more"]')
    const pagination = galleryPageElement.querySelector('[data-testid="pagination"]')
    
    // Should have either load more or pagination
    if (loadMoreButton || pagination) {
      if (loadMoreButton) {
        const initialPhotoCount = getAllByTestId(galleryPageElement, 'studio-photo').length
        
        fireEvent.click(loadMoreButton)
        
        await waitFor(() => {
          const newPhotoCount = getAllByTestId(galleryPageElement, 'studio-photo').length
          expect(newPhotoCount).toBeGreaterThan(initialPhotoCount)
        })
      }
      
      if (pagination) {
        const pageButtons = pagination.querySelectorAll('button, a')
        expect(pageButtons.length).toBeGreaterThan(1)
        
        pageButtons.forEach((button) => {
          expect(button).toHaveTextContent(/\d+|next|prev|first|last/i)
        })
      }
    }
  })

  it('should have proper SEO structure', async () => {
    // SEO requirement for image gallery
    const galleryTitle = galleryPageElement.querySelector('h1')
    expect(galleryTitle).toBeInTheDocument()
    expect(galleryTitle).toHaveTextContent(/gallery|photos|studio|facility/i)
    
    // Images should have descriptive alt text
    const images = galleryPageElement.querySelectorAll('img')
    images.forEach((img) => {
      const alt = img.getAttribute('alt')
      expect(alt?.length).toBeGreaterThan(5) // Descriptive, not just "image"
      expect(alt).not.toMatch(/^(image|photo|picture)$/i) // Not generic
    })
  })

  it('should support social sharing', async () => {
    // Enhanced feature: social media sharing
    const shareButtons = galleryPageElement.querySelectorAll('[data-testid="share-button"]')
    
    if (shareButtons.length > 0) {
      shareButtons.forEach((button) => {
        expect(button).toHaveAttribute('href')
        const href = button.getAttribute('href')
        expect(href).toMatch(/facebook|twitter|instagram|pinterest|mailto/i)
      })
    }
  })

  it('should handle image loading errors gracefully', async () => {
    // Error handling requirement
    const images = galleryPageElement.querySelectorAll('img')
    
    if (images.length > 0) {
      const firstImage = images[0]
      
      // Simulate image load error
      fireEvent.error(firstImage)
      
      await waitFor(() => {
        // Should show placeholder or error state
        const errorState = firstImage.parentElement?.querySelector('[data-testid="image-error"]')
        const placeholder = firstImage.parentElement?.querySelector('[data-testid="image-placeholder"]')
        
        expect(errorState || placeholder).toBeTruthy()
      })
    }
  })

  it('should be accessible with proper ARIA labels', async () => {
    // Accessibility requirement
    const gallery = galleryPageElement.querySelector('[role="img"], [data-testid="photo-gallery"]')
    expect(gallery).toBeInTheDocument()
    
    // Should have proper heading structure
    const heading = galleryPageElement.querySelector('h1')
    expect(heading).toBeInTheDocument()
    
    // Images should be in a proper landmark
    const main = galleryPageElement.querySelector('main')
    expect(main).toBeInTheDocument()
    
    const images = galleryPageElement.querySelectorAll('img')
    images.forEach((img, index) => {
      // Each image should have descriptive alt text
      const alt = img.getAttribute('alt')
      expect(alt).toBeTruthy()
      expect(alt?.length).toBeGreaterThan(0)
      
      // Should be focusable if clickable
      if (img.closest('button, a')) {
        expect(img.closest('button, a')).toHaveAttribute('tabindex')
      }
    })
  })

  it('should implement progressive loading for performance', async () => {
    // Performance optimization
    const images = galleryPageElement.querySelectorAll('img')
    
    images.forEach((img) => {
      // Should use loading="lazy" for off-screen images
      const loading = img.getAttribute('loading')
      if (loading) {
        expect(loading).toBe('lazy')
      }
      
      // Should use low-quality placeholder
      const src = img.getAttribute('src')
      if (src?.includes('placeholder') || src?.includes('blur')) {
        expect(img).toHaveAttribute('data-src') // Real image URL
      }
    })
  })
})