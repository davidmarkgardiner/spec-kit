# Research: Yoga Studio Website Technology Stack

## Frontend Framework Decision

**Decision**: Astro 4.x with Tailwind CSS
**Rationale**: 
- Static site generation provides optimal performance for content-heavy yoga studio site
- Minimal JavaScript footprint ensures fast mobile loading (critical for 83% mobile traffic)
- Component-based architecture allows reusability for instructor profiles and class listings
- Built-in image optimization supports photo-heavy content
- Simple deployment to CDN platforms

**Alternatives considered**:
- Next.js: Overkill for static content site, adds unnecessary complexity
- Eleventy: Good alternative but less component-oriented than needed
- Plain HTML/CSS: Too maintenance-heavy for evolving content

## Content Management Decision

**Decision**: Sanity CMS (headless) with static site generation
**Rationale**:
- Free tier supports small business needs (100k API requests/month)
- Real-time collaborative editing for multiple staff members
- Structured content types perfect for instructors, classes, schedules
- API-first design integrates well with static generation
- Non-technical staff can manage content independently

**Alternatives considered**:
- Markdown files: Too technical for business staff to maintain
- WordPress: Security overhead and hosting complexity
- Strapi: Self-hosted complexity not suitable for small business

## Image Hosting Decision

**Decision**: Cloudinary with automatic optimization
**Rationale**:
- Free tier sufficient (25GB bandwidth/month) for yoga studio photo needs
- Automatic format conversion (WebP/AVIF) improves mobile performance
- Global CDN ensures fast loading for studio visitors
- Responsive image delivery serves appropriate sizes per device
- Simple API integration with Astro

**Alternatives considered**:
- Self-hosted images: No automatic optimization, slower loading
- Cloudflare Images: Good alternative but less generous free tier
- AWS S3: Requires more technical setup and configuration

## Hosting Decision

**Decision**: Netlify with automatic deployments
**Rationale**:
- Generous free tier (100GB bandwidth/month) sufficient for local business
- Built-in form handling perfect for contact/inquiry forms
- Automatic deployments from Git enable easy content updates
- Custom domain support with SSL included
- Analytics and performance monitoring included

**Alternatives considered**:
- Vercel: Good performance but less generous free tier
- GitHub Pages: Limited features, no form handling
- Traditional hosting: More complex deployment and maintenance

## Testing Framework Decision

**Decision**: Vitest for unit testing, Playwright for E2E testing
**Rationale**:
- Vitest integrates seamlessly with Astro and modern frontend tooling
- Playwright provides cross-browser testing crucial for small business reach
- Both support TypeScript out of the box
- Excellent performance for CI/CD pipelines
- Active community and documentation

**Alternatives considered**:
- Jest: Slower than Vitest, requires more configuration
- Cypress: Good but heavier than Playwright for this use case
- Testing Library only: Insufficient coverage for full site testing

## Performance Optimization Decisions

**Decision**: Target <3 second load times with Lighthouse score >90
**Rationale**:
- 90% of users leave after 5-second load times
- Mobile-first design critical for local business discovery
- SEO ranking factors heavily weight Core Web Vitals
- Simple content enables aggressive optimization

**Key optimizations**:
- Static site generation for instant serving
- Cloudinary automatic image optimization  
- Minimal JavaScript bundle with Astro
- CDN delivery through Netlify
- Lazy loading for below-fold content

## Development Workflow Decision

**Decision**: Git-based workflow with automated deployments
**Rationale**:
- Version control protects against content/design mistakes
- Branch-based development enables safe experimentation
- Automated deployments reduce technical barriers for updates
- Content team can preview changes before publishing

**Workflow steps**:
1. Content updates via Sanity CMS trigger webhook
2. Automatic build and deployment to staging
3. Manual approval promotes to production
4. Git history maintains full audit trail