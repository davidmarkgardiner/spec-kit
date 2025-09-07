import { defineField, defineType } from 'sanity'

// Instructor schema - based on data-model.md specifications
// This implements the contract defined in sanity-content-api.yaml
export default defineType({
  name: 'instructor',
  title: 'Instructor',
  type: 'document',
  icon: () => '🧘‍♀️',
  description: 'Yoga instructor profiles and information',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      description: 'Full instructor name as displayed publicly',
      validation: Rule => Rule.required().min(2).max(100),
      placeholder: 'Sarah Johnson',
    }),
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      description: 'First name for personalized display',
      validation: Rule => Rule.required().min(1).max(50),
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      description: 'Last name for formal references',
      validation: Rule => Rule.required().min(1).max(50),
    }),
    defineField({
      name: 'title',
      title: 'Title/Credentials',
      type: 'string',
      description: 'Professional title and main certifications (e.g., "RYT-500, Senior Instructor")',
      validation: Rule => Rule.max(100),
      placeholder: 'RYT-500, Senior Instructor',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'array',
      description: 'Professional background and teaching philosophy (minimum 100 characters)',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H3', value: 'h3' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
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
                    validation: Rule => Rule.uri({ allowRelative: false, scheme: ['http', 'https'] }),
                  },
                ],
              },
            ],
          },
        },
      ],
      validation: Rule => Rule.required().custom((bio) => {
        if (!bio || !Array.isArray(bio)) return 'Bio is required'
        
        // Calculate text length from blocks
        let textLength = 0
        bio.forEach((block: any) => {
          if (block._type === 'block' && block.children) {
            block.children.forEach((child: any) => {
              if (child._type === 'span' && child.text) {
                textLength += child.text.length
              }
            })
          }
        })
        
        if (textLength < 100) {
          return 'Bio must be at least 100 characters long'
        }
        
        return true
      }),
    }),
    defineField({
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      description: 'High-quality professional headshot',
      validation: Rule => Rule.required(),
      options: {
        hotspot: true,
        crop: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Descriptive text for screen readers',
          validation: Rule => Rule.required().min(10).max(100),
          placeholder: 'Portrait of Sarah Johnson, yoga instructor',
        }),
      ],
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications',
      type: 'array',
      description: 'Yoga certifications and credentials',
      of: [
        {
          type: 'string',
          validation: Rule => Rule.required().min(3).max(100),
        },
      ],
      validation: Rule => Rule.max(10),
    }),
    defineField({
      name: 'specialties',
      title: 'Teaching Specialties',
      type: 'array',
      description: 'Yoga styles and specialties (at least one required)',
      of: [
        {
          type: 'string',
          options: {
            list: [
              { title: 'Vinyasa Flow', value: 'Vinyasa Flow' },
              { title: 'Hatha Yoga', value: 'Hatha Yoga' },
              { title: 'Yin Yoga', value: 'Yin Yoga' },
              { title: 'Restorative Yoga', value: 'Restorative Yoga' },
              { title: 'Power Yoga', value: 'Power Yoga' },
              { title: 'Hot Yoga', value: 'Hot Yoga' },
              { title: 'Meditation', value: 'Meditation' },
              { title: 'Breathwork', value: 'Breathwork' },
              { title: 'Prenatal Yoga', value: 'Prenatal Yoga' },
              { title: 'Iyengar Yoga', value: 'Iyengar Yoga' },
              { title: 'Kundalini Yoga', value: 'Kundalini Yoga' },
              { title: 'Ashtanga Yoga', value: 'Ashtanga Yoga' },
            ],
          },
        },
      ],
      validation: Rule => Rule.required().min(1).max(8),
    }),
    defineField({
      name: 'experience',
      title: 'Years of Experience',
      type: 'number',
      description: 'Number of years teaching yoga',
      validation: Rule => Rule.integer().min(0).max(50),
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      description: 'Direct instructor contact email (optional)',
      validation: Rule => Rule.email().optional(),
      placeholder: 'sarah@studio.com',
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'array',
      description: 'Personal social media profiles',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'Twitter', value: 'twitter' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'LinkedIn', value: 'linkedin' },
                ],
              },
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Profile URL',
              type: 'url',
              validation: Rule => Rule.required().uri({
                allowRelative: false,
                scheme: ['http', 'https'],
              }),
            }),
          ],
          preview: {
            select: {
              platform: 'platform',
              url: 'url',
            },
            prepare(selection) {
              const { platform, url } = selection
              const icons: { [key: string]: string } = {
                instagram: '📷',
                facebook: '📘',
                twitter: '🐦',
                youtube: '📹',
                tiktok: '🎵',
                linkedin: '💼',
              }
              
              return {
                title: platform,
                subtitle: url,
                media: () => icons[platform] || '📱',
              }
            },
          },
        },
      ],
      validation: Rule => Rule.max(5),
    }),
    defineField({
      name: 'isActive',
      title: 'Active Instructor',
      type: 'boolean',
      description: 'Whether this instructor is currently teaching at the studio',
      initialValue: true,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'featuredOrder',
      title: 'Featured Order',
      type: 'number',
      description: 'Order for featuring instructor (lower numbers shown first, leave empty to not feature)',
      validation: Rule => Rule.integer().min(0),
    }),
    defineField({
      name: 'schedule',
      title: 'Class Schedule',
      type: 'array',
      description: 'Regular class schedule (optional)',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'day',
              title: 'Day',
              type: 'string',
              options: {
                list: [
                  { title: 'Monday', value: 'monday' },
                  { title: 'Tuesday', value: 'tuesday' },
                  { title: 'Wednesday', value: 'wednesday' },
                  { title: 'Thursday', value: 'thursday' },
                  { title: 'Friday', value: 'friday' },
                  { title: 'Saturday', value: 'saturday' },
                  { title: 'Sunday', value: 'sunday' },
                ],
              },
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'time',
              title: 'Time',
              type: 'string',
              validation: Rule => Rule.required(),
              placeholder: '9:00 AM',
            }),
            defineField({
              name: 'class',
              title: 'Class Type',
              type: 'string',
              validation: Rule => Rule.required(),
              placeholder: 'Vinyasa Flow',
            }),
          ],
          preview: {
            select: {
              day: 'day',
              time: 'time',
              class: 'class',
            },
            prepare(selection) {
              const { day, time, class: className } = selection
              const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1)
              
              return {
                title: `${dayCapitalized} ${time}`,
                subtitle: className,
                media: () => '📅',
              }
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [
        { field: 'name', direction: 'asc' },
      ],
    },
    {
      title: 'Featured Order',
      name: 'featuredOrder',
      by: [
        { field: 'featuredOrder', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      name: 'name',
      title: 'title',
      photo: 'photo',
      isActive: 'isActive',
      experience: 'experience',
      specialties: 'specialties',
    },
    prepare(selection) {
      const { name, title, photo, isActive, experience, specialties } = selection
      
      const badges = []
      if (!isActive) badges.push('❌ Inactive')
      
      const subtitle = [
        title,
        experience ? `${experience} years exp.` : null,
        specialties && specialties.length > 0 ? specialties[0] : null,
        badges.join(' '),
      ].filter(Boolean).join(' • ')
      
      return {
        title: name,
        subtitle,
        media: photo || (() => '🧘‍♀️'),
      }
    },
  },
})