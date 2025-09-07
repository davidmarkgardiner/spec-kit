// Sample data script to populate Sanity with test content
// Run with: node sample-data.js

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'rwm8hvis',
  dataset: 'production',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01'
})

// Sample studio information
const studioInfo = {
  _type: 'studioInfo',
  _id: 'studioInfo',
  name: 'Serenity Yoga Studio',
  tagline: 'Find Your Inner Peace Through Movement',
  description: 'Welcome to Serenity Yoga Studio, where mindful movement meets community. Our experienced instructors guide you through transformative yoga practices in a warm, welcoming environment. Whether you\'re a beginner or advanced practitioner, we offer classes for every level and style preference.',
  address: {
    street: '123 Harmony Lane',
    city: 'Mindful Valley',
    state: 'CA',
    zipCode: '94501',
    country: 'USA'
  },
  phone: '15551234567',
  email: 'hello@serenityyoga.com',
  website: 'https://serenityyoga.com',
  socialMedia: [
    { platform: 'instagram', url: 'https://instagram.com/serenityyoga' },
    { platform: 'facebook', url: 'https://facebook.com/serenityyoga' },
    { platform: 'youtube', url: 'https://youtube.com/@serenityyoga' }
  ],
  hours: [
    { day: 'monday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'tuesday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'wednesday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'thursday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'friday', openTime: '06:00', closeTime: '21:00', isClosed: false },
    { day: 'saturday', openTime: '08:00', closeTime: '18:00', isClosed: false },
    { day: 'sunday', openTime: '09:00', closeTime: '17:00', isClosed: false }
  ],
  emergencyContact: '15551239911',
  parkingInstructions: 'Free parking available in the lot behind the building. Street parking is also available with 2-hour limits.',
  accessibilityInfo: 'Our studio is wheelchair accessible with ramps and accessible restrooms. Please contact us if you need any special accommodations.',
  isActive: true
}

// Sample membership plan
const membershipPlan = {
  _type: 'membershipPlan',
  name: 'Monthly Unlimited',
  description: 'Perfect for regular practitioners who want unlimited access to all classes.',
  price: 129,
  billingCycle: 'monthly',
  duration: 1,
  benefits: [
    'Unlimited classes',
    'Mat and prop rental included',
    '2 guest passes per month',
    'Access to workshops',
    '10% discount on retail'
  ],
  restrictions: 'Auto-renews monthly. Cancel anytime with 30-day notice.',
  isPopular: true,
  isActive: true,
  sortOrder: 1
}

// Sample instructor
const instructor = {
  _type: 'instructor',
  name: 'Sarah Chen',
  firstName: 'Sarah',
  lastName: 'Chen',
  title: 'Senior Instructor & Studio Founder',
  bio: [
    {
      _type: 'block',
      _key: 'bio1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span1',
          text: 'Sarah founded Serenity Yoga Studio with over 15 years of personal practice and 8 years of teaching experience, specializing in Vinyasa Flow and Yin Yoga. Her classes focus on breath awareness, mindful movement, and creating space for personal growth.',
          marks: []
        }
      ],
      markDefs: []
    }
  ],
  certifications: ['RYT-500', 'Yin Yoga Certification', 'Meditation Teacher Training'],
  specialties: ['Vinyasa Flow', 'Yin Yoga', 'Meditation', 'Breathwork'],
  experience: 8,
  email: 'sarah@serenityyoga.com',
  socialMedia: [
    { platform: 'instagram', url: 'https://instagram.com/sarahyogaflow' }
  ],
  schedule: [
    { day: 'monday', time: '7:00 AM', class: 'Morning Vinyasa Flow' },
    { day: 'wednesday', time: '6:30 PM', class: 'Yin & Meditation' },
    { day: 'saturday', time: '9:00 AM', class: 'All Levels Flow' }
  ],
  isActive: true,
  featuredOrder: 1
}

async function uploadSampleData() {
  try {
    console.log('🔄 Uploading sample data to Sanity...')
    
    // Create studio info (using createOrReplace for singleton)
    const studioResult = await client.createOrReplace(studioInfo)
    console.log('✅ Studio info created:', studioResult._id)
    
    // Create membership plan
    const planResult = await client.create(membershipPlan)
    console.log('✅ Membership plan created:', planResult._id)
    
    // Create instructor
    const instructorResult = await client.create(instructor)
    console.log('✅ Instructor created:', instructorResult._id)
    
    console.log('🎉 Sample data uploaded successfully!')
    console.log('📝 Visit your studio at: https://yoga-studio.sanity.studio/')
    
  } catch (error) {
    console.error('❌ Error uploading data:', error)
  }
}

uploadSampleData()