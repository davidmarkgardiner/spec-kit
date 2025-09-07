# Yoga Studio Website

A modern, responsive yoga studio website built with Astro, Tailwind CSS, and Sanity CMS. Features comprehensive class information, instructor profiles, photo galleries, and membership management.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yoga-studio-website/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit `http://localhost:4321` to see the website.

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── StudioInfo.astro
│   │   ├── MembershipCard.astro
│   │   ├── InstructorProfile.astro
│   │   ├── ContactForm.astro
│   │   └── PhotoGallery.astro
│   ├── layouts/             # Page layouts
│   │   └── Layout.astro
│   ├── pages/               # Page components (file-based routing)
│   │   ├── index.astro      # Homepage
│   │   ├── about.astro      # About page
│   │   ├── membership.astro # Membership & pricing
│   │   ├── instructors.astro # Teaching team
│   │   ├── gallery.astro    # Photo gallery
│   │   ├── contact.astro    # Contact form
│   │   └── 404.astro        # Error page
│   ├── services/            # Data fetching services
│   │   ├── studioService.ts
│   │   ├── membershipService.ts
│   │   ├── instructorService.ts
│   │   └── photoService.ts
│   ├── utils/               # Utility functions
│   │   └── imageUtils.ts
│   ├── styles/              # CSS files
│   │   ├── global.css
│   │   └── utilities.css
│   └── lib/                 # External service configs
│       └── sanity.ts
├── public/                  # Static assets
├── tests/                   # Test files
├── netlify.toml            # Netlify deployment config
├── tailwind.config.mjs     # Tailwind CSS config
├── astro.config.mjs        # Astro configuration
└── package.json
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## 🎨 Design System

### Brand Colors
- **Primary**: Blue (`#2563eb`)
- **Secondary**: Green (`#16a34a`)  
- **Accent**: Purple (`#9333ea`)
- **Muted**: Teal (`#0d9488`)

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Code**: JetBrains Mono (monospace)

### Responsive Breakpoints
- **xs**: 475px
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## 📱 Pages Overview

### Homepage (`/`)
- Hero section with studio introduction
- Featured membership plans
- Instructor highlights
- Photo gallery preview
- Contact information

### About Page (`/about`)
- Studio story and values
- Teaching philosophy
- Instructor team overview
- Studio amenities and features

### Membership Page (`/membership`)
- Pricing plans comparison
- Membership benefits
- FAQ section
- Contact form for inquiries

### Instructors Page (`/instructors`)
- Complete instructor directory
- Individual instructor profiles
- Specialty filtering
- Class photos

### Gallery Page (`/gallery`)
- Photo collections by category
- Lightbox viewing
- Photo submission guidelines
- Community sharing features

### Contact Page (`/contact`)
- Contact form
- Studio location and hours
- Directions and parking
- FAQ section

## 🗄️ Content Management

This website uses **Sanity CMS** for content management:

- **Studio Information**: Hours, contact details, amenities
- **Membership Plans**: Pricing, benefits, descriptions
- **Instructors**: Profiles, photos, specialties, bios
- **Photos**: Gallery images with categories and metadata

### Sanity Schema Types
- `studioInfo` - Studio details and contact information
- `membershipPlan` - Pricing plans and membership options
- `instructor` - Teacher profiles and qualifications
- `photo` - Gallery images with metadata

## 🔧 Configuration

### Environment Variables

Required environment variables for development:

```bash
# Sanity CMS
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_TOKEN=your_sanity_token
SANITY_API_VERSION=2024-01-01

# Site Configuration
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_SITE_NAME=Yoga Studio

# Optional: Image Optimization
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Tailwind CSS

The project uses a custom Tailwind configuration with:
- Extended color palette matching brand colors
- Custom typography settings
- Responsive utility classes
- Component classes for buttons, cards, forms
- Animation and transition utilities

## 🚀 Deployment

### Netlify Deployment (Recommended)

1. **Connect your repository** to Netlify
2. **Set build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Configure environment variables** in Netlify dashboard
4. **Deploy**!

The `netlify.toml` file includes optimized settings for:
- Security headers
- Asset caching
- Form handling
- Redirects
- Image optimization

### Other Hosting Options

The site builds to static files and can be hosted on:
- Vercel
- GitHub Pages
- Cloudflare Pages
- Any static hosting service

## 🧪 Testing

The project includes comprehensive tests:

- **Unit Tests**: Individual component testing
- **Integration Tests**: Page-level functionality
- **E2E Tests**: Complete user journeys
- **Contract Tests**: API service validation

Run tests with:
```bash
npm run test
```

## ♿ Accessibility

This website prioritizes accessibility:

- **WCAG 2.1 AA compliant**
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

## 🔍 SEO Features

- Semantic HTML markup
- Meta tags and Open Graph data
- Structured data (JSON-LD)
- Sitemap generation
- Clean URL structure
- Fast loading performance
- Mobile-first responsive design

## 📊 Performance

Optimizations include:

- **Image Optimization**: WebP/AVIF formats, lazy loading, responsive images
- **CSS**: Critical CSS inlining, unused CSS removal
- **JavaScript**: Code splitting, lazy loading
- **Fonts**: Optimized loading strategy
- **Caching**: Service worker, CDN caching headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the established code style
- Write tests for new features
- Ensure accessibility compliance
- Update documentation as needed
- Test on multiple devices and browsers

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or support:

- Check the documentation
- Review existing issues
- Create a new issue for bugs
- Contact the development team

## 🔄 Updates

This website is actively maintained with regular updates for:
- Security patches
- Performance improvements  
- New features
- Content updates
- Accessibility enhancements

---

Built with ❤️ using [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [Sanity CMS](https://sanity.io).