import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Component test for MembershipCard component
// This test MUST FAIL initially (TDD RED phase)
describe('MembershipCard Component', () => {
  const mockMembershipPlan = {
    name: 'Monthly Unlimited',
    description: 'Unlimited classes with premium benefits including guest passes and workshop discounts.',
    price: 99.99,
    billingCycle: 'monthly',
    duration: null, // Ongoing
    classesIncluded: null, // Unlimited
    benefits: [
      'Unlimited classes',
      '2 guest passes per month',
      '10% off workshops',
      'Free yoga mat rental',
      'Priority booking'
    ],
    restrictions: 'Valid at all locations. Must provide 30-day notice to cancel.',
    isPopular: true,
    isActive: true
  }

  const mockDropInPlan = {
    name: 'Drop-In Class',
    description: 'Single class for flexibility.',
    price: 25,
    billingCycle: 'drop-in',
    duration: null,
    classesIncluded: 1,
    benefits: ['Access to all class types'],
    restrictions: 'Valid for 30 days from purchase.',
    isPopular: false,
    isActive: true
  }

  let MembershipCardComponent: any

  beforeEach(async () => {
    // This will fail until we implement the MembershipCard component
    const { default: MembershipCard } = await import('../../src/components/MembershipCard.astro')
    MembershipCardComponent = MembershipCard
  })

  it('should render plan name prominently', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const planName = container.getByTestId('plan-name')
    expect(planName).toBeInTheDocument()
    expect(planName).toHaveTextContent('Monthly Unlimited')
    
    // Should be rendered as a heading
    expect(planName.tagName).toMatch(/^H[1-6]$/)
  })

  it('should display price with proper formatting', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const price = container.getByTestId('plan-price')
    expect(price).toBeInTheDocument()
    expect(price).toHaveTextContent('$99.99')
    
    // Should have prominent styling for price
    expect(price).toHaveClass(/price|cost|amount/)
  })

  it('should show billing cycle clearly', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const billingCycle = container.getByTestId('billing-cycle')
    expect(billingCycle).toBeInTheDocument()
    expect(billingCycle).toHaveTextContent(/per month|monthly/i)
  })

  it('should handle different billing cycles correctly', () => {
    const annualPlan = { ...mockMembershipPlan, billingCycle: 'annual', price: 999 }
    const container = render(MembershipCardComponent, { props: { plan: annualPlan } })
    
    const billingCycle = container.getByTestId('billing-cycle')
    expect(billingCycle).toHaveTextContent(/per year|annual/i)
    
    // Drop-in should show different format
    const dropInContainer = render(MembershipCardComponent, { props: { plan: mockDropInPlan } })
    const dropInBilling = dropInContainer.getByTestId('billing-cycle')
    expect(dropInBilling).toHaveTextContent(/per class|drop-in/i)
  })

  it('should display plan description', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const description = container.getByTestId('plan-description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveTextContent(mockMembershipPlan.description)
  })

  it('should list all benefits clearly', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const benefits = container.getByTestId('plan-benefits')
    expect(benefits).toBeInTheDocument()
    
    const benefitItems = benefits.querySelectorAll('[data-testid="benefit-item"]')
    expect(benefitItems).toHaveLength(5)
    
    // Check each benefit is displayed
    mockMembershipPlan.benefits.forEach((benefit, index) => {
      expect(benefitItems[index]).toHaveTextContent(benefit)
    })
  })

  it('should show popular badge when plan is popular', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const popularBadge = container.getByTestId('popular-badge')
    expect(popularBadge).toBeInTheDocument()
    expect(popularBadge).toHaveTextContent(/popular|recommended|best value/i)
    
    // Popular card should have special styling
    const card = container.getByTestId('membership-card')
    expect(card).toHaveClass(/popular|featured|highlight/)
  })

  it('should not show popular badge for non-popular plans', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockDropInPlan } })
    
    const popularBadge = container.queryByTestId('popular-badge')
    expect(popularBadge).not.toBeInTheDocument()
    
    const card = container.getByTestId('membership-card')
    expect(card).not.toHaveClass(/popular|featured|highlight/)
  })

  it('should display classes included when applicable', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockDropInPlan } })
    
    const classesInfo = container.getByTestId('classes-included')
    expect(classesInfo).toBeInTheDocument()
    expect(classesInfo).toHaveTextContent('1 class')
    
    // Unlimited plan should show unlimited
    const unlimitedContainer = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    const unlimitedInfo = unlimitedContainer.getByTestId('classes-included')
    expect(unlimitedInfo).toHaveTextContent(/unlimited/i)
  })

  it('should show restrictions when present', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const restrictions = container.getByTestId('plan-restrictions')
    expect(restrictions).toBeInTheDocument()
    expect(restrictions).toHaveTextContent(mockMembershipPlan.restrictions)
  })

  it('should handle plans without restrictions', () => {
    const planWithoutRestrictions = { ...mockMembershipPlan, restrictions: null }
    const container = render(MembershipCardComponent, { props: { plan: planWithoutRestrictions } })
    
    const restrictions = container.queryByTestId('plan-restrictions')
    expect(restrictions).not.toBeInTheDocument()
  })

  it('should show duration when plan has contract length', () => {
    const planWithDuration = { ...mockMembershipPlan, duration: 12 }
    const container = render(MembershipCardComponent, { props: { plan: planWithDuration } })
    
    const duration = container.getByTestId('plan-duration')
    expect(duration).toBeInTheDocument()
    expect(duration).toHaveTextContent(/12.*month/i)
  })

  it('should have prominent call-to-action button', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const ctaButton = container.getByTestId('plan-cta')
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveTextContent(/get started|join now|select plan|choose plan/i)
    
    // Should be a button or link
    expect(ctaButton.tagName).toMatch(/^(BUTTON|A)$/)
    
    // Should have prominent styling
    expect(ctaButton).toHaveClass(/btn|button|cta/)
  })

  it('should handle CTA button click events', () => {
    const onSelect = vi.fn()
    const container = render(MembershipCardComponent, { 
      props: { plan: mockMembershipPlan, onSelect } 
    })
    
    const ctaButton = container.getByTestId('plan-cta')
    fireEvent.click(ctaButton)
    
    expect(onSelect).toHaveBeenCalledWith(mockMembershipPlan)
  })

  it('should have different CTA text based on plan type', () => {
    // Popular plan should have premium CTA
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    const popularCTA = container.getByTestId('plan-cta')
    expect(popularCTA).toHaveTextContent(/get started|join now/i)
    
    // Drop-in should have different CTA
    const dropInContainer = render(MembershipCardComponent, { props: { plan: mockDropInPlan } })
    const dropInCTA = dropInContainer.getByTestId('plan-cta')
    expect(dropInCTA).toHaveTextContent(/book class|purchase/i)
  })

  it('should display price per class for unlimited plans', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const pricePerClass = container.getByTestId('price-per-class')
    if (pricePerClass) {
      // Should calculate and show estimated price per class
      expect(pricePerClass).toHaveTextContent(/\$.*per class/i)
      expect(pricePerClass).toHaveClass(/secondary|small|muted/)
    }
  })

  it('should be accessible with proper ARIA attributes', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const card = container.getByTestId('membership-card')
    expect(card).toHaveAttribute('role', 'article')
    expect(card).toHaveAttribute('aria-labelledby')
    
    const planName = container.getByTestId('plan-name')
    const labelId = card.getAttribute('aria-labelledby')
    expect(planName).toHaveAttribute('id', labelId)
    
    // CTA button should have descriptive aria-label
    const ctaButton = container.getByTestId('plan-cta')
    expect(ctaButton).toHaveAttribute('aria-label')
    const ariaLabel = ctaButton.getAttribute('aria-label')
    expect(ariaLabel).toContain(mockMembershipPlan.name)
  })

  it('should have proper keyboard navigation', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const ctaButton = container.getByTestId('plan-cta')
    expect(ctaButton).toHaveAttribute('tabindex', '0')
    
    // Should handle keyboard events
    fireEvent.keyDown(ctaButton, { key: 'Enter' })
    fireEvent.keyDown(ctaButton, { key: ' ' }) // Space key
    
    // Should focus properly
    ctaButton.focus()
    expect(document.activeElement).toBe(ctaButton)
  })

  it('should support comparison mode styling', () => {
    const container = render(MembershipCardComponent, { 
      props: { plan: mockMembershipPlan, compareMode: true, selected: true } 
    })
    
    const card = container.getByTestId('membership-card')
    expect(card).toHaveClass(/compare|selected/)
    
    // Should have selection indicator
    const selectionIndicator = container.getByTestId('selection-indicator')
    expect(selectionIndicator).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    const container = render(MembershipCardComponent, { 
      props: { plan: mockMembershipPlan, loading: true } 
    })
    
    const card = container.getByTestId('membership-card')
    expect(card).toHaveClass(/loading|skeleton/)
    
    const ctaButton = container.getByTestId('plan-cta')
    expect(ctaButton).toBeDisabled()
  })

  it('should format price correctly for different amounts', () => {
    const expensivePlan = { ...mockMembershipPlan, price: 1234.50 }
    const container = render(MembershipCardComponent, { props: { plan: expensivePlan } })
    
    const price = container.getByTestId('plan-price')
    expect(price).toHaveTextContent('$1,234.50')
    
    // Free plan should show special formatting
    const freePlan = { ...mockMembershipPlan, price: 0 }
    const freeContainer = render(MembershipCardComponent, { props: { plan: freePlan } })
    const freePrice = freeContainer.getByTestId('plan-price')
    expect(freePrice).toHaveTextContent(/free|complimentary/i)
  })

  it('should have responsive design for mobile', () => {
    const container = render(MembershipCardComponent, { props: { plan: mockMembershipPlan } })
    
    const card = container.getByTestId('membership-card')
    expect(card).toHaveClass(/responsive|mobile|card/)
    
    // CTA button should have adequate touch target
    const ctaButton = container.getByTestId('plan-cta')
    const computedStyle = window.getComputedStyle(ctaButton)
    const minHeight = parseFloat(computedStyle.minHeight)
    expect(minHeight).toBeGreaterThanOrEqual(44) // 44px minimum touch target
  })

  it('should support custom styling props', () => {
    const container = render(MembershipCardComponent, { 
      props: { 
        plan: mockMembershipPlan, 
        className: 'custom-card',
        variant: 'compact',
        theme: 'dark'
      } 
    })
    
    const card = container.getByTestId('membership-card')
    expect(card).toHaveClass('custom-card')
    expect(card).toHaveClass('compact')
    expect(card).toHaveClass('dark')
  })

  it('should handle empty or minimal plan data gracefully', () => {
    const minimalPlan = {
      name: 'Basic Plan',
      price: 50,
      billingCycle: 'monthly',
      isActive: true
    }
    
    expect(() => {
      render(MembershipCardComponent, { props: { plan: minimalPlan } })
    }).not.toThrow()
    
    const container = render(MembershipCardComponent, { props: { plan: minimalPlan } })
    const planName = container.getByTestId('plan-name')
    expect(planName).toHaveTextContent('Basic Plan')
  })
})