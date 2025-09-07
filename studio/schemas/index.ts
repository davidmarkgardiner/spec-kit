// Sanity CMS schema types for yoga studio website
// All schemas follow the contracts defined in sanity-content-api.yaml

import studioInfo from './studioInfo'
import membershipPlan from './membershipPlan'
import instructor from './instructor'
import photo from './photo'

export const schemaTypes = [
  // Core business information - should have only one document
  studioInfo,
  
  // Membership and pricing
  membershipPlan,
  
  // Staff and team
  instructor,
  
  // Media and gallery
  photo,
]