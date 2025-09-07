import { describe, it, expect, beforeEach } from 'vitest'
import { getByRole, getByText, getAllByTestId } from '@testing-library/dom'
import '@testing-library/jest-dom'

// Integration test for membership page - based on user stories from quickstart.md
// This test MUST FAIL initially (TDD RED phase)
describe('Membership Page Integration', () => {
  let membershipPageElement: HTMLElement

  beforeEach(async () => {
    // This will fail until we implement the membership page
    const { renderMembershipPage } = await import('../../src/pages/membership.astro')
    membershipPageElement = await renderMembershipPage()
  })

  it('should display all available membership plans clearly', async () => {
    // Based on user story: potential customer browses site for pricing information
    const planCards = getAllByTestId(membershipPageElement, 'membership-card')
    expect(planCards.length).toBeGreaterThan(0)

    // Should show different plan types
    const planNames = planCards.map(card => 
      card.querySelector('[data-testid="plan-name"]')?.textContent
    )
    
    // Should have variety of plans
    expect(planNames).toContain(expect.stringMatching(/monthly|unlimited/i))
    expect(planNames.some(name => name?.match(/annual|yearly/i) || 
                              name?.match(/drop.in|class.pack/i))).toBe(true)
  })

  it('should show pricing information for each plan', async () => {
    // Based on acceptance criteria: view membership options with clear pricing
    const planCards = getAllByTestId(membershipPageElement, 'membership-card')

    planCards.forEach((card) => {
      const price = card.querySelector('[data-testid="plan-price"]')
      const billingCycle = card.querySelector('[data-testid="billing-cycle"]')
      
      expect(price).toBeInTheDocument()
      expect(price).toHaveTextContent(/\$\d+/)
      
      expect(billingCycle).toBeInTheDocument()
      expect(billingCycle).toHaveTextContent(/month|annual|per class/i)
    })
  })

  it('should list benefits and features for each plan', async () => {
    // Based on acceptance criteria: clear benefits listed
    const planCards = getAllByTestId(membershipPageElement, 'membership-card')

    planCards.forEach((card) => {
      const benefitsList = card.querySelector('[data-testid="plan-benefits"]')
      expect(benefitsList).toBeInTheDocument()
      
      const benefits = benefitsList?.querySelectorAll('li, [data-testid="benefit-item"]')
      expect(benefits?.length).toBeGreaterThan(0)
      
      // Should have descriptive benefit text
      benefits?.forEach((benefit) => {
        expect(benefit.textContent?.length).toBeGreaterThan(0)
      })
    })
  })

  it('should highlight popular/recommended plan', async () => {
    // Based on acceptance criteria: popular/recommended plan highlighted
    const popularPlan = membershipPageElement.querySelector('[data-testid="popular-plan"]')
    expect(popularPlan).toBeInTheDocument()
    
    // Should have visual distinction
    expect(popularPlan).toHaveClass(/popular|featured|recommended|highlight/)
    
    // Should have label or badge
    const popularBadge = popularPlan?.querySelector('[data-testid="popular-badge"]')
    expect(popularBadge).toBeInTheDocument()
    expect(popularBadge).toHaveTextContent(/popular|recommended|best.value/i)
  })

  it('should provide clear call-to-action for each plan', async () => {
    // Based on acceptance criteria: clear call-to-action to inquire or sign up
    const planCards = getAllByTestId(membershipPageElement, 'membership-card')

    planCards.forEach((card) => {
      const ctaButton = card.querySelector('[data-testid="plan-cta"]')
      expect(ctaButton).toBeInTheDocument()
      expect(ctaButton).toHaveTextContent(/get started|join now|select plan|inquire/i)
      
      // Should be a link or button
      expect(ctaButton?.tagName).toMatch(/^(A|BUTTON)$/)
      
      if (ctaButton?.tagName === 'A') {
        expect(ctaButton).toHaveAttribute('href')
      }
    })
  })

  it('should load membership data from CMS', async () => {
    // Integration with membership service
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    expect(plans.length).toBeGreaterThan(0)
    
    // Page should display the CMS data
    plans.forEach((plan) => {
      expect(membershipPageElement).toHaveTextContent(plan.name)
      expect(membershipPageElement).toHaveTextContent(`$${plan.price}`)
    })
  })

  it('should show plan restrictions and terms when applicable', async () => {
    // Based on contract: plans may have restrictions
    const planCards = getAllByTestId(membershipPageElement, 'membership-card')

    // Check if any plans show restrictions
    const plansWithRestrictions = planCards.filter(card => 
      card.querySelector('[data-testid="plan-restrictions"]')
    )

    plansWithRestrictions.forEach((card) => {
      const restrictions = card.querySelector('[data-testid="plan-restrictions"]')
      expect(restrictions).toBeInTheDocument()
      expect(restrictions?.textContent?.length).toBeGreaterThan(0)
    })
  })

  it('should handle different billing cycles appropriately', async () => {
    // Based on contract: monthly, annual, drop-in options
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    const billingCycles = [...new Set(plans.map(plan => plan.billingCycle))]
    
    billingCycles.forEach((cycle) => {
      expect(membershipPageElement).toHaveTextContent(new RegExp(cycle, 'i'))
    })

    // Should show appropriate pricing display for each cycle
    const monthlyPlans = membershipPageElement.querySelectorAll('[data-billing="monthly"]')
    const annualPlans = membershipPageElement.querySelectorAll('[data-billing="annual"]')
    
    monthlyPlans.forEach((plan) => {
      expect(plan).toHaveTextContent(/month|monthly/i)
    })

    annualPlans.forEach((plan) => {
      expect(plan).toHaveTextContent(/year|annual/i)
    })
  })

  it('should provide membership inquiry form or link', async () => {
    // Based on user journey: path for potential customers to inquire
    const inquiryForm = membershipPageElement.querySelector('[data-testid="membership-inquiry-form"]')
    const inquiryLink = membershipPageElement.querySelector('a[href*="contact"], a[href*="inquiry"]')
    
    // Should have either embedded form or link to inquiry
    expect(inquiryForm || inquiryLink).toBeTruthy()
    
    if (inquiryForm) {
      // If form is embedded, should have required fields
      const nameField = inquiryForm.querySelector('input[name="name"]')
      const emailField = inquiryForm.querySelector('input[name="email"]')
      
      expect(nameField).toBeInTheDocument()
      expect(emailField).toBeInTheDocument()
    }
  })

  it('should display FAQ or additional information section', async () => {
    // Common user need: additional information about memberships
    const faqSection = membershipPageElement.querySelector('[data-testid="membership-faq"]')
    const infoSection = membershipPageElement.querySelector('[data-testid="additional-info"]')
    
    expect(faqSection || infoSection).toBeTruthy()
    
    if (faqSection) {
      const faqItems = faqSection.querySelectorAll('[data-testid="faq-item"]')
      expect(faqItems.length).toBeGreaterThan(0)
      
      faqItems.forEach((item) => {
        const question = item.querySelector('[data-testid="faq-question"]')
        const answer = item.querySelector('[data-testid="faq-answer"]')
        
        expect(question).toBeInTheDocument()
        expect(answer).toBeInTheDocument()
      })
    }
  })

  it('should be mobile responsive with clear pricing display', async () => {
    // Mobile-first design requirement for pricing information
    const planCards = getAllByTestId(membershipPageElement, 'membership-card')
    
    planCards.forEach((card) => {
      // Price should be prominently displayed
      const price = card.querySelector('[data-testid="plan-price"]')
      expect(price).toHaveClass(/price|cost|amount/)
      
      // Should be readable on mobile (larger text)
      const computedStyle = window.getComputedStyle(price!)
      const fontSize = parseFloat(computedStyle.fontSize)
      expect(fontSize).toBeGreaterThanOrEqual(18) // Minimum 18px for mobile readability
    })
  })

  it('should handle plan comparison functionality', async () => {
    // Enhanced UX: ability to compare plans
    const compareButton = membershipPageElement.querySelector('[data-testid="compare-plans"]')
    
    if (compareButton) {
      const planCards = getAllByTestId(membershipPageElement, 'membership-card')
      
      // Should have checkboxes or selection mechanism
      planCards.forEach((card) => {
        const selector = card.querySelector('input[type="checkbox"], [data-testid="plan-selector"]')
        expect(selector).toBeInTheDocument()
      })
    }
  })

  it('should show trial or first-time visitor offers when applicable', async () => {
    // Business requirement: attract new customers
    const trialOffer = membershipPageElement.querySelector('[data-testid="trial-offer"]')
    const newMemberOffer = membershipPageElement.querySelector('[data-testid="new-member-offer"]')
    
    if (trialOffer || newMemberOffer) {
      const offer = trialOffer || newMemberOffer
      expect(offer).toHaveTextContent(/trial|first.time|new.member|intro/i)
      
      // Should have clear terms
      const terms = offer?.querySelector('[data-testid="offer-terms"]')
      expect(terms).toBeInTheDocument()
    }
  })
})