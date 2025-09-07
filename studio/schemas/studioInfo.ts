import { defineField, defineType } from 'sanity'

// StudioInfo schema - based on data-model.md specifications
// This implements the contract defined in sanity-content-api.yaml
export default defineType({
  name: 'studioInfo',
  title: 'Studio Information',
  type: 'document',
  icon: () => '🏢',
  description: 'Core business information displayed across the site',
  fields: [
    defineField({
      name: 'name',
      title: 'Studio Name',
      type: 'string',
      description: 'The name of your yoga studio',
      validation: Rule => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Brief studio description or motto (optional)',
      validation: Rule => Rule.max(150),
    }),
    defineField({
      name: 'description',
      title: 'Studio Description',
      type: 'text',
      description: 'Detailed studio description for homepage and about page',
      validation: Rule => Rule.required().min(50).max(500),
      rows: 4,
    }),
    defineField({
      name: 'address',
      title: 'Studio Address',
      type: 'object',
      description: 'Physical location of the studio',
      validation: Rule => Rule.required(),
      fields: [
        defineField({
          name: 'street',
          title: 'Street Address',
          type: 'string',
          validation: Rule => Rule.required().min(5).max(100),
        }),
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
          validation: Rule => Rule.required().min(2).max(50),
        }),
        defineField({
          name: 'state',
          title: 'State/Province',
          type: 'string',
          validation: Rule => Rule.required().min(2).max(50),
        }),
        defineField({
          name: 'zipCode',
          title: 'ZIP/Postal Code',
          type: 'string',
          validation: Rule => Rule.required().regex(/^\d{5}(-\d{4})?$/, {
            name: 'US ZIP code',
            invert: false,
          }),
        }),
      ],
      preview: {
        select: {
          street: 'street',
          city: 'city',
          state: 'state',
        },
        prepare(selection) {
          const { street, city, state } = selection
          return {
            title: street,
            subtitle: `${city}, ${state}`,
          }
        },
      },
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      description: 'Primary contact phone number',
      validation: Rule => Rule.required().regex(/^\+?[1-9]\d{1,14}$/, {
        name: 'phone number',
        invert: false,
      }),
      placeholder: '(555) 123-4567',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      description: 'Primary contact email address',
      validation: Rule => Rule.required().email(),
      placeholder: 'hello@yourstudio.com',
    }),
    defineField({
      name: 'website',
      title: 'Website URL',
      type: 'url',
      description: 'Studio website URL (optional)',
      validation: Rule => Rule.uri({
        allowRelative: false,
        scheme: ['http', 'https'],
      }),
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'array',
      description: 'Links to social media profiles',
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
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Twitter', value: 'twitter' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'TikTok', value: 'tiktok' },
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
              return {
                title: platform,
                subtitle: url,
                media: () => '📱',
              }
            },
          },
        },
      ],
      validation: Rule => Rule.max(5),
    }),
    defineField({
      name: 'hours',
      title: 'Business Hours',
      type: 'array',
      description: 'Operating hours for each day of the week',
      validation: Rule => Rule.required().min(7).max(7),
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'day',
              title: 'Day of Week',
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
              name: 'openTime',
              title: 'Opening Time',
              type: 'string',
              description: 'Opening time in HH:mm format (24-hour)',
              validation: Rule => Rule.custom((openTime, context) => {
                const isClosed = (context.document as any)?.hours?.find(
                  (h: any) => h._key === (context.parent as any)?._key
                )?.isClosed
                
                if (isClosed) return true
                
                if (!openTime) return 'Opening time is required when not closed'
                
                if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(openTime)) {
                  return 'Time must be in HH:mm format (e.g., 09:00)'
                }
                
                return true
              }),
              placeholder: '09:00',
            }),
            defineField({
              name: 'closeTime',
              title: 'Closing Time',
              type: 'string',
              description: 'Closing time in HH:mm format (24-hour)',
              validation: Rule => Rule.custom((closeTime, context) => {
                const isClosed = (context.document as any)?.hours?.find(
                  (h: any) => h._key === (context.parent as any)?._key
                )?.isClosed
                
                if (isClosed) return true
                
                if (!closeTime) return 'Closing time is required when not closed'
                
                if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(closeTime)) {
                  return 'Time must be in HH:mm format (e.g., 21:00)'
                }
                
                return true
              }),
              placeholder: '21:00',
            }),
            defineField({
              name: 'isClosed',
              title: 'Closed',
              type: 'boolean',
              description: 'Check if the studio is closed on this day',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              day: 'day',
              openTime: 'openTime',
              closeTime: 'closeTime',
              isClosed: 'isClosed',
            },
            prepare(selection) {
              const { day, openTime, closeTime, isClosed } = selection
              const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1)
              
              if (isClosed) {
                return {
                  title: dayCapitalized,
                  subtitle: 'Closed',
                }
              }
              
              return {
                title: dayCapitalized,
                subtitle: `${openTime} - ${closeTime}`,
              }
            },
          },
        },
      ],
      initialValue: [
        { day: 'monday', openTime: '06:00', closeTime: '21:00', isClosed: false },
        { day: 'tuesday', openTime: '06:00', closeTime: '21:00', isClosed: false },
        { day: 'wednesday', openTime: '06:00', closeTime: '21:00', isClosed: false },
        { day: 'thursday', openTime: '06:00', closeTime: '21:00', isClosed: false },
        { day: 'friday', openTime: '06:00', closeTime: '21:00', isClosed: false },
        { day: 'saturday', openTime: '08:00', closeTime: '18:00', isClosed: false },
        { day: 'sunday', openTime: '', closeTime: '', isClosed: true },
      ],
    }),
  ],
  preview: {
    select: {
      name: 'name',
      tagline: 'tagline',
      street: 'address.street',
      city: 'address.city',
    },
    prepare(selection) {
      const { name, tagline, street, city } = selection
      return {
        title: name,
        subtitle: tagline || `${street}, ${city}`,
        media: () => '🧘‍♀️',
      }
    },
  },
  // Only allow one studio info document
  __experimental_actions: [
    'create',
    'update',
    'delete',
    'publish',
  ],
})