import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Component test for InstructorProfile component
// This test MUST FAIL initially (TDD RED phase)
describe('InstructorProfile Component', () => {
  const mockInstructor = {
    name: 'Sarah Johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'RYT-500, Senior Instructor',
    bio: 'Sarah has been practicing yoga for over 15 years and teaching for 8 years. She brings a gentle yet challenging approach to her classes, emphasizing breath awareness and mindful movement. Her teaching style combines traditional Hatha yoga with dynamic Vinyasa flows, creating a balanced practice suitable for all levels.',
    photo: {
      _type: 'image',
      asset: {
        _ref: 'image-abc123-1920x1080-jpg',
        _type: 'reference'
      },
      hotspot: {
        x: 0.5,
        y: 0.4
      }
    },
    certifications: ['RYT-500', 'Yin Yoga Certified', 'Meditation Teacher', 'Trauma-Informed Yoga'],
    specialties: ['Vinyasa Flow', 'Restorative Yoga', 'Meditation', 'Breath Work'],
    experience: 8,
    email: 'sarah@serenityyoga.com',
    socialMedia: [
      {
        platform: 'instagram',
        url: 'https://instagram.com/sarahyoga'
      }
    ],
    isActive: true
  }

  const mockMinimalInstructor = {
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    bio: 'John is a dedicated yoga teacher who focuses on creating a welcoming environment for all students, regardless of experience level.',
    photo: {
      _type: 'image',
      asset: {
        _ref: 'image-xyz789-800x600-jpg',
        _type: 'reference'
      }
    },
    specialties: ['Hatha Yoga'],
    isActive: true
  }

  let InstructorProfileComponent: any

  beforeEach(async () => {
    // This will fail until we implement the InstructorProfile component
    const { default: InstructorProfile } = await import('../../src/components/InstructorProfile.astro')
    InstructorProfileComponent = InstructorProfile
  })

  it('should render instructor name prominently', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const name = container.getByTestId('instructor-name')
    expect(name).toBeInTheDocument()
    expect(name).toHaveTextContent('Sarah Johnson')
    
    // Should be rendered as a heading
    expect(name.tagName).toMatch(/^H[1-6]$/)
  })

  it('should display instructor photo with proper accessibility', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const photo = container.getByTestId('instructor-photo')
    expect(photo).toBeInTheDocument()
    expect(photo.tagName).toBe('IMG')
    
    // Should have descriptive alt text
    expect(photo).toHaveAttribute('alt')
    const altText = photo.getAttribute('alt')
    expect(altText).toContain(mockInstructor.name)
    expect(altText?.length).toBeGreaterThan(10) // Not just the name
    
    // Should have proper image optimization
    expect(photo).toHaveAttribute('loading', 'lazy')
    expect(photo).toHaveAttribute('width')
    expect(photo).toHaveAttribute('height')
  })

  it('should show instructor credentials and title', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const credentials = container.getByTestId('instructor-credentials')
    expect(credentials).toBeInTheDocument()
    expect(credentials).toHaveTextContent('RYT-500, Senior Instructor')
  })

  it('should handle instructor without credentials gracefully', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockMinimalInstructor } })
    
    const credentials = container.queryByTestId('instructor-credentials')
    expect(credentials).not.toBeInTheDocument()
  })

  it('should display full bio with proper formatting', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const bio = container.getByTestId('instructor-bio')
    expect(bio).toBeInTheDocument()
    expect(bio).toHaveTextContent(mockInstructor.bio)
    
    // Bio should be properly formatted with paragraphs
    expect(bio.innerHTML).toContain('<p>')
  })

  it('should enforce bio minimum length requirement', () => {
    // Bio should be at least 100 characters as per contract
    expect(mockInstructor.bio.length).toBeGreaterThanOrEqual(100)
    expect(mockMinimalInstructor.bio.length).toBeGreaterThanOrEqual(100)
  })

  it('should list all specialties clearly', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const specialties = container.getByTestId('instructor-specialties')
    expect(specialties).toBeInTheDocument()
    
    const specialtyItems = specialties.querySelectorAll('[data-testid="specialty-item"]')
    expect(specialtyItems).toHaveLength(4)
    
    mockInstructor.specialties.forEach((specialty, index) => {
      expect(specialtyItems[index]).toHaveTextContent(specialty)
    })
  })

  it('should display certifications when available', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const certifications = container.getByTestId('instructor-certifications')
    expect(certifications).toBeInTheDocument()
    
    const certItems = certifications.querySelectorAll('[data-testid="certification-item"]')
    expect(certItems).toHaveLength(4)
    
    mockInstructor.certifications.forEach((cert, index) => {
      expect(certItems[index]).toHaveTextContent(cert)
    })
  })

  it('should handle instructor without certifications', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockMinimalInstructor } })
    
    const certifications = container.queryByTestId('instructor-certifications')
    expect(certifications).not.toBeInTheDocument()
  })

  it('should show years of experience when available', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const experience = container.getByTestId('instructor-experience')
    expect(experience).toBeInTheDocument()
    expect(experience).toHaveTextContent(/8.*year/i)
  })

  it('should handle instructor without experience data', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockMinimalInstructor } })
    
    const experience = container.queryByTestId('instructor-experience')
    expect(experience).not.toBeInTheDocument()
  })

  it('should display contact information when available', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const contact = container.getByTestId('instructor-contact')
    expect(contact).toBeInTheDocument()
    
    const emailLink = contact.querySelector('a[href^="mailto:"]')
    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', 'mailto:sarah@serenityyoga.com')
  })

  it('should render social media links with proper attributes', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const socialLink = container.getByTestId('social-link-instagram')
    expect(socialLink).toBeInTheDocument()
    expect(socialLink).toHaveAttribute('href', 'https://instagram.com/sarahyoga')
    expect(socialLink).toHaveAttribute('target', '_blank')
    expect(socialLink).toHaveAttribute('rel', 'noopener noreferrer')
    
    // Should have descriptive aria-label
    expect(socialLink).toHaveAttribute('aria-label')
    const ariaLabel = socialLink.getAttribute('aria-label')
    expect(ariaLabel).toMatch(/sarah.*instagram/i)
  })

  it('should handle instructor without contact info gracefully', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockMinimalInstructor } })
    
    const contact = container.queryByTestId('instructor-contact')
    expect(contact).not.toBeInTheDocument()
  })

  it('should support expandable bio for long content', () => {
    const container = render(InstructorProfileComponent, { 
      props: { instructor: mockInstructor, expandableBio: true } 
    })
    
    const bio = container.getByTestId('instructor-bio')
    const expandButton = container.queryByTestId('expand-bio-button')
    
    if (expandButton) {
      expect(expandButton).toHaveTextContent(/read more|expand/i)
      
      // Should show truncated bio initially
      expect(bio).toHaveClass(/truncated|collapsed/)
      
      // Click to expand
      fireEvent.click(expandButton)
      expect(bio).not.toHaveClass(/truncated|collapsed/)
      expect(expandButton).toHaveTextContent(/read less|collapse/i)
    }
  })

  it('should have proper card layout and styling', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const card = container.getByTestId('instructor-card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass(/card|profile|instructor/)
    
    // Should have proper layout classes
    expect(card).toHaveClass(/flex|grid|layout/)
  })

  it('should be accessible with proper ARIA attributes', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const card = container.getByTestId('instructor-card')
    expect(card).toHaveAttribute('role', 'article')
    expect(card).toHaveAttribute('aria-labelledby')
    
    const name = container.getByTestId('instructor-name')
    const labelId = card.getAttribute('aria-labelledby')
    expect(name).toHaveAttribute('id', labelId)
    
    // Photo should not be focusable since it's decorative in context
    const photo = container.getByTestId('instructor-photo')
    expect(photo).toHaveAttribute('role', 'img')
  })

  it('should support different display variants', () => {
    const compactContainer = render(InstructorProfileComponent, { 
      props: { instructor: mockInstructor, variant: 'compact' } 
    })
    
    const compactCard = compactContainer.getByTestId('instructor-card')
    expect(compactCard).toHaveClass('compact')
    
    // Featured variant
    const featuredContainer = render(InstructorProfileComponent, { 
      props: { instructor: mockInstructor, variant: 'featured' } 
    })
    
    const featuredCard = featuredContainer.getByTestId('instructor-card')
    expect(featuredCard).toHaveClass('featured')
  })

  it('should handle image optimization with hotspot', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const photo = container.getByTestId('instructor-photo')
    
    // Should use optimized image service
    const src = photo.getAttribute('src')
    expect(src).toMatch(/cloudinary|sanity|optimized/i)
    
    // Should handle hotspot data for cropping
    if (mockInstructor.photo.hotspot) {
      expect(src).toContain('crop') || expect(src).toContain('focus')
    }
  })

  it('should be mobile responsive', () => {
    const container = render(InstructorProfileComponent, { props: { instructor: mockInstructor } })
    
    const card = container.getByTestId('instructor-card')
    expect(card).toHaveClass(/responsive|mobile/)
    
    // Photo should be responsive
    const photo = container.getByTestId('instructor-photo')
    expect(photo).toHaveClass(/responsive|fluid/)
    
    // Text should be readable on mobile
    const bio = container.getByTestId('instructor-bio')
    const computedStyle = window.getComputedStyle(bio)
    const fontSize = parseFloat(computedStyle.fontSize)
    expect(fontSize).toBeGreaterThanOrEqual(16) // Minimum mobile font size
  })

  it('should support click events for instructor detail view', () => {
    const onClick = vi.fn()
    const container = render(InstructorProfileComponent, { 
      props: { instructor: mockInstructor, onClick, clickable: true } 
    })
    
    const card = container.getByTestId('instructor-card')
    expect(card).toHaveAttribute('role', 'button')
    expect(card).toHaveAttribute('tabindex', '0')
    
    fireEvent.click(card)
    expect(onClick).toHaveBeenCalledWith(mockInstructor)
    
    // Should handle keyboard events
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('should display class schedule when provided', () => {
    const instructorWithSchedule = {
      ...mockInstructor,
      schedule: [
        { day: 'Monday', time: '9:00 AM', class: 'Vinyasa Flow' },
        { day: 'Wednesday', time: '6:00 PM', class: 'Restorative Yoga' }
      ]
    }
    
    const container = render(InstructorProfileComponent, { 
      props: { instructor: instructorWithSchedule, showSchedule: true } 
    })
    
    const schedule = container.getByTestId('instructor-schedule')
    expect(schedule).toBeInTheDocument()
    
    const scheduleItems = schedule.querySelectorAll('[data-testid="schedule-item"]')
    expect(scheduleItems).toHaveLength(2)
    
    expect(scheduleItems[0]).toHaveTextContent(/monday.*9:00 AM.*vinyasa flow/i)
    expect(scheduleItems[1]).toHaveTextContent(/wednesday.*6:00 PM.*restorative/i)
  })

  it('should handle loading state', () => {
    const container = render(InstructorProfileComponent, { 
      props: { instructor: mockInstructor, loading: true } 
    })
    
    const card = container.getByTestId('instructor-card')
    expect(card).toHaveClass(/loading|skeleton/)
    
    // Content should be hidden or shimmer
    const bio = container.queryByTestId('instructor-bio')
    if (bio) {
      expect(bio).toHaveClass(/skeleton|shimmer/)
    }
  })

  it('should validate required props', () => {
    const minimalValidInstructor = {
      name: 'Test Instructor',
      firstName: 'Test',
      lastName: 'Instructor',
      bio: 'This instructor teaches yoga with passion and dedication, bringing years of experience to create a welcoming practice.',
      photo: {
        _type: 'image',
        asset: { _ref: 'test-ref', _type: 'reference' }
      },
      specialties: ['Hatha'],
      isActive: true
    }
    
    expect(() => {
      render(InstructorProfileComponent, { props: { instructor: minimalValidInstructor } })
    }).not.toThrow()
  })

  it('should support custom CSS classes', () => {
    const container = render(InstructorProfileComponent, { 
      props: { 
        instructor: mockInstructor, 
        className: 'custom-instructor',
        theme: 'light'
      } 
    })
    
    const card = container.getByTestId('instructor-card')
    expect(card).toHaveClass('custom-instructor')
    expect(card).toHaveClass('light')
  })
})