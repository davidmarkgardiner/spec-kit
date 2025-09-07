# Quickstart: Yoga Studio Website

## Prerequisites
- Node.js 18+ installed
- Git installed
- Sanity account created
- Cloudinary account created  
- Netlify account created

## Initial Setup (5 minutes)

### 1. Clone and Install
```bash
git clone <repository-url>
cd yoga-studio-website
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Configure required environment variables
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_TOKEN=your_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
PUBLIC_SITE_URL=https://your-domain.com
```

### 3. Start Development Server
```bash
npm run dev
```

Site will be available at http://localhost:3000

## Content Setup (10 minutes)

### 1. Initialize Sanity Studio
```bash
# Install Sanity CLI
npm install -g @sanity/cli

# Login to Sanity
sanity login

# Deploy studio
cd studio
sanity deploy
```

### 2. Add Initial Content
1. Open Sanity Studio at `https://your-project.sanity.studio`
2. Add studio information:
   - Studio name and description
   - Contact information
   - Business hours
   - Address details
3. Create first instructor profile
4. Add initial membership plans
5. Upload studio photos

### 3. Test Content Integration
```bash
# Back in main project directory
npm run build
npm run preview
```

## Deployment (5 minutes)

### 1. Connect to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and link site
netlify login
netlify link
```

### 2. Configure Build Settings
```bash
# Set build command
netlify env:set BUILD_COMMAND "npm run build"

# Set publish directory  
netlify env:set PUBLISH_DIRECTORY "dist"

# Add environment variables
netlify env:set SANITY_PROJECT_ID your_project_id
netlify env:set SANITY_DATASET production
netlify env:set CLOUDINARY_CLOUD_NAME your_cloud_name
```

### 3. Deploy
```bash
netlify deploy --prod
```

## User Acceptance Testing

### Test Scenario 1: Homepage Navigation
**Given** a visitor lands on the homepage
**When** they scroll through the page
**Then** they should see:
- [ ] Studio name and tagline prominently displayed
- [ ] Hero section with featured studio photo
- [ ] Clear navigation to main sections
- [ ] Contact information in header/footer
- [ ] Business hours displayed
- [ ] Call-to-action buttons for membership

### Test Scenario 2: Contact Information Access
**Given** a potential customer wants to contact the studio
**When** they look for contact information
**Then** they should find:
- [ ] Phone number clickable on mobile devices
- [ ] Email address with mailto link
- [ ] Complete address with map integration
- [ ] Contact form with required fields
- [ ] Social media links if available

### Test Scenario 3: Membership Information
**Given** someone interested in membership pricing
**When** they navigate to membership section
**Then** they should see:
- [ ] All available membership plans displayed clearly
- [ ] Pricing information for each plan
- [ ] Benefits and features listed
- [ ] Popular/recommended plan highlighted
- [ ] Clear call-to-action to inquire or sign up

### Test Scenario 4: Instructor Profiles
**Given** a visitor wants to learn about instructors
**When** they access instructor information
**Then** they should see:
- [ ] Photos of all active instructors
- [ ] Names and credentials displayed
- [ ] Bio information for each instructor
- [ ] Specialties and teaching styles
- [ ] Contact information if provided

### Test Scenario 5: Studio Photos
**Given** someone wants to see the facility
**When** they browse studio photos
**Then** they should see:
- [ ] High-quality images of studio spaces
- [ ] Photos load quickly and display properly
- [ ] Images are optimized for mobile viewing
- [ ] Alt text present for accessibility
- [ ] Photos organized by category

### Test Scenario 6: Mobile Responsiveness
**Given** a mobile user visits the site
**When** they navigate on their device
**Then** the site should:
- [ ] Load within 3 seconds
- [ ] Display properly on various screen sizes
- [ ] Have touch-friendly navigation elements
- [ ] Show readable text without zooming
- [ ] Maintain functionality across all pages

### Test Scenario 7: Contact Form Submission
**Given** a visitor wants to submit an inquiry
**When** they fill out and submit a contact form
**Then** they should:
- [ ] See clear form validation messages
- [ ] Receive confirmation after successful submission
- [ ] Have form data properly delivered to studio
- [ ] Experience no errors during submission

## Performance Validation

### Core Web Vitals Testing
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run performance audit
lighthouse https://your-site.netlify.app --view
```

**Target Metrics**:
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] First Input Delay (FID): < 100ms  
- [ ] Cumulative Layout Shift (CLS): < 0.1
- [ ] Overall Performance Score: > 90

### Mobile Testing
```bash
# Test mobile performance
lighthouse https://your-site.netlify.app --preset=mobile --view
```

**Mobile Targets**:
- [ ] Mobile Performance Score: > 85
- [ ] Mobile Usability Score: > 95
- [ ] Properly sized touch targets
- [ ] Readable font sizes

## Content Management Testing

### Sanity CMS Integration
1. **Content Update Test**:
   - [ ] Update instructor bio in Sanity
   - [ ] Verify change appears on website within 5 minutes
   - [ ] Check that build triggers automatically

2. **Image Upload Test**:
   - [ ] Upload new studio photo to Sanity
   - [ ] Verify image appears with proper optimization
   - [ ] Test image loads on mobile devices

3. **Form Submission Test**:
   - [ ] Submit contact form
   - [ ] Verify email notification received
   - [ ] Check form data stored properly

## Success Criteria Checklist

### Technical Requirements
- [ ] Site loads in < 3 seconds
- [ ] Lighthouse Performance Score > 90
- [ ] Mobile-responsive design working
- [ ] All forms functional
- [ ] Content management system integrated
- [ ] Automated deployments working

### Content Requirements  
- [ ] All required studio information displayed
- [ ] Membership plans clearly presented
- [ ] Instructor profiles complete
- [ ] Studio photos high-quality and optimized
- [ ] Contact information easily accessible

### Business Requirements
- [ ] Site reflects studio brand and personality
- [ ] Clear path for potential customers to inquire
- [ ] Staff can update content independently
- [ ] Local SEO optimization implemented
- [ ] Social media integration working

## Troubleshooting Common Issues

### Build Failures
```bash
# Check build logs
netlify logs

# Test build locally
npm run build
```

### Content Not Updating
```bash
# Check Sanity webhook
sanity hook list

# Manually trigger build
netlify build
```

### Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check image optimization
lighthouse --view
```

## Next Steps After Quickstart

1. **SEO Optimization**: Add meta tags, structured data
2. **Analytics**: Install Google Analytics or similar
3. **Accessibility**: Run accessibility audit and fixes
4. **Custom Domain**: Configure custom domain in Netlify  
5. **SSL Certificate**: Ensure HTTPS is properly configured
6. **Backup Strategy**: Set up automated content backups

## Support Resources

- **Astro Documentation**: https://docs.astro.build
- **Sanity Documentation**: https://www.sanity.io/docs
- **Netlify Documentation**: https://docs.netlify.com
- **Cloudinary Documentation**: https://cloudinary.com/documentation

For issues specific to this yoga studio website, refer to the project README or contact the development team.