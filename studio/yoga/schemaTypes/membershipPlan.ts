import { defineField, defineType } from 'sanity'

// MembershipPlan schema - based on data-model.md specifications  
// This implements the contract defined in sanity-content-api.yaml
export default defineType({
  name: 'membershipPlan',
  title: 'Membership Plan',
  type: 'document',
  icon: () => '💳',
  description: 'Pricing and membership option configurations',
  fields: [
    defineField({
      name: 'name',
      title: 'Plan Name',
      type: 'string',
      description: 'Name of the membership plan (e.g., "Monthly Unlimited")',
      validation: Rule => Rule.required().min(3).max(50),
      placeholder: 'Monthly Unlimited',
    }),
    defineField({
      name: 'description',
      title: 'Plan Description',
      type: 'text',
      description: 'Detailed description of plan benefits and features',
      validation: Rule => Rule.max(500),
      rows: 3,
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price in dollars (without currency symbol)',
      validation: Rule => Rule.required().positive().precision(2),
      placeholder: 99.99,
    }),
    defineField({
      name: 'billingCycle',
      title: 'Billing Cycle',
      type: 'string',
      description: 'How often the customer is billed',
      options: {
        list: [
          { title: 'Monthly', value: 'monthly' },
          { title: 'Annual', value: 'annual' },
          { title: 'Drop-in (per class)', value: 'drop-in' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Contract Duration (months)',
      type: 'number',
      description: 'Contract length in months (leave empty for ongoing/month-to-month)',
      validation: Rule => Rule.positive().integer().min(1).max(60),
    }),
    defineField({
      name: 'classesIncluded',
      title: 'Classes Included',
      type: 'number',
      description: 'Number of classes included (leave empty for unlimited)',
      validation: Rule => Rule.positive().integer().min(1),
    }),
    defineField({
      name: 'benefits',
      title: 'Plan Benefits',
      type: 'array',
      description: 'List of benefits and features included in this plan',
      of: [
        {
          type: 'string',
          validation: Rule => Rule.required().min(3).max(100),
        },
      ],
      validation: Rule => Rule.max(10),
    }),
    defineField({
      name: 'restrictions',
      title: 'Plan Restrictions',
      type: 'text',
      description: 'Any usage limitations or terms and conditions',
      validation: Rule => Rule.max(300),
      rows: 2,
    }),
    defineField({
      name: 'isPopular',
      title: 'Popular Plan',
      type: 'boolean',
      description: 'Mark as popular/recommended plan (only one per billing cycle should be popular)',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this plan is currently available for purchase',
      initialValue: true,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Order in which to display this plan (lower numbers first)',
      validation: Rule => Rule.integer().min(0),
      initialValue: 0,
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'Stripe price ID for payment integration (optional)',
      validation: Rule => Rule.regex(/^price_[a-zA-Z0-9]+$/, {
        name: 'Stripe Price ID',
        invert: false,
      }).optional(),
      hidden: ({ document }) => !document?.billingCycle || document.billingCycle === 'drop-in',
    }),
  ],
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [
        { field: 'sortOrder', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
    },
    {
      title: 'Price (Low to High)',
      name: 'priceAsc',
      by: [
        { field: 'price', direction: 'asc' },
      ],
    },
    {
      title: 'Price (High to Low)',
      name: 'priceDesc',
      by: [
        { field: 'price', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      name: 'name',
      price: 'price',
      billingCycle: 'billingCycle',
      isPopular: 'isPopular',
      isActive: 'isActive',
      classesIncluded: 'classesIncluded',
    },
    prepare(selection) {
      const { name, price, billingCycle, isPopular, isActive, classesIncluded } = selection
      
      const formatPrice = (price: number, cycle: string) => {
        const formatted = `$${price.toFixed(2)}`
        switch (cycle) {
          case 'monthly': return `${formatted}/mo`
          case 'annual': return `${formatted}/yr`
          case 'drop-in': return `${formatted}/class`
          default: return formatted
        }
      }

      const classesText = classesIncluded ? `${classesIncluded} classes` : 'Unlimited classes'
      const badges = []
      if (isPopular) badges.push('⭐ Popular')
      if (!isActive) badges.push('❌ Inactive')
      
      return {
        title: name,
        subtitle: `${formatPrice(price, billingCycle)} • ${classesText}${badges.length ? ' • ' + badges.join(' ') : ''}`,
        media: () => isPopular ? '⭐' : '💳',
      }
    },
  },
  // Add validation to ensure only one popular plan per billing cycle
  validation: (Rule) =>
    Rule.custom(async (document: any, context) => {
      if (!document?.isPopular) return true
      
      const { getClient } = context
      const client = getClient({ apiVersion: '2024-01-01' })
      
      // Query for other popular plans with the same billing cycle
      const query = `*[_type == "membershipPlan" && 
                      _id != $id && 
                      isPopular == true && 
                      billingCycle == $billingCycle &&
                      isActive == true]`
      
      const existingPopular = await client.fetch(query, {
        id: document._id,
        billingCycle: document.billingCycle,
      })
      
      if (existingPopular.length > 0) {
        return `Only one plan per billing cycle can be marked as popular. There is already a popular ${document.billingCycle} plan.`
      }
      
      return true
    }),
})