import { describe, it, expect, beforeEach } from 'vitest'
import { getByRole, getByText, getAllByText } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Integration test for homepage content loading - based on user stories from quickstart.md
// This test MUST FAIL initially (TDD RED phase)
describe('Homepage Integration', () => {
  let homepageElement: HTMLElement

  beforeEach(async () => {
    // This will fail until we implement the homepage
    const { renderHomepage } = await import('../../src/pages/index.astro')
    homepageElement = await renderHomepage()
  })

  it('should display studio name and tagline prominently', async () => {
    // Based on user story: visitor lands on homepage and sees studio branding
    const studioName = getByRole(homepageElement, 'heading', { level: 1 })
    expect(studioName).toBeInTheDocument()
    expect(studioName).toHaveTextContent(/yoga studio/i)
    
    // Tagline should be visible
    const tagline = getByText(homepageElement, /find your inner peace|wellness|mindful/i)
    expect(tagline).toBeInTheDocument()
  })

  it('should show hero section with featured studio photo', async () => {
    // Based on acceptance criteria: hero section with featured studio photo
    const heroSection = homepageElement.querySelector('[data-testid="hero-section"]')
    expect(heroSection).toBeInTheDocument()
    
    const heroImage = heroSection?.querySelector('img')
    expect(heroImage).toBeInTheDocument()
    expect(heroImage).toHaveAttribute('alt')
    expect(heroImage?.alt.length).toBeGreaterThan(0) // Accessibility requirement
  })

  it('should provide clear navigation to main sections', async () => {
    // Based on acceptance criteria: clear navigation to main sections
    const navigation = homepageElement.querySelector('nav')
    expect(navigation).toBeInTheDocument()
    
    // Check for main navigation links
    const aboutLink = getByRole(navigation!, 'link', { name: /about/i })
    const membershipLink = getByRole(navigation!, 'link', { name: /membership|pricing/i })
    const instructorsLink = getByRole(navigation!, 'link', { name: /instructors|teachers/i })
    const contactLink = getByRole(navigation!, 'link', { name: /contact/i })
    
    expect(aboutLink).toBeInTheDocument()
    expect(membershipLink).toBeInTheDocument()
    expect(instructorsLink).toBeInTheDocument()
    expect(contactLink).toBeInTheDocument()
  })

  it('should display contact information in header or footer', async () => {
    // Based on acceptance criteria: contact information easily accessible
    const header = homepageElement.querySelector('header')
    const footer = homepageElement.querySelector('footer')
    
    // Should have phone number (clickable on mobile)
    const phoneLink = (header || footer)?.querySelector('a[href^="tel:"]')
    expect(phoneLink).toBeInTheDocument()
    
    // Should have email with mailto link
    const emailLink = (header || footer)?.querySelector('a[href^="mailto:"]')
    expect(emailLink).toBeInTheDocument()
  })

  it('should show business hours', async () => {
    // Based on acceptance criteria: business hours displayed
    const hoursSection = homepageElement.querySelector('[data-testid="business-hours"]')
    expect(hoursSection).toBeInTheDocument()
    
    // Should contain day names
    expect(hoursSection).toHaveTextContent(/monday|tuesday|wednesday/i)
    
    // Should contain time information
    expect(hoursSection).toHaveTextContent(/\d{1,2}:\d{2}|am|pm/i)
  })

  it('should have call-to-action buttons for membership', async () => {
    // Based on acceptance criteria: call-to-action buttons for membership
    const ctaButtons = getAllByText(homepageElement, /join now|get started|view plans|sign up/i)
    expect(ctaButtons.length).toBeGreaterThan(0)
    
    // At least one CTA should link to membership page
    const membershipCTA = homepageElement.querySelector('a[href*="membership"], a[href*="pricing"]')
    expect(membershipCTA).toBeInTheDocument()
  })

  it('should load studio information from CMS', async () => {
    // Integration test with actual CMS data
    const { getStudioInfo } = await import('../../src/services/studioService')
    
    const studioInfo = await getStudioInfo()
    
    // Homepage should display the CMS data
    expect(homepageElement).toHaveTextContent(studioInfo.name)
    if (studioInfo.tagline) {
      expect(homepageElement).toHaveTextContent(studioInfo.tagline)
    }
    if (studioInfo.description) {
      expect(homepageElement).toHaveTextContent(studioInfo.description)
    }
  })

  it('should display featured instructors section', async () => {
    // Integration with instructor service
    const featuredSection = homepageElement.querySelector('[data-testid="featured-instructors"]')
    expect(featuredSection).toBeInTheDocument()
    
    const instructorCards = featuredSection?.querySelectorAll('[data-testid="instructor-card"]')
    expect(instructorCards?.length).toBeGreaterThanOrEqual(1)
    
    // Each instructor card should have image and name
    instructorCards?.forEach((card) => {
      const image = card.querySelector('img')
      const name = card.querySelector('[data-testid="instructor-name"]')
      
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('alt')
      expect(name).toBeInTheDocument()
    })
  })

  it('should show membership plans preview', async () => {
    // Integration with membership service
    const membershipPreview = homepageElement.querySelector('[data-testid="membership-preview"]')
    expect(membershipPreview).toBeInTheDocument()
    
    const planCards = membershipPreview?.querySelectorAll('[data-testid="membership-card"]')
    expect(planCards?.length).toBeGreaterThanOrEqual(1)
    
    // Each plan should show price and name
    planCards?.forEach((card) => {
      const planName = card.querySelector('[data-testid="plan-name"]')
      const planPrice = card.querySelector('[data-testid="plan-price"]')
      
      expect(planName).toBeInTheDocument()
      expect(planPrice).toBeInTheDocument()
      expect(planPrice).toHaveTextContent(/\$\d+/)
    })
  })

  it('should have SEO meta tags and structured data', async () => {
    // SEO optimization requirements
    const title = document.querySelector('title')
    expect(title).toBeInTheDocument()
    expect(title?.textContent).toMatch(/yoga studio/i)
    
    const description = document.querySelector('meta[name="description"]')
    expect(description).toBeInTheDocument()
    expect(description?.getAttribute('content')?.length).toBeGreaterThan(50)
    
    // Structured data for local business
    const structuredData = document.querySelector('script[type="application/ld+json"]')
    expect(structuredData).toBeInTheDocument()
    
    if (structuredData?.textContent) {
      const jsonData = JSON.parse(structuredData.textContent)
      expect(jsonData['@type']).toContain('LocalBusiness')
    }
  })

  it('should be mobile responsive', async () => {
    // Mobile-first design requirement
    const viewport = document.querySelector('meta[name="viewport"]')
    expect(viewport).toBeInTheDocument()
    expect(viewport?.getAttribute('content')).toContain('width=device-width')
    
    // Main content should be properly contained
    const main = homepageElement.querySelector('main')
    expect(main).toBeInTheDocument()
    
    // Navigation should be mobile-friendly
    const navigation = homepageElement.querySelector('nav')
    expect(navigation).toHaveClass(/mobile|responsive|nav/)
  })

  it('should load within performance targets', async () => {
    // Performance requirement: <3 second load time
    const startTime = performance.now()
    
    const { renderHomepage } = await import('../../src/pages/index.astro')
    await renderHomepage()
    
    const endTime = performance.now()
    const loadTime = endTime - startTime
    
    // Should render quickly (this is just the component render, not full page load)
    expect(loadTime).toBeLessThan(100) // 100ms for component rendering
  })
})