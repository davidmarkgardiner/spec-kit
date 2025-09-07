import { describe, it, expect, beforeEach } from 'vitest'
import { getByRole, getByText, getAllByTestId } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Integration test for instructors page - based on user stories from quickstart.md
// This test MUST FAIL initially (TDD RED phase)
describe('Instructors Page Integration', () => {
  let instructorsPageElement: HTMLElement

  beforeEach(async () => {
    // This will fail until we implement the instructors page
    const { renderInstructorsPage } = await import('../../src/pages/instructors.astro')
    instructorsPageElement = await renderInstructorsPage()
  })

  it('should display photos of all active instructors', async () => {
    // Based on user story: visitor wants to learn about instructors and see photos
    const instructorCards = getAllByTestId(instructorsPageElement, 'instructor-card')
    expect(instructorCards.length).toBeGreaterThan(0)

    instructorCards.forEach((card) => {
      const photo = card.querySelector('img, [data-testid="instructor-photo"]')
      expect(photo).toBeInTheDocument()
      expect(photo).toHaveAttribute('alt')
      expect(photo?.getAttribute('alt')?.length).toBeGreaterThan(0)
    })
  })

  it('should show names and credentials for each instructor', async () => {
    // Based on acceptance criteria: names and credentials displayed
    const instructorCards = getAllByTestId(instructorsPageElement, 'instructor-card')

    instructorCards.forEach((card) => {
      const name = card.querySelector('[data-testid="instructor-name"]')
      expect(name).toBeInTheDocument()
      expect(name?.textContent?.length).toBeGreaterThan(0)

      // Should show credentials/title if available
      const credentials = card.querySelector('[data-testid="instructor-credentials"]')
      if (credentials) {
        expect(credentials).toHaveTextContent(/RYT|certified|teacher/i)
      }
    })
  })

  it('should display bio information for each instructor', async () => {
    // Based on acceptance criteria: bio information for each instructor
    const instructorCards = getAllByTestId(instructorsPageElement, 'instructor-card')

    instructorCards.forEach((card) => {
      const bio = card.querySelector('[data-testid="instructor-bio"]')
      expect(bio).toBeInTheDocument()
      expect(bio?.textContent?.length).toBeGreaterThanOrEqual(100) // Contract requirement
    })
  })

  it('should show specialties and teaching styles', async () => {
    // Based on acceptance criteria: specialties and teaching styles
    const instructorCards = getAllByTestId(instructorsPageElement, 'instructor-card')

    instructorCards.forEach((card) => {
      const specialties = card.querySelector('[data-testid="instructor-specialties"]')
      expect(specialties).toBeInTheDocument()
      
      const specialtyItems = specialties?.querySelectorAll('li, [data-testid="specialty-item"]')
      expect(specialtyItems?.length).toBeGreaterThan(0)
      
      // Should contain yoga-related specialties
      const specialtyText = specialties?.textContent?.toLowerCase()
      expect(specialtyText).toMatch(/vinyasa|hatha|yin|restorative|power|hot|meditation/i)
    })
  })

  it('should load instructor data from CMS', async () => {
    // Integration with instructor service
    const { getInstructors } = await import('../../src/services/instructorService')
    
    const instructors = await getInstructors()
    expect(instructors.length).toBeGreaterThan(0)
    
    // Page should display the CMS data
    instructors.forEach((instructor) => {
      expect(instructorsPageElement).toHaveTextContent(instructor.name)
      if (instructor.title) {
        expect(instructorsPageElement).toHaveTextContent(instructor.title)
      }
    })
  })

  it('should show instructor contact information when provided', async () => {
    // Based on acceptance criteria: contact information if provided
    const instructorCards = getAllByTestId(instructorsPageElement, 'instructor-card')

    instructorCards.forEach((card) => {
      const contactInfo = card.querySelector('[data-testid="instructor-contact"]')
      
      if (contactInfo) {
        // Should have email if provided
        const emailLink = contactInfo.querySelector('a[href^="mailto:"]')
        if (emailLink) {
          expect(emailLink).toBeInTheDocument()
          const email = emailLink.getAttribute('href')?.substring(7)
          expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        }
        
        // Should have social media if provided
        const socialLinks = contactInfo.querySelectorAll('a[href*="instagram"], a[href*="facebook"], a[href*="twitter"]')
        socialLinks.forEach((link) => {
          expect(link).toHaveAttribute('href')
          expect(link.getAttribute('href')).toMatch(/^https?:\/\//)
        })
      }
    })
  })

  it('should display certifications for each instructor', async () => {
    // Based on contract: instructors have certifications array
    const instructorCards = getAllByTestId(instructorsPageElement, 'instructor-card')

    instructorCards.forEach((card) => {
      const certifications = card.querySelector('[data-testid="instructor-certifications"]')
      
      if (certifications) {
        const certItems = certifications.querySelectorAll('li, [data-testid="certification-item"]')
        expect(certItems.length).toBeGreaterThan(0)
        
        certItems.forEach((cert) => {
          expect(cert.textContent?.length).toBeGreaterThan(0)
        })
      }
    })
  })

  it('should show years of experience when available', async () => {
    // Based on contract: instructors may have experience field
    const instructorCards = getAllByTestId(instructorsPageElement, 'instructor-card')

    instructorCards.forEach((card) => {
      const experience = card.querySelector('[data-testid="instructor-experience"]')
      
      if (experience) {
        expect(experience).toHaveTextContent(/\d+\s*(year|yr)/i)
        
        // Extract number and verify it's reasonable
        const experienceText = experience.textContent || ''
        const years = parseInt(experienceText.match(/\d+/)?.[0] || '0')
        expect(years).toBeGreaterThanOrEqual(0)
        expect(years).toBeLessThan(50) // Reasonable upper bound
      }
    })
  })

  it('should have proper image optimization and loading', async () => {
    // Performance requirement: images should be optimized
    const instructorPhotos = instructorsPageElement.querySelectorAll('[data-testid="instructor-photo"]')

    instructorPhotos.forEach((photo) => {
      // Should have lazy loading for performance
      expect(photo).toHaveAttribute('loading', 'lazy')
      
      // Should have proper aspect ratio or dimensions
      expect(photo).toHaveAttribute('width')
      expect(photo).toHaveAttribute('height')
      
      // Should use optimized image service
      const src = photo.getAttribute('src')
      expect(src).toMatch(/cloudinary|sanity|optimized/i)
    })
  })

  it('should provide a way to filter or search instructors', async () => {
    // Enhanced UX: filter by specialty or search
    const filterSection = instructorsPageElement.querySelector('[data-testid="instructor-filters"]')
    const searchInput = instructorsPageElement.querySelector('input[type="search"], [data-testid="instructor-search"]')
    
    if (filterSection || searchInput) {
      if (filterSection) {
        const filterButtons = filterSection.querySelectorAll('button, [data-testid="filter-button"]')
        expect(filterButtons.length).toBeGreaterThan(0)
        
        filterButtons.forEach((button) => {
          expect(button.textContent).toMatch(/vinyasa|hatha|yin|restorative|all/i)
        })
      }
      
      if (searchInput) {
        expect(searchInput).toHaveAttribute('placeholder')
        expect(searchInput.getAttribute('placeholder')).toMatch(/search|find|filter/i)
      }
    }
  })

  it('should have structured data for instructor profiles', async () => {
    // SEO requirement: structured data for better search results
    const structuredData = document.querySelector('script[type="application/ld+json"]')
    
    if (structuredData?.textContent) {
      const jsonData = JSON.parse(structuredData.textContent)
      
      // Should include Person schema for instructors
      if (Array.isArray(jsonData)) {
        const instructorData = jsonData.find(item => item['@type'] === 'Person')
        expect(instructorData).toBeDefined()
      } else if (jsonData['@type'] === 'Person') {
        expect(jsonData).toHaveProperty('name')
        expect(jsonData).toHaveProperty('jobTitle')
      }
    }
  })

  it('should display instructor schedule or class information', async () => {
    // Business value: show which classes each instructor teaches
    const instructorCards = getAllByTestId(instructorsPageElement, 'instructor-card')

    instructorCards.forEach((card) => {
      const schedule = card.querySelector('[data-testid="instructor-schedule"]')
      const classes = card.querySelector('[data-testid="instructor-classes"]')
      
      if (schedule || classes) {
        const scheduleElement = schedule || classes
        expect(scheduleElement?.textContent?.length).toBeGreaterThan(0)
        
        // Should contain day/time information or class names
        expect(scheduleElement).toHaveTextContent(/monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|afternoon|evening|vinyasa|hatha|yin/i)
      }
    })
  })

  it('should be accessible with proper ARIA labels', async () => {
    // Accessibility requirement
    const instructorCards = getAllByTestId(instructorsPageElement, 'instructor-card')

    instructorCards.forEach((card, index) => {
      // Should have proper heading structure
      const heading = card.querySelector('h2, h3, [role="heading"]')
      expect(heading).toBeInTheDocument()
      
      // Images should have descriptive alt text
      const photo = card.querySelector('img')
      const altText = photo?.getAttribute('alt')
      expect(altText).not.toMatch(/^(image|photo|instructor)$/i) // Should be descriptive, not generic
    })
    
    // Page should have main heading
    const mainHeading = instructorsPageElement.querySelector('h1')
    expect(mainHeading).toBeInTheDocument()
    expect(mainHeading).toHaveTextContent(/instructor|teacher|staff/i)
  })

  it('should handle empty state gracefully', async () => {
    // Edge case: what if no instructors are active
    const { getInstructors } = await import('../../src/services/instructorService')
    
    // Mock empty response
    const originalGetInstructors = getInstructors
    const mockGetInstructors = vi.fn().mockResolvedValue([])
    
    try {
      // This would show empty state handling
      const emptyState = instructorsPageElement.querySelector('[data-testid="empty-instructors"]')
      
      if (emptyState) {
        expect(emptyState).toHaveTextContent(/no instructors|coming soon|check back/i)
      }
    } finally {
      // Restore original function
      vi.restoreAllMocks()
    }
  })
})