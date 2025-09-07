import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Component test for PhotoGallery component
// This test MUST FAIL initially (TDD RED phase)
describe('PhotoGallery Component', () => {
  const mockPhotos = [
    {
      title: 'Main yoga studio space',
      image: {
        _type: 'image',
        asset: {
          _ref: 'image-studio1-1920x1080-jpg',
          _type: 'reference'
        },
        hotspot: { x: 0.5, y: 0.4 },
        crop: { left: 0, top: 0, right: 0, bottom: 0 }
      },
      altText: 'Bright, spacious yoga studio with natural lighting and bamboo floors',
      category: 'studio-space',
      featured: true,
      sortOrder: 1,
      photographer: 'Jane Smith Photography',
      dateTaken: '2024-03-15'
    },
    {
      title: 'Yoga equipment storage',
      image: {
        _type: 'image',
        asset: {
          _ref: 'image-equipment1-800x600-jpg',
          _type: 'reference'
        }
      },
      altText: 'Well-organized yoga props including blocks, straps, and bolsters',
      category: 'equipment',
      featured: false,
      sortOrder: 2
    },
    {
      title: 'Morning vinyasa class',
      image: {
        _type: 'image',
        asset: {
          _ref: 'image-class1-1600x900-jpg',
          _type: 'reference'
        }
      },
      altText: 'Students practicing sun salutations in a morning vinyasa class',
      category: 'classes-in-session',
      featured: true,
      sortOrder: 3
    }
  ]

  const mockFilteredPhotos = mockPhotos.filter(photo => photo.category === 'studio-space')

  let PhotoGalleryComponent: any

  beforeEach(async () => {
    // This will fail until we implement the PhotoGallery component
    const { default: PhotoGallery } = await import('../../src/components/PhotoGallery.astro')
    PhotoGalleryComponent = PhotoGallery
  })

  it('should render all provided photos', () => {
    const container = render(PhotoGalleryComponent, { props: { photos: mockPhotos } })
    
    const gallery = container.getByTestId('photo-gallery')
    expect(gallery).toBeInTheDocument()
    
    const photoItems = container.getAllByTestId('photo-item')
    expect(photoItems).toHaveLength(3)
  })

  it('should display photos with proper image optimization', () => {
    const container = render(PhotoGalleryComponent, { props: { photos: mockPhotos } })
    
    const images = container.getAllByRole('img')
    expect(images).toHaveLength(3)
    
    images.forEach((img, index) => {
      // Should have proper alt text
      expect(img).toHaveAttribute('alt', mockPhotos[index].altText)
      
      // Should use lazy loading for performance
      expect(img).toHaveAttribute('loading', 'lazy')
      
      // Should have proper dimensions
      expect(img).toHaveAttribute('width')
      expect(img).toHaveAttribute('height')
      
      // Should use optimized image service
      const src = img.getAttribute('src')
      expect(src).toMatch(/cloudinary|sanity|optimized/i)
    })
  })

  it('should group photos by category when requested', () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, groupByCategory: true } 
    })
    
    const categories = ['studio-space', 'equipment', 'classes-in-session']
    
    categories.forEach(category => {
      const categorySection = container.queryByTestId(`category-${category}`)
      if (categorySection) {
        expect(categorySection).toBeInTheDocument()
        
        const categoryPhotos = categorySection.querySelectorAll('[data-testid="photo-item"]')
        const expectedCount = mockPhotos.filter(photo => photo.category === category).length
        expect(categoryPhotos).toHaveLength(expectedCount)
      }
    })
  })

  it('should provide category filter functionality', () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, showFilters: true } 
    })
    
    const filterButtons = container.getAllByTestId(/filter-/)
    expect(filterButtons.length).toBeGreaterThan(0)
    
    // Should have "All" filter
    const allFilter = container.getByTestId('filter-all')
    expect(allFilter).toBeInTheDocument()
    expect(allFilter).toHaveTextContent(/all|show all/i)
    
    // Should have category-specific filters
    const studioFilter = container.getByTestId('filter-studio-space')
    expect(studioFilter).toHaveTextContent(/studio.*space/i)
    
    const equipmentFilter = container.getByTestId('filter-equipment')
    expect(equipmentFilter).toHaveTextContent(/equipment/i)
  })

  it('should filter photos when category filter is clicked', async () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, showFilters: true } 
    })
    
    const studioFilter = container.getByTestId('filter-studio-space')
    fireEvent.click(studioFilter)
    
    await waitFor(() => {
      const visiblePhotos = container.getAllByTestId('photo-item')
      .filter(item => !item.hasAttribute('hidden') && 
              getComputedStyle(item).display !== 'none')
      
      const expectedCount = mockPhotos.filter(photo => photo.category === 'studio-space').length
      expect(visiblePhotos).toHaveLength(expectedCount)
    })
    
    // Active filter should be highlighted
    expect(studioFilter).toHaveClass(/active|selected/)
  })

  it('should handle photo click events for lightbox', async () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, enableLightbox: true } 
    })
    
    const firstPhoto = container.getAllByTestId('photo-item')[0]
    fireEvent.click(firstPhoto)
    
    await waitFor(() => {
      const lightbox = document.querySelector('[data-testid="photo-lightbox"]')
      expect(lightbox).toBeInTheDocument()
      
      const lightboxImage = lightbox?.querySelector('img')
      expect(lightboxImage).toBeInTheDocument()
      
      // Should show the correct image
      expect(lightboxImage).toHaveAttribute('alt', mockPhotos[0].altText)
      
      // Should have close button
      const closeButton = lightbox?.querySelector('[data-testid="close-lightbox"]')
      expect(closeButton).toBeInTheDocument()
    })
  })

  it('should navigate between photos in lightbox', async () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, enableLightbox: true } 
    })
    
    // Open lightbox with first photo
    const firstPhoto = container.getAllByTestId('photo-item')[0]
    fireEvent.click(firstPhoto)
    
    await waitFor(() => {
      const lightbox = document.querySelector('[data-testid="photo-lightbox"]')
      expect(lightbox).toBeInTheDocument()
    })
    
    const lightbox = document.querySelector('[data-testid="photo-lightbox"]')
    const nextButton = lightbox?.querySelector('[data-testid="next-photo"]')
    const prevButton = lightbox?.querySelector('[data-testid="prev-photo"]')
    
    if (nextButton) {
      fireEvent.click(nextButton)
      
      await waitFor(() => {
        const lightboxImage = lightbox?.querySelector('img')
        expect(lightboxImage).toHaveAttribute('alt', mockPhotos[1].altText)
      })
    }
  })

  it('should support keyboard navigation in lightbox', async () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, enableLightbox: true } 
    })
    
    // Open lightbox
    const firstPhoto = container.getAllByTestId('photo-item')[0]
    fireEvent.click(firstPhoto)
    
    await waitFor(() => {
      const lightbox = document.querySelector('[data-testid="photo-lightbox"]')
      expect(lightbox).toBeInTheDocument()
    })
    
    const lightbox = document.querySelector('[data-testid="photo-lightbox"]')
    
    // Test arrow key navigation
    fireEvent.keyDown(lightbox!, { key: 'ArrowRight' })
    
    await waitFor(() => {
      const lightboxImage = lightbox?.querySelector('img')
      expect(lightboxImage).toHaveAttribute('alt', mockPhotos[1].altText)
    })
    
    // Test escape key to close
    fireEvent.keyDown(lightbox!, { key: 'Escape' })
    
    await waitFor(() => {
      expect(lightbox).not.toBeInTheDocument()
    })
  })

  it('should display photo metadata when requested', () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, showMetadata: true } 
    })
    
    const photoItems = container.getAllByTestId('photo-item')
    
    photoItems.forEach((item, index) => {
      const photo = mockPhotos[index]
      
      // Should show title
      const title = item.querySelector('[data-testid="photo-title"]')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent(photo.title)
      
      // Should show photographer when available
      if (photo.photographer) {
        const photographer = item.querySelector('[data-testid="photo-photographer"]')
        expect(photographer).toBeInTheDocument()
        expect(photographer).toHaveTextContent(photo.photographer)
      }
      
      // Should show date when available
      if (photo.dateTaken) {
        const date = item.querySelector('[data-testid="photo-date"]')
        expect(date).toBeInTheDocument()
      }
    })
  })

  it('should highlight featured photos when requested', () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, highlightFeatured: true } 
    })
    
    const photoItems = container.getAllByTestId('photo-item')
    
    photoItems.forEach((item, index) => {
      const photo = mockPhotos[index]
      
      if (photo.featured) {
        expect(item).toHaveClass(/featured|highlight/)
        
        const featuredBadge = item.querySelector('[data-testid="featured-badge"]')
        expect(featuredBadge).toBeInTheDocument()
      }
    })
  })

  it('should handle different layout options', () => {
    // Grid layout
    const gridContainer = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, layout: 'grid' } 
    })
    
    const gridGallery = gridContainer.getByTestId('photo-gallery')
    expect(gridGallery).toHaveClass(/grid/)
    
    // Masonry layout
    const masonryContainer = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, layout: 'masonry' } 
    })
    
    const masonryGallery = masonryContainer.getByTestId('photo-gallery')
    expect(masonryGallery).toHaveClass(/masonry/)
  })

  it('should be accessible with proper ARIA attributes', () => {
    const container = render(PhotoGalleryComponent, { props: { photos: mockPhotos } })
    
    const gallery = container.getByTestId('photo-gallery')
    expect(gallery).toHaveAttribute('role', 'region')
    expect(gallery).toHaveAttribute('aria-label', expect.stringMatching(/gallery|photos/i))
    
    const photoItems = container.getAllByTestId('photo-item')
    photoItems.forEach((item, index) => {
      // Should have proper role
      expect(item).toHaveAttribute('role', 'img')
      
      // Should have descriptive aria-label
      expect(item).toHaveAttribute('aria-label')
      const ariaLabel = item.getAttribute('aria-label')
      expect(ariaLabel).toContain(mockPhotos[index].title)
    })
  })

  it('should support infinite scroll or pagination', async () => {
    const manyPhotos = Array(20).fill(null).map((_, i) => ({
      ...mockPhotos[0],
      title: `Photo ${i + 1}`,
      image: { ...mockPhotos[0].image, asset: { ...mockPhotos[0].image.asset, _ref: `image-${i}` }}
    }))
    
    const container = render(PhotoGalleryComponent, { 
      props: { photos: manyPhotos, enablePagination: true, itemsPerPage: 6 } 
    })
    
    const initialPhotos = container.getAllByTestId('photo-item')
    expect(initialPhotos).toHaveLength(6)
    
    const loadMoreButton = container.queryByTestId('load-more')
    const pagination = container.queryByTestId('pagination')
    
    // Should have either load more or pagination
    expect(loadMoreButton || pagination).toBeTruthy()
    
    if (loadMoreButton) {
      fireEvent.click(loadMoreButton)
      
      await waitFor(() => {
        const updatedPhotos = container.getAllByTestId('photo-item')
        expect(updatedPhotos.length).toBeGreaterThan(6)
      })
    }
  })

  it('should handle image loading errors gracefully', async () => {
    const container = render(PhotoGalleryComponent, { props: { photos: mockPhotos } })
    
    const images = container.getAllByRole('img')
    const firstImage = images[0]
    
    // Simulate image load error
    fireEvent.error(firstImage)
    
    await waitFor(() => {
      const photoItem = firstImage.closest('[data-testid="photo-item"]')
      const errorState = photoItem?.querySelector('[data-testid="image-error"]')
      const placeholder = photoItem?.querySelector('[data-testid="image-placeholder"]')
      
      expect(errorState || placeholder).toBeTruthy()
    })
  })

  it('should be responsive with proper mobile layout', () => {
    const container = render(PhotoGalleryComponent, { props: { photos: mockPhotos } })
    
    const gallery = container.getByTestId('photo-gallery')
    expect(gallery).toHaveClass(/responsive|mobile/)
    
    // Photos should be responsive
    const photoItems = container.getAllByTestId('photo-item')
    photoItems.forEach(item => {
      expect(item).toHaveClass(/responsive|fluid/)
    })
  })

  it('should handle empty photo array gracefully', () => {
    const container = render(PhotoGalleryComponent, { props: { photos: [] } })
    
    const emptyState = container.getByTestId('empty-gallery')
    expect(emptyState).toBeInTheDocument()
    expect(emptyState).toHaveTextContent(/no photos|empty gallery|coming soon/i)
  })

  it('should support custom CSS classes and theming', () => {
    const container = render(PhotoGalleryComponent, { 
      props: { 
        photos: mockPhotos, 
        className: 'custom-gallery',
        theme: 'dark',
        columns: 4
      } 
    })
    
    const gallery = container.getByTestId('photo-gallery')
    expect(gallery).toHaveClass('custom-gallery')
    expect(gallery).toHaveClass('dark')
    expect(gallery).toHaveClass(/col-4|columns-4/)
  })

  it('should handle sorting options', () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, sortBy: 'sortOrder', sortOrder: 'asc' } 
    })
    
    const photoItems = container.getAllByTestId('photo-item')
    
    // Should be sorted by sortOrder ascending
    const firstPhotoTitle = photoItems[0].querySelector('[data-testid="photo-title"]')?.textContent
    expect(firstPhotoTitle).toBe('Main yoga studio space') // sortOrder: 1
  })

  it('should support social sharing when enabled', () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, enableSharing: true } 
    })
    
    const photoItems = container.getAllByTestId('photo-item')
    
    photoItems.forEach(item => {
      const shareButton = item.querySelector('[data-testid="share-photo"]')
      if (shareButton) {
        expect(shareButton).toBeInTheDocument()
        expect(shareButton).toHaveAttribute('aria-label', expect.stringMatching(/share/i))
      }
    })
  })

  it('should handle photo loading states', () => {
    const container = render(PhotoGalleryComponent, { 
      props: { photos: mockPhotos, loading: true } 
    })
    
    const gallery = container.getByTestId('photo-gallery')
    expect(gallery).toHaveClass(/loading|skeleton/)
    
    // Should show loading placeholders
    const placeholders = container.getAllByTestId('photo-placeholder')
    expect(placeholders.length).toBeGreaterThan(0)
  })
})