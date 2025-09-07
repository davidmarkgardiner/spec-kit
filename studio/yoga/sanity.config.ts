import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, singletonTypes} from './schemaTypes/schemaConfig'

// Environment configuration
const projectId = process.env.SANITY_PROJECT_ID || 'rwm8hvis'
const dataset = process.env.SANITY_DATASET || 'production'
const title = process.env.SANITY_STUDIO_TITLE || 'Yoga Studio CMS'

export default defineConfig({
  name: 'default',
  title,

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure,
      // Hide singleton types from the "New document" button
      // They should only be accessed through the custom structure
      newDocumentOptions: (prev, {creationContext}) => {
        if (creationContext.type === 'global') {
          return prev.filter(
            (templateItem) => !singletonTypes.has(templateItem.templateId)
          )
        }
        return prev
      },
    }),
    visionTool({
      // Custom GROQ playground title
      title: 'GROQ Query Tool',
      // Default query for testing
      defaultQuery: '*[_type == "studioInfo"][0]{\n  name,\n  description,\n  phone,\n  email,\n  address\n}',
    }),
  ],

  schema: {
    types: schemaTypes,
    // Template for singleton documents
    templates: (prev) =>
      prev.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  // Custom document actions
  document: {
    actions: (prev, context) => {
      const {schemaType} = context
      
      // For singleton types, disable certain actions
      if (singletonTypes.has(schemaType)) {
        return prev.filter(
          ({action}) => !['duplicate', 'delete'].includes(action || '')
        )
      }
      
      return prev
    },
    // Custom new document templates
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem) => !singletonTypes.has(templateItem.templateId)
        )
      }
      return prev
    },
  },

  // Development and production settings
  tools: (prev) => {
    // Only show Vision (GROQ) tool in development
    if (process.env.NODE_ENV === 'production') {
      return prev.filter((tool) => tool.name !== 'vision')
    }
    return prev
  },

  // Custom branding
  studio: {
    components: {
      // You can add custom components here
    },
  },
})