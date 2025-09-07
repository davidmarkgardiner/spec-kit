// Schema configuration and utilities for Sanity CMS
// Provides consistent configuration across all document types

import { StructureResolver } from 'sanity/structure'

// Document type configurations
export const singletonTypes = new Set(['studioInfo'])

// Custom structure for Sanity Studio desk
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Yoga Studio Content')
    .items([
      // Singleton documents (only one allowed)
      S.listItem()
        .title('Studio Information')
        .icon(() => '🏢')
        .child(
          S.document()
            .schemaType('studioInfo')
            .documentId('studioInfo')
            .title('Studio Information')
        ),
      
      S.divider(),
      
      // Collection documents
      S.listItem()
        .title('Membership Plans')
        .icon(() => '💳')
        .child(
          S.documentTypeList('membershipPlan')
            .title('Membership Plans')
            .defaultOrdering([{ field: 'sortOrder', direction: 'asc' }])
        ),
      
      S.listItem()
        .title('Instructors')
        .icon(() => '🧘‍♀️')
        .child(
          S.documentTypeList('instructor')
            .title('Instructors')
            .defaultOrdering([{ field: 'name', direction: 'asc' }])
        ),
      
      S.listItem()
        .title('Photo Gallery')
        .icon(() => '📸')
        .child(
          S.documentTypeList('photo')
            .title('Photo Gallery')
            .defaultOrdering([{ field: 'category', direction: 'asc' }, { field: 'sortOrder', direction: 'asc' }])
        ),
      
      S.divider(),
      
      // Filtered views
      S.listItem()
        .title('Active Instructors')
        .icon(() => '✅')
        .child(
          S.documentTypeList('instructor')
            .title('Active Instructors')
            .filter('_type == "instructor" && isActive == true')
            .defaultOrdering([{ field: 'name', direction: 'asc' }])
        ),
      
      S.listItem()
        .title('Featured Photos')
        .icon(() => '⭐')
        .child(
          S.documentTypeList('photo')
            .title('Featured Photos')
            .filter('_type == "photo" && featured == true && isActive == true')
            .defaultOrdering([{ field: 'category', direction: 'asc' }, { field: 'sortOrder', direction: 'asc' }])
        ),
      
      S.listItem()
        .title('Popular Plans')
        .icon(() => '🌟')
        .child(
          S.documentTypeList('membershipPlan')
            .title('Popular Plans')
            .filter('_type == "membershipPlan" && isPopular == true && isActive == true')
            .defaultOrdering([{ field: 'billingCycle', direction: 'asc' }])
        ),
    ])

// Preview configurations for different content types
export const previewConfig = {
  studioInfo: {
    select: {
      title: 'name',
      subtitle: 'tagline',
      media: 'logo',
    },
  },
  membershipPlan: {
    select: {
      title: 'name',
      price: 'price',
      billingCycle: 'billingCycle',
      isPopular: 'isPopular',
    },
    prepare: ({ title, price, billingCycle, isPopular }: any) => ({
      title,
      subtitle: `$${price}/${billingCycle === 'drop-in' ? 'class' : billingCycle === 'monthly' ? 'mo' : 'yr'}${isPopular ? ' ⭐' : ''}`,
    }),
  },
  instructor: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'photo',
      isActive: 'isActive',
    },
    prepare: ({ title, subtitle, media, isActive }: any) => ({
      title,
      subtitle: `${subtitle || 'Instructor'}${!isActive ? ' (Inactive)' : ''}`,
      media,
    }),
  },
  photo: {
    select: {
      title: 'title',
      category: 'category',
      featured: 'featured',
      media: 'image',
    },
    prepare: ({ title, category, featured, media }: any) => ({
      title,
      subtitle: `${category}${featured ? ' ⭐ Featured' : ''}`,
      media,
    }),
  },
}

// Field group configurations for better organization
export const fieldGroups = {
  contact: {
    name: 'contact',
    title: 'Contact Information',
    default: true,
  },
  social: {
    name: 'social',
    title: 'Social Media',
  },
  schedule: {
    name: 'schedule',
    title: 'Schedule & Availability',
  },
  pricing: {
    name: 'pricing',
    title: 'Pricing & Billing',
  },
  content: {
    name: 'content',
    title: 'Content',
    default: true,
  },
  media: {
    name: 'media',
    title: 'Images & Media',
  },
  seo: {
    name: 'seo',
    title: 'SEO & Metadata',
  },
  settings: {
    name: 'settings',
    title: 'Settings',
  },
}

// Common field configurations
export const commonFields = {
  isActive: {
    name: 'isActive',
    title: 'Active',
    type: 'boolean',
    description: 'Whether this item is currently active and should be displayed',
    initialValue: true,
    group: 'settings',
  },
  sortOrder: {
    name: 'sortOrder',
    title: 'Sort Order',
    type: 'number',
    description: 'Order for display (lower numbers appear first)',
    initialValue: 0,
    group: 'settings',
  },
  seoTitle: {
    name: 'seoTitle',
    title: 'SEO Title',
    type: 'string',
    description: 'Title for search engines (optional)',
    validation: (Rule: any) => Rule.max(60),
    group: 'seo',
  },
  seoDescription: {
    name: 'seoDescription',
    title: 'SEO Description',
    type: 'text',
    description: 'Description for search engines (optional)',
    validation: (Rule: any) => Rule.max(160),
    rows: 2,
    group: 'seo',
  },
}

// Validation helpers
export const createUniqueValidation = (docType: string, field: string) => {
  return async (value: string, context: any) => {
    if (!value) return true
    
    const { getClient, document } = context
    const client = getClient({ apiVersion: '2024-01-01' })
    
    const query = `count(*[_type == $docType && ${field} == $value && _id != $id])`
    
    const count = await client.fetch(query, {
      docType,
      value,
      id: document._id,
    })
    
    return count === 0 ? true : `${field} must be unique`
  }
}

// Image optimization settings
export const imageOptions = {
  hotspot: true,
  crop: true,
  metadata: ['blurhash', 'lqip', 'palette', 'location', 'exif'],
  sources: [
    {
      source: 'cloudinary',
      // Add Cloudinary configuration if needed
    },
  ],
}

// Rich text configurations
export const richTextConfig = {
  basic: {
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'H3', value: 'h3' },
    ],
    marks: {
      decorators: [
        { title: 'Bold', value: 'strong' },
        { title: 'Italic', value: 'em' },
      ],
    },
  },
  extended: {
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'H2', value: 'h2' },
      { title: 'H3', value: 'h3' },
      { title: 'Quote', value: 'blockquote' },
    ],
    marks: {
      decorators: [
        { title: 'Bold', value: 'strong' },
        { title: 'Italic', value: 'em' },
        { title: 'Underline', value: 'underline' },
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            {
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (Rule: any) => Rule.uri({ allowRelative: false, scheme: ['http', 'https'] }),
            },
          ],
        },
      ],
    },
  },
}

export default {
  structure,
  singletonTypes,
  previewConfig,
  fieldGroups,
  commonFields,
  createUniqueValidation,
  imageOptions,
  richTextConfig,
}