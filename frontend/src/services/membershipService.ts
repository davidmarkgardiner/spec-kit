// Membership plans service - manages membership and pricing data from Sanity CMS
// Implements the contract defined in membership-plans.test.ts

import { sanityFetch, type SanityDocument } from '../lib/sanity'

// Mock membership plans
const mockMembershipPlans = [
  {
    _id: 'mock-monthly',
    _type: 'membershipPlan',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    name: 'Monthly Unlimited',
    description: 'Unlimited classes for one month',
    price: 99,
    billingCycle: 'monthly' as const,
    duration: 1,
    classesIncluded: null,
    benefits: ['Unlimited classes', 'Mat rental included', 'Guest passes'],
    restrictions: null,
    isPopular: true,
    isActive: true,
    sortOrder: 1
  },
  {
    _id: 'mock-annual',
    _type: 'membershipPlan',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    name: 'Annual Membership',
    description: 'Best value - unlimited classes for a full year',
    price: 999,
    billingCycle: 'annual' as const,
    duration: 12,
    classesIncluded: null,
    benefits: ['Unlimited classes', 'Mat rental included', '10 guest passes', 'Workshop discounts'],
    restrictions: null,
    isPopular: false,
    isActive: true,
    sortOrder: 2
  },
  {
    _id: 'mock-dropin',
    _type: 'membershipPlan',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    name: 'Drop-in Class',
    description: 'Single class pass',
    price: 25,
    billingCycle: 'drop-in' as const,
    duration: null,
    classesIncluded: 1,
    benefits: ['Single class entry', 'Mat rental included'],
    restrictions: 'Expires after 24 hours',
    isPopular: false,
    isActive: true,
    sortOrder: 3
  }
]

// Type definitions based on membership plans contract
export interface MembershipPlan extends SanityDocument {
  name: string
  description?: string
  price: number
  billingCycle: 'monthly' | 'annual' | 'drop-in'
  duration?: number | null // Contract length in months, null for ongoing
  classesIncluded?: number | null // Number of classes, null for unlimited
  benefits?: string[]
  restrictions?: string | null
  isPopular?: boolean
  isActive: boolean
  sortOrder?: number
  stripePriceId?: string
}

// GROQ queries for membership plans
const membershipPlansQuery = `
  *[_type == "membershipPlan" && isActive == true] | order(sortOrder asc, name asc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    name,
    description,
    price,
    billingCycle,
    duration,
    classesIncluded,
    benefits,
    restrictions,
    isPopular,
    isActive,
    sortOrder,
    stripePriceId
  }
`

const popularPlansQuery = `
  *[_type == "membershipPlan" && isActive == true && isPopular == true] | order(sortOrder asc, name asc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    name,
    description,
    price,
    billingCycle,
    duration,
    classesIncluded,
    benefits,
    restrictions,
    isPopular,
    isActive,
    sortOrder,
    stripePriceId
  }
`

const plansByBillingCycleQuery = `
  *[_type == "membershipPlan" && isActive == true && billingCycle == $billingCycle] | order(sortOrder asc, name asc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    name,
    description,
    price,
    billingCycle,
    duration,
    classesIncluded,
    benefits,
    restrictions,
    isPopular,
    isActive,
    sortOrder,
    stripePriceId
  }
`

// Service class for membership plans operations
export class MembershipService {
  /**
   * Get all active membership plans
   */
  static async getMembershipPlans(options?: { preview?: boolean }): Promise<MembershipPlan[]> {
    try {
      const result = await sanityFetch<MembershipPlan[]>(
        membershipPlansQuery,
        {},
        {
          preview: options?.preview,
          tag: 'membership-plans'
        }
      )

      return result || mockMembershipPlans
    } catch (error) {
      console.error('Failed to fetch membership plans, using mock data:', error)
      return mockMembershipPlans
    }
  }

  /**
   * Get membership plan by ID
   */
  static async getMembershipPlanById(id: string, options?: { preview?: boolean }): Promise<MembershipPlan | null> {
    try {
      const query = `
        *[_type == "membershipPlan" && _id == $id && isActive == true][0] {
          _id,
          _type,
          _createdAt,
          _updatedAt,
          _rev,
          name,
          description,
          price,
          billingCycle,
          duration,
          classesIncluded,
          benefits,
          restrictions,
          isPopular,
          isActive,
          sortOrder,
          stripePriceId
        }
      `

      const result = await sanityFetch<MembershipPlan>(
        query,
        { id },
        {
          preview: options?.preview,
          tag: 'membership-plan'
        }
      )

      return result
    } catch (error) {
      console.error('Failed to fetch membership plan by ID:', error)
      throw new Error('Unable to load membership plan')
    }
  }

  /**
   * Get popular/featured membership plans
   */
  static async getPopularPlans(options?: { preview?: boolean }): Promise<MembershipPlan[]> {
    try {
      const result = await sanityFetch<MembershipPlan[]>(
        popularPlansQuery,
        {},
        {
          preview: options?.preview,
          tag: 'popular-plans'
        }
      )

      return result || mockMembershipPlans.filter(plan => plan.isPopular)
    } catch (error) {
      console.error('Failed to fetch popular plans, using mock data:', error)
      return mockMembershipPlans.filter(plan => plan.isPopular)
    }
  }

  /**
   * Get membership plans by billing cycle
   */
  static async getPlansByBillingCycle(
    billingCycle: 'monthly' | 'annual' | 'drop-in',
    options?: { preview?: boolean }
  ): Promise<MembershipPlan[]> {
    try {
      const result = await sanityFetch<MembershipPlan[]>(
        plansByBillingCycleQuery,
        { billingCycle },
        {
          preview: options?.preview,
          tag: `plans-${billingCycle}`
        }
      )

      return result || []
    } catch (error) {
      console.error(`Failed to fetch ${billingCycle} plans:`, error)
      throw new Error(`Unable to load ${billingCycle} plans`)
    }
  }

  /**
   * Get membership plans grouped by billing cycle
   */
  static async getPlansGroupedByBillingCycle(options?: { preview?: boolean }): Promise<{
    monthly: MembershipPlan[]
    annual: MembershipPlan[]
    dropIn: MembershipPlan[]
  }> {
    try {
      const allPlans = await this.getMembershipPlans(options)
      
      return {
        monthly: allPlans.filter(plan => plan.billingCycle === 'monthly'),
        annual: allPlans.filter(plan => plan.billingCycle === 'annual'),
        dropIn: allPlans.filter(plan => plan.billingCycle === 'drop-in')
      }
    } catch (error) {
      console.error('Failed to group plans by billing cycle:', error)
      throw new Error('Unable to load grouped plans')
    }
  }

  /**
   * Calculate price comparison between plans
   */
  static comparePlans(plan1: MembershipPlan, plan2: MembershipPlan): {
    monthlyPriceDifference: number
    yearlyPriceDifference: number
    betterValue: string | null
  } {
    const getMonthlyEquivalent = (plan: MembershipPlan): number => {
      switch (plan.billingCycle) {
        case 'monthly':
          return plan.price
        case 'annual':
          return plan.price / 12
        case 'drop-in':
          // Assume 4 classes per month for drop-in
          return plan.price * 4
        default:
          return plan.price
      }
    }

    const plan1Monthly = getMonthlyEquivalent(plan1)
    const plan2Monthly = getMonthlyEquivalent(plan2)
    
    const monthlyDiff = plan1Monthly - plan2Monthly
    const yearlyDiff = monthlyDiff * 12
    
    let betterValue: string | null = null
    if (Math.abs(monthlyDiff) > 0.01) {
      betterValue = monthlyDiff < 0 ? plan1.name : plan2.name
    }

    return {
      monthlyPriceDifference: monthlyDiff,
      yearlyPriceDifference: yearlyDiff,
      betterValue
    }
  }

  /**
   * Calculate estimated monthly savings for annual plans
   */
  static calculateAnnualSavings(annualPlan: MembershipPlan, monthlyPlan?: MembershipPlan): {
    monthlySavings: number
    annualSavings: number
    savingsPercentage: number
  } | null {
    if (annualPlan.billingCycle !== 'annual') return null
    
    let monthlyPrice: number
    
    if (monthlyPlan && monthlyPlan.billingCycle === 'monthly') {
      monthlyPrice = monthlyPlan.price
    } else {
      // Estimate monthly price as 1/12 of annual + 20% premium
      monthlyPrice = (annualPlan.price / 12) * 1.2
    }
    
    const annualEquivalent = monthlyPrice * 12
    const actualAnnual = annualPlan.price
    
    const annualSavings = annualEquivalent - actualAnnual
    const monthlySavings = annualSavings / 12
    const savingsPercentage = (annualSavings / annualEquivalent) * 100
    
    return {
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      annualSavings: Math.round(annualSavings * 100) / 100,
      savingsPercentage: Math.round(savingsPercentage)
    }
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, billingCycle: string): string {
    const formatted = `$${price.toFixed(2)}`
    
    switch (billingCycle) {
      case 'monthly':
        return `${formatted}/month`
      case 'annual':
        return `${formatted}/year`
      case 'drop-in':
        return `${formatted}/class`
      default:
        return formatted
    }
  }

  /**
   * Get plan duration display text
   */
  static formatDuration(duration?: number | null): string {
    if (!duration) return 'No commitment'
    
    if (duration === 1) return '1 month commitment'
    if (duration < 12) return `${duration} months commitment`
    if (duration === 12) return '1 year commitment'
    
    const years = Math.floor(duration / 12)
    const months = duration % 12
    
    if (months === 0) {
      return years === 1 ? '1 year commitment' : `${years} years commitment`
    }
    
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''} commitment`
  }

  /**
   * Get classes included display text
   */
  static formatClassesIncluded(classesIncluded?: number | null): string {
    if (!classesIncluded) return 'Unlimited classes'
    if (classesIncluded === 1) return '1 class'
    return `${classesIncluded} classes`
  }

  /**
   * Calculate value metrics for a plan
   */
  static calculatePlanValue(plan: MembershipPlan): {
    pricePerClass: number | null
    monthlyEquivalent: number
    valueScore: number // 1-100, higher is better value
  } {
    let pricePerClass: number | null = null
    let monthlyEquivalent: number
    
    switch (plan.billingCycle) {
      case 'monthly':
        monthlyEquivalent = plan.price
        pricePerClass = plan.classesIncluded 
          ? plan.price / plan.classesIncluded 
          : plan.price / 8 // Assume 8 classes per month for unlimited
        break
        
      case 'annual':
        monthlyEquivalent = plan.price / 12
        pricePerClass = plan.classesIncluded 
          ? plan.price / (plan.classesIncluded * 12)
          : monthlyEquivalent / 8
        break
        
      case 'drop-in':
        monthlyEquivalent = plan.price * 4 // Assume 4 classes per month
        pricePerClass = plan.price
        break
        
      default:
        monthlyEquivalent = plan.price
        pricePerClass = null
    }
    
    // Calculate value score (lower price per class = higher score)
    let valueScore = 50 // Base score
    
    if (pricePerClass) {
      // Adjust score based on price per class (assuming $25 is average)
      const averagePricePerClass = 25
      const priceDifference = averagePricePerClass - pricePerClass
      valueScore += Math.min(Math.max(priceDifference * 2, -40), 40)
    }
    
    // Bonus points for popular plans and unlimited classes
    if (plan.isPopular) valueScore += 10
    if (!plan.classesIncluded) valueScore += 15 // Unlimited classes bonus
    if (plan.benefits && plan.benefits.length > 3) valueScore += 5
    
    return {
      pricePerClass: pricePerClass ? Math.round(pricePerClass * 100) / 100 : null,
      monthlyEquivalent: Math.round(monthlyEquivalent * 100) / 100,
      valueScore: Math.min(Math.max(Math.round(valueScore), 1), 100)
    }
  }

  /**
   * Get recommended plan based on user preferences
   */
  static getRecommendedPlan(
    plans: MembershipPlan[],
    preferences: {
      budget?: number
      frequency?: 'light' | 'moderate' | 'heavy' // Classes per week
      commitment?: 'flexible' | 'short' | 'long'
    }
  ): MembershipPlan | null {
    if (!plans || plans.length === 0) return null
    
    let scored = plans.map(plan => {
      let score = 0
      const value = this.calculatePlanValue(plan)
      
      // Budget consideration
      if (preferences.budget) {
        const budgetDiff = preferences.budget - value.monthlyEquivalent
        if (budgetDiff >= 0) {
          score += Math.min(budgetDiff, 50) // Bonus for being under budget
        } else {
          score += budgetDiff * 2 // Penalty for being over budget
        }
      }
      
      // Frequency consideration
      if (preferences.frequency) {
        switch (preferences.frequency) {
          case 'light': // 1-2 classes per week
            if (plan.billingCycle === 'drop-in') score += 30
            else if (plan.classesIncluded && plan.classesIncluded <= 8) score += 20
            break
            
          case 'moderate': // 2-4 classes per week
            if (plan.classesIncluded && plan.classesIncluded >= 8 && plan.classesIncluded <= 16) score += 30
            else if (!plan.classesIncluded) score += 20 // Unlimited
            break
            
          case 'heavy': // 4+ classes per week
            if (!plan.classesIncluded) score += 40 // Unlimited is best
            else if (plan.classesIncluded >= 16) score += 20
            break
        }
      }
      
      // Commitment consideration
      if (preferences.commitment) {
        switch (preferences.commitment) {
          case 'flexible':
            if (!plan.duration || plan.duration <= 1) score += 30
            else score -= plan.duration * 2
            break
            
          case 'short':
            if (plan.duration && plan.duration >= 3 && plan.duration <= 6) score += 30
            break
            
          case 'long':
            if (plan.duration && plan.duration >= 12) score += 40
            else if (plan.billingCycle === 'annual') score += 30
            break
        }
      }
      
      // Add value score
      score += value.valueScore
      
      // Popular plan bonus
      if (plan.isPopular) score += 15
      
      return { plan, score }
    })
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score)
    
    return scored[0]?.plan || null
  }

  /**
   * Validate membership plan data structure
   */
  static validateMembershipPlan(data: any): data is MembershipPlan {
    if (!data || typeof data !== 'object') return false
    
    const required = ['name', 'price', 'billingCycle', 'isActive']
    
    return required.every(field => {
      if (field === 'price') {
        return typeof data[field] === 'number' && data[field] >= 0
      }
      
      if (field === 'billingCycle') {
        return ['monthly', 'annual', 'drop-in'].includes(data[field])
      }
      
      if (field === 'isActive') {
        return typeof data[field] === 'boolean'
      }
      
      return typeof data[field] === 'string' && data[field].length > 0
    })
  }

  /**
   * Check if plan has Stripe integration
   */
  static hasStripeIntegration(plan: MembershipPlan): boolean {
    return !!(plan.stripePriceId && plan.stripePriceId.startsWith('price_'))
  }
}

// Default export for direct import
export default MembershipService

// Named export functions for individual use
export const {
  getMembershipPlans,
  getMembershipPlanById,
  getPopularPlans,
  getPlansByBillingCycle,
  getPlansGroupedByBillingCycle,
  comparePlans,
  calculateAnnualSavings,
  formatPrice,
  formatDuration,
  formatClassesIncluded,
  calculatePlanValue,
  getRecommendedPlan,
  validateMembershipPlan,
  hasStripeIntegration
} = MembershipService