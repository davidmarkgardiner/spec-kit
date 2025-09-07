import { defineField, defineType } from 'sanity'

// Photo schema - based on data-model.md specifications
// This implements the contract defined in sanity-content-api.yaml
export default defineType({
  name: 'photo',
  title: 'Studio Photo',
  type: 'document',
  icon: () => '📸',
  description: 'Studio facility and class imagery for gallery and marketing',
  fields: [
    defineField({
      name: 'title',
      title: 'Photo Title',
      type: 'string',
      description: 'Descriptive title for the photo',
      validation: Rule => Rule.required().min(3).max(100),
      placeholder: 'Main yoga studio space',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'High-resolution studio photo',
      validation: Rule => Rule.required(),
      options: {
        hotspot: true,
        crop: true,
        metadata: ['blurhash', 'lqip', 'palette'],
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Detailed description for screen readers and accessibility',
          validation: Rule => Rule.required().min(10).max(200),
          placeholder: 'Bright, spacious yoga studio with natural lighting and bamboo floors',
        }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Photo Category',
      type: 'string',
      description: 'Type of photo for organization and filtering',
      options: {
        list: [
          { title: 'Studio Space', value: 'studio-space' },
          { title: 'Equipment', value: 'equipment' },
          { title: 'Classes in Session', value: 'classes-in-session' },
          { title: 'Exterior', value: 'exterior' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Photo',
      type: 'boolean',
      description: 'Display in homepage/featured sections (max 6 per category)',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Manual ordering within category (lower numbers first)',
      validation: Rule => Rule.integer().min(0),
      initialValue: 0,
    }),
    defineField({
      name: 'photographer',
      title: 'Photographer',
      type: 'string',
      description: 'Photo credit (optional)',
      validation: Rule => Rule.max(100),
      placeholder: 'Jane Smith Photography',
    }),
    defineField({
      name: 'dateTaken',
      title: 'Date Taken',
      type: 'date',
      description: 'When the photo was captured',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Keywords for searching and filtering',
      of: [
        {
          type: 'string',
          validation: Rule => Rule.max(30),
        },
      ],
      validation: Rule => Rule.max(10),
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
      description: 'Optional caption or description for display',
      validation: Rule => Rule.max(300),
      rows: 2,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this photo should be displayed on the site',
      initialValue: true,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Title for search engines (optional, defaults to photo title)',
      validation: Rule => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      description: 'Description for search engines (optional)',
      validation: Rule => Rule.max(160),
      rows: 2,
    }),
  ],
  orderings: [
    {
      title: 'Category, then Sort Order',
      name: 'categoryAndSort',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'sortOrder', direction: 'asc' },
        { field: 'title', direction: 'asc' },
      ],
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'category', direction: 'asc' },
        { field: 'sortOrder', direction: 'asc' },
      ],
    },
    {
      title: 'Date Taken (Newest First)',
      name: 'dateDesc',
      by: [
        { field: 'dateTaken', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      image: 'image',
      featured: 'featured',
      isActive: 'isActive',
      photographer: 'photographer',
    },
    prepare(selection) {
      const { title, category, image, featured, isActive, photographer } = selection
      
      const badges = []
      if (featured) badges.push('⭐ Featured')
      if (!isActive) badges.push('❌ Inactive')
      
      const categoryLabels: { [key: string]: string } = {
        'studio-space': 'Studio Space',
        'equipment': 'Equipment',
        'classes-in-session': 'Classes',
        'exterior': 'Exterior',
      }
      
      const subtitle = [
        categoryLabels[category] || category,
        photographer ? `by ${photographer}` : null,
        badges.join(' '),
      ].filter(Boolean).join(' • ')
      
      return {
        title,
        subtitle,
        media: image || (() => '📸'),
      }
    },
  },
  // Add validation to limit featured photos per category
  validation: (Rule) =>
    Rule.custom(async (document: any, context) => {
      if (!document?.featured) return true
      
      const { getClient } = context
      const client = getClient({ apiVersion: '2024-01-01' })
      
      // Query for other featured photos in the same category
      const query = `count(*[_type == "photo" && 
                              _id != $id && 
                              featured == true && 
                              category == $category &&
                              isActive == true])`
      
      const featuredCount = await client.fetch(query, {
        id: document._id,
        category: document.category,
      })
      
      if (featuredCount >= 6) {
        return `Maximum 6 featured photos per category. There are already ${featuredCount} featured ${document.category} photos.`
      }
      
      return true
    }),
  // Define initial value for new photos
  initialValue: {
    isActive: true,
    featured: false,
    sortOrder: 0,
  },
})