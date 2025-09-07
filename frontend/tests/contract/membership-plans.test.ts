import { describe, it, expect } from 'vitest'

// Contract test for membership plans API - based on sanity-content-api.yaml
// This test MUST FAIL initially (TDD RED phase)
describe('Membership Plans API Contract', () => {
  const mockMembershipPlan = {
    name: 'Monthly Unlimited',
    description: 'Unlimited classes with premium benefits',
    price: 99.99,
    billingCycle: 'monthly',
    duration: 12,
    classesIncluded: null, // unlimited
    benefits: ['Unlimited classes', 'Guest passes', 'Workshop discounts'],
    restrictions: 'Valid at all locations',
    isPopular: true,
    isActive: true
  }

  it('should fetch active membership plans with correct structure', async () => {
    // This will fail until we implement the membership service
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    // Should return an array
    expect(Array.isArray(plans)).toBe(true)
    expect(plans.length).toBeGreaterThan(0)
    
    // Each plan should have required fields per contract
    plans.forEach((plan: any) => {
      expect(plan).toHaveProperty('name')
      expect(plan).toHaveProperty('price')
      expect(plan).toHaveProperty('billingCycle')
      expect(plan).toHaveProperty('isActive')
      
      // Type validations
      expect(typeof plan.name).toBe('string')
      expect(typeof plan.price).toBe('number')
      expect(typeof plan.billingCycle).toBe('string')
      expect(typeof plan.isActive).toBe('boolean')
    })
  })

  it('should validate price is positive number', async () => {
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    plans.forEach((plan: any) => {
      expect(plan.price).toBeGreaterThan(0)
      expect(typeof plan.price).toBe('number')
    })
  })

  it('should validate billing cycle enum values', async () => {
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    const validBillingCycles = ['monthly', 'annual', 'drop-in']
    
    plans.forEach((plan: any) => {
      expect(validBillingCycles).toContain(plan.billingCycle)
    })
  })

  it('should validate duration when provided', async () => {
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    plans.forEach((plan: any) => {
      if (plan.duration !== null && plan.duration !== undefined) {
        expect(typeof plan.duration).toBe('number')
        expect(plan.duration).toBeGreaterThanOrEqual(1)
      }
    })
  })

  it('should validate classesIncluded when provided', async () => {
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    plans.forEach((plan: any) => {
      if (plan.classesIncluded !== null && plan.classesIncluded !== undefined) {
        expect(typeof plan.classesIncluded).toBe('number')
        expect(plan.classesIncluded).toBeGreaterThanOrEqual(1)
      }
    })
  })

  it('should validate benefits array when provided', async () => {
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    plans.forEach((plan: any) => {
      if (plan.benefits) {
        expect(Array.isArray(plan.benefits)).toBe(true)
        plan.benefits.forEach((benefit: any) => {
          expect(typeof benefit).toBe('string')
          expect(benefit.length).toBeGreaterThan(0)
        })
      }
    })
  })

  it('should validate boolean fields', async () => {
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    plans.forEach((plan: any) => {
      expect(typeof plan.isActive).toBe('boolean')
      
      if (plan.hasOwnProperty('isPopular')) {
        expect(typeof plan.isPopular).toBe('boolean')
      }
    })
  })

  it('should filter only active plans', async () => {
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    // All returned plans should be active
    plans.forEach((plan: any) => {
      expect(plan.isActive).toBe(true)
    })
  })

  it('should handle popular plan highlighting', async () => {
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    const popularPlans = plans.filter((plan: any) => plan.isPopular === true)
    
    // Should have at most one popular plan per billing cycle
    const billingCycles = [...new Set(popularPlans.map((plan: any) => plan.billingCycle))]
    expect(popularPlans.length).toBeLessThanOrEqual(billingCycles.length)
  })

  it('should validate string field lengths', async () => {
    const { getMembershipPlans } = await import('../../src/services/membershipService')
    
    const plans = await getMembershipPlans()
    
    plans.forEach((plan: any) => {
      // Name should not be empty
      expect(plan.name.length).toBeGreaterThan(0)
      
      // Optional fields should have reasonable lengths if present
      if (plan.description) {
        expect(plan.description.length).toBeGreaterThan(0)
        expect(plan.description.length).toBeLessThan(1000) // Reasonable limit
      }
      
      if (plan.restrictions) {
        expect(plan.restrictions.length).toBeGreaterThan(0)
      }
    })
  })
})