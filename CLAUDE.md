# spec-kit Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-07

## Active Technologies

### 001-yoga-studio-web (Yoga Studio Website)
- **Language/Version**: JavaScript/TypeScript with Node.js 18+
- **Primary Dependencies**: Astro 4.x, Tailwind CSS, Sanity CMS (headless)
- **Storage**: Static files with Sanity cloud storage for content management
- **Testing**: Vitest for unit testing, Playwright for e2e testing
- **Project Type**: web - frontend with static generation

## Project Structure
```
# Web application structure (yoga-studio-web)
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

specs/001-yoga-studio-web/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

## Development Commands

### Yoga Studio Website (001-yoga-studio-web)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run test suite
npm run test:e2e     # Run end-to-end tests
sanity dev           # Start Sanity studio
```

## Code Style

### Frontend (Astro + TypeScript)
- Use TypeScript for all new files
- Follow Astro component conventions
- Tailwind CSS for styling
- ESLint + Prettier for code formatting

### Testing Requirements
- RED-GREEN-Refactor cycle enforced
- Component tests written before implementation
- Integration tests for CMS content fetching
- E2E tests for user workflows
- Real dependencies (actual Sanity CMS) for integration tests

## Content Management
- Sanity CMS for all content (instructors, classes, studio info)
- Image optimization via Cloudinary
- Structured content types with validation
- Real-time preview in development

## Performance Targets
- <3 second load times
- Lighthouse score >90
- Mobile-first responsive design
- Core Web Vitals optimization

## Recent Changes
- 001-yoga-studio-web: Added Astro + Sanity CMS + Tailwind stack for yoga studio website

<!-- MANUAL ADDITIONS START -->
<!-- Add any manual context or project-specific notes here -->
<!-- MANUAL ADDITIONS END -->