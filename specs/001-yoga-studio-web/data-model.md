# Data Model: Yoga Studio Website

## Content Types (Sanity Schema)

### Studio Information
**Purpose**: Core business information displayed across the site

**Fields**:
- `name`: string (required) - Studio name
- `tagline`: string - Brief studio description/motto  
- `description`: text - Detailed studio description
- `address`: object (required)
  - `street`: string
  - `city`: string  
  - `state`: string
  - `zipCode`: string
- `phone`: string (required) - Primary contact number
- `email`: string (required) - Primary contact email
- `website`: url - Studio website URL
- `socialMedia`: array of objects
  - `platform`: string (facebook, instagram, twitter, youtube)
  - `url`: url
- `hours`: array of objects (required)
  - `day`: string (monday, tuesday, etc.)
  - `openTime`: string (HH:mm format)
  - `closeTime`: string (HH:mm format)  
  - `isClosed`: boolean

**Validation Rules**:
- Phone must match standard phone format
- Email must be valid email address
- Address fields required for local SEO
- At least one contact method (phone or email) required

### Membership Plans
**Purpose**: Pricing and membership option display

**Fields**:
- `name`: string (required) - Plan name (e.g., "Monthly Unlimited")
- `description`: text - Plan benefits and details
- `price`: number (required) - Monthly price in dollars
- `billingCycle`: string (required) - monthly, annual, drop-in
- `duration`: number - Contract length in months (null for ongoing)
- `classesIncluded`: number - Number of classes (null for unlimited)
- `benefits`: array of strings - List of included benefits
- `restrictions`: text - Any usage limitations
- `isPopular`: boolean - Featured/recommended plan flag
- `isActive`: boolean (required) - Currently available for purchase

**Validation Rules**:
- Price must be positive number
- Billing cycle must be from allowed values
- At least one active plan required
- Popular plan limited to one per billing cycle

### Instructors  
**Purpose**: Teacher profiles and credentials

**Fields**:
- `name`: string (required) - Full instructor name
- `firstName`: string (required) - For personalized display
- `lastName`: string (required) - For formal references
- `title`: string - Certification level (RYT-200, RYT-500, etc.)
- `bio`: text (required) - Professional background and teaching philosophy
- `photo`: image (required) - Professional headshot
- `certifications`: array of strings - Yoga certifications and credentials  
- `specialties`: array of strings - Teaching specialties and styles
- `experience`: number - Years of teaching experience
- `email`: string - Direct instructor contact (optional)
- `socialMedia`: array of objects
  - `platform`: string
  - `url`: url
- `isActive`: boolean (required) - Currently teaching at studio

**Validation Rules**:
- Photo required and must be high-quality portrait format
- Bio minimum 100 characters for meaningful description
- At least one specialty required
- Name fields required for proper display

### Photos
**Purpose**: Studio facility and class imagery

**Fields**:
- `title`: string (required) - Photo description for accessibility
- `image`: image (required) - High-resolution studio photo
- `altText`: string (required) - Detailed alt text for screen readers
- `category`: string (required) - studio-space, equipment, classes-in-session, exterior
- `featured`: boolean - Display on homepage/featured sections
- `sortOrder`: number - Manual ordering within category
- `photographer`: string - Photo credit (optional)
- `dateTaken`: date - When photo was captured

**Validation Rules**:
- Alt text required for accessibility compliance
- Category must be from allowed values
- Featured photos limited to 6 per category
- Minimum resolution requirements for web display

## Content Relationships

### Studio → Instructors
- One studio has many instructors
- Instructors belong to one studio
- Active instructor filtering for current staff

### Studio → Membership Plans  
- One studio has many membership plans
- Plans belong to one studio
- Active plan filtering for current offerings

### Studio → Photos
- One studio has many photos
- Photos categorized by studio areas and activities
- Featured photo selection for homepage display

## Content Validation Rules

### Cross-Entity Validation
- At least one active instructor required
- At least one active membership plan required  
- At least one photo per major category required
- Contact information completeness for business listings

### Data Quality Requirements
- All images optimized for web delivery
- Text content reviewed for spelling and grammar
- Phone numbers formatted consistently
- Social media links verified and active

## Content Management Workflow

### Content Updates
1. **Staff Access**: Instructors can update their own profiles
2. **Admin Access**: Studio owners can modify all content
3. **Approval Process**: Major changes require admin approval
4. **Publishing**: Automatic deployment after content changes

### Content Backup
- Sanity provides automatic version history
- Weekly export of all content for local backup
- Git repository tracks schema and configuration changes

## Performance Considerations

### Image Optimization
- Cloudinary automatic format conversion (WebP/AVIF)
- Responsive image serving based on device
- Lazy loading for below-fold images
- Maximum file size limits enforced

### Content Caching
- Static site generation caches all content
- CDN edge caching for global performance
- Incremental builds for content-only changes
- Cache invalidation on content updates