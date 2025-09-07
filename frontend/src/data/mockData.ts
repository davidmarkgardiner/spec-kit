// Centralized mock data for development and testing
// Provides comprehensive fallback data when CMS is unavailable

import type { StudioInfo } from '../services/studioService'
import type { Instructor } from '../services/instructorService'
import type { MembershipPlan } from '../services/membershipService'
import type { StudioPhoto } from '../services/photoService'

// Mock Studio Information
export const mockStudioInfo: StudioInfo = {
  _id: 'mock-studio-info',
  _type: 'studioInfo',
  _createdAt: new Date().toISOString(),
  _updatedAt: new Date().toISOString(),
  _rev: 'mock-rev-1',
  name: 'Serenity Yoga Studio',
  tagline: 'Find Your Inner Peace Through Movement',
  description: 'Welcome to Serenity Yoga Studio, where mindful movement meets community. Our experienced instructors guide you through transformative yoga practices in a warm, welcoming environment.',
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
    { platform: 'facebook', url: 'https://facebook.com/serenityyoga' }
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
  isActive: true
}

// Mock Instructors with simplified structure
export const mockInstructors: Instructor[] = [
  {
    _id: 'mock-instructor-sarah',
    _type: 'instructor',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'mock-rev-1',
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
            text: 'Sarah founded Serenity Yoga Studio with over 15 years of personal practice and 8 years of teaching experience, specializing in Vinyasa Flow and Yin Yoga. Her classes focus on breath awareness and mindful movement.',
            marks: []
          }
        ],
        markDefs: []
      }
    ],
    photo: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _id: 'image-sarah',
        _ref: 'image-sarah-ref',
        url: '/images/instructors/sarah-chen.jpg',
        metadata: {
          dimensions: { width: 800, height: 600, aspectRatio: 1.33 },
          lqip: 'placeholder-lqip',
          hasAlpha: false,
          isOpaque: true
        }
      },
      alt: 'Sarah Chen, Senior Yoga Instructor'
    },
    certifications: ['RYT-500', 'Yin Yoga Certification'],
    specialties: ['Vinyasa Flow', 'Yin Yoga', 'Meditation'],
    experience: 8,
    isActive: true,
    featuredOrder: 1
  },
  {
    _id: 'mock-instructor-michael',
    _type: 'instructor',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'mock-rev-1',
    name: 'Michael Rodriguez',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    title: 'Lead Instructor',
    bio: [
      {
        _type: 'block',
        _key: 'bio1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'span1',
            text: 'Michael brings a grounding presence focusing on precise alignment and therapeutic benefits of yoga with 5 years of teaching experience. He specializes in creating safe, accessible classes for all bodies.',
            marks: []
          }
        ],
        markDefs: []
      }
    ],
    photo: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _id: 'image-michael',
        _ref: 'image-michael-ref',
        url: '/images/instructors/michael-rodriguez.jpg',
        metadata: {
          dimensions: { width: 800, height: 600, aspectRatio: 1.33 },
          lqip: 'placeholder-lqip',
          hasAlpha: false,
          isOpaque: true
        }
      },
      alt: 'Michael Rodriguez, Lead Yoga Instructor'
    },
    certifications: ['RYT-200', 'Restorative Yoga Certification'],
    specialties: ['Hatha Yoga', 'Restorative Yoga', 'Pranayama'],
    experience: 5,
    isActive: true,
    featuredOrder: 2
  }
]

// Mock Membership Plans
export const mockMembershipPlans: MembershipPlan[] = [
  {
    _id: 'mock-plan-monthly',
    _type: 'membershipPlan',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'mock-rev-1',
    name: 'Monthly Unlimited',
    description: 'Perfect for regular practitioners with unlimited access to all classes.',
    price: 129,
    billingCycle: 'monthly',
    benefits: [
      'Unlimited classes',
      'Mat and prop rental included',
      '2 guest passes per month',
      'Access to workshops'
    ],
    isPopular: true,
    isActive: true,
    sortOrder: 1
  },
  {
    _id: 'mock-plan-annual',
    _type: 'membershipPlan',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'mock-rev-1',
    name: 'Annual Membership',
    description: 'Best value! Save over $300 with our annual unlimited membership.',
    price: 1299,
    billingCycle: 'annual',
    benefits: [
      'Unlimited classes',
      'Mat and prop rental included',
      'Free workshop attendance',
      'Priority booking for retreats'
    ],
    isPopular: false,
    isActive: true,
    sortOrder: 2
  },
  {
    _id: 'mock-plan-drop-in',
    _type: 'membershipPlan',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'mock-rev-1',
    name: 'Drop-in Class',
    description: 'Perfect for first-time visitors or occasional practice.',
    price: 28,
    billingCycle: 'drop-in',
    classesIncluded: 1,
    benefits: [
      'Single class entry',
      'Mat rental included',
      'Access to amenities'
    ],
    isPopular: false,
    isActive: true,
    sortOrder: 3
  }
]

// Mock Studio Photos
export const mockStudioPhotos: StudioPhoto[] = [
  {
    _id: 'mock-photo-main-studio',
    _type: 'photo',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'mock-rev-1',
    title: 'Main Practice Studio',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _id: 'image-main-studio',
        _ref: 'image-main-studio-ref',
        url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        metadata: {
          dimensions: { width: 1200, height: 800, aspectRatio: 1.5 },
          lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSv3gk/8l8U7pAF8+Xm+v3AfzKBhHOA0QgBOB/FjdnMisjziBLaF3qRMiYqe8bA8LJG5n9x9/YBo9ybEqRHdcOQs5z/wJN/W/qJcTq/X8wh/UXCEf6CaQPSN6JSBMDGUIqIDwGYIwNO6uUGHHCtDKW/MmgN8g3fA/wNEh9/jz6v+jgG',
          hasAlpha: false,
          isOpaque: true
        }
      },
      alt: 'Spacious main yoga studio with bamboo floors and natural lighting'
    },
    altText: 'Spacious main yoga studio with bamboo floors and natural lighting',
    category: 'studio-space',
    featured: true,
    sortOrder: 1,
    isActive: true
  },
  {
    _id: 'mock-photo-equipment',
    _type: 'photo',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'mock-rev-1',
    title: 'Yoga Props and Equipment',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _id: 'image-equipment',
        _ref: 'image-equipment-ref',
        url: 'https://images.unsplash.com/photo-1506629905996-636aca18ba22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        metadata: {
          dimensions: { width: 1200, height: 800, aspectRatio: 1.5 },
          lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSv3gk/8l8U7pAF8+Xm+v3AfzKBhHOA0QgBOB/FjdnMisjziBLaF3qRMiYqe8bA8LJG5n9x9/YBo9ybEqRHdcOQs5z/wJN/W/qJcTq/X8wh/UXCEf6CaQPSN6JSBMDGUIqIDwGYIwNO6uUGHHCtDKW/MmgN8g3fA/wNEh9/jz6v+jgG',
          hasAlpha: false,
          isOpaque: true
        }
      },
      alt: 'High-quality yoga mats, blocks, and props'
    },
    altText: 'High-quality yoga mats, blocks, and props',
    category: 'equipment',
    featured: true,
    sortOrder: 2,
    isActive: true
  },
  {
    _id: 'mock-photo-class',
    _type: 'photo',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'mock-rev-1',
    title: 'Morning Yoga Class',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _id: 'image-class',
        _ref: 'image-class-ref',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        metadata: {
          dimensions: { width: 1200, height: 800, aspectRatio: 1.5 },
          lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSv3gk/8l8U7pAF8+Xm+v3AfzKBhHOA0QgBOB/FjdnMisjziBLaF3qRMiYqe8bA8LJG5n9x9/YBo9ybEqRHdcOQs5z/wJN/W/qJcTq/X8wh/UXCEf6CaQPSN6JSBMDGUIqIDwGYIwNO6uUGHHCtDKW/MmgN8g3fA/wNEh9/jz6v+jgG',
          hasAlpha: false,
          isOpaque: true
        }
      },
      alt: 'Students practicing yoga in a peaceful morning session'
    },
    altText: 'Students practicing yoga in a peaceful morning session',
    category: 'classes-in-session',
    featured: true,
    sortOrder: 3,
    isActive: true
  }
]

// Export all mock data
export const mockData = {
  studioInfo: mockStudioInfo,
  instructors: mockInstructors,
  membershipPlans: mockMembershipPlans,
  photos: mockStudioPhotos
}

export default mockData