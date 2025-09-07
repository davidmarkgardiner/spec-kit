# Tasks: Yoga Studio Website

**Input**: Design documents from `/specs/001-yoga-studio-web/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: Astro 4.x, Tailwind CSS, Sanity CMS, TypeScript
   → Structure: Web app frontend with static generation
2. Load design documents:
   → data-model.md: StudioInfo, MembershipPlan, Instructor, Photo entities
   → contracts/: sanity-content-api.yaml, contact-form-api.yaml
   → quickstart.md: User acceptance scenarios for testing
3. Generate tasks by category:
   → Setup: Astro project, Sanity schema, dependencies
   → Tests: API contract tests, component tests, integration tests
   → Core: Sanity schemas, Astro components, pages
   → Integration: CMS integration, form handling, image optimization
   → Polish: performance optimization, accessibility, deployment
4. Apply task rules:
   → Different files = mark [P] for parallel execution
   → Shared components = sequential (no [P])
   → Tests before implementation (TDD)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- File paths relative to project root

## Phase 3.1: Setup
- [ ] T001 Create Astro project structure with TypeScript and Tailwind CSS
- [ ] T002 Initialize Sanity CMS project in studio/ directory  
- [ ] T003 [P] Configure ESLint, Prettier, and Vitest for testing
- [ ] T004 [P] Set up Playwright for e2e testing
- [ ] T005 Configure Cloudinary integration for image optimization

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T006 [P] Contract test for studio info API in tests/contract/studio-info.test.ts
- [ ] T007 [P] Contract test for membership plans API in tests/contract/membership-plans.test.ts  
- [ ] T008 [P] Contract test for instructors API in tests/contract/instructors.test.ts
- [ ] T009 [P] Contract test for photos API in tests/contract/photos.test.ts
- [ ] T010 [P] Contract test for contact form submission in tests/contract/contact-form.test.ts

### Integration Tests
- [ ] T011 [P] Integration test for homepage content loading in tests/integration/homepage.test.ts
- [ ] T012 [P] Integration test for membership page in tests/integration/membership.test.ts
- [ ] T013 [P] Integration test for instructors page in tests/integration/instructors.test.ts
- [ ] T014 [P] Integration test for contact form workflow in tests/integration/contact.test.ts
- [ ] T015 [P] Integration test for photo gallery in tests/integration/gallery.test.ts

### Component Tests
- [ ] T016 [P] Component test for StudioInfo display in tests/components/StudioInfo.test.ts
- [ ] T017 [P] Component test for MembershipCard in tests/components/MembershipCard.test.ts
- [ ] T018 [P] Component test for InstructorProfile in tests/components/InstructorProfile.test.ts
- [ ] T019 [P] Component test for ContactForm in tests/components/ContactForm.test.ts
- [ ] T020 [P] Component test for PhotoGallery in tests/components/PhotoGallery.test.ts

## Phase 3.3: Content Management (Sanity Schemas)
**ONLY after contract tests are failing**
- [ ] T021 [P] Create StudioInfo schema in studio/schemas/studioInfo.ts
- [ ] T022 [P] Create MembershipPlan schema in studio/schemas/membershipPlan.ts
- [ ] T023 [P] Create Instructor schema in studio/schemas/instructor.ts  
- [ ] T024 [P] Create Photo schema in studio/schemas/photo.ts
- [ ] T025 Configure Sanity schema index and validation rules in studio/schemas/index.ts

## Phase 3.4: Core Components
**ONLY after component tests are failing**
- [ ] T026 [P] StudioInfo component in src/components/StudioInfo.astro
- [ ] T027 [P] MembershipCard component in src/components/MembershipCard.astro
- [ ] T028 [P] InstructorProfile component in src/components/InstructorProfile.astro
- [ ] T029 [P] ContactForm component in src/components/ContactForm.astro
- [ ] T030 [P] PhotoGallery component in src/components/PhotoGallery.astro
- [ ] T031 [P] Header navigation in src/components/Header.astro
- [ ] T032 [P] Footer component in src/components/Footer.astro

## Phase 3.5: Data Services
- [ ] T033 [P] Sanity client configuration in src/lib/sanity.ts
- [ ] T034 [P] Studio info service in src/services/studioService.ts
- [ ] T035 [P] Membership plans service in src/services/membershipService.ts
- [ ] T036 [P] Instructors service in src/services/instructorService.ts
- [ ] T037 [P] Photos service in src/services/photoService.ts
- [ ] T038 Image optimization utilities in src/utils/imageUtils.ts

## Phase 3.6: Pages Implementation
- [ ] T039 Homepage with hero section in src/pages/index.astro
- [ ] T040 About page with studio info in src/pages/about.astro
- [ ] T041 Membership page with pricing in src/pages/membership.astro
- [ ] T042 Instructors page with profiles in src/pages/instructors.astro
- [ ] T043 Gallery page with photos in src/pages/gallery.astro
- [ ] T044 Contact page with form in src/pages/contact.astro
- [ ] T045 [P] 404 error page in src/pages/404.astro

## Phase 3.7: Styling and Layout
- [ ] T046 [P] Global styles and CSS variables in src/styles/global.css
- [ ] T047 [P] Layout component in src/layouts/Layout.astro
- [ ] T048 [P] Responsive utilities in src/styles/utilities.css
- [ ] T049 Configure Tailwind CSS custom theme in tailwind.config.mjs

## Phase 3.8: Integration Features
- [ ] T050 Contact form submission handling with Netlify Forms
- [ ] T051 Image optimization integration with Cloudinary
- [ ] T052 SEO meta tags and structured data implementation
- [ ] T053 Google Maps integration for studio location
- [ ] T054 Social media links and sharing integration

## Phase 3.9: E2E Tests
**ONLY after pages are implemented**
- [ ] T055 [P] E2E test for complete user journey in tests/e2e/user-journey.spec.ts
- [ ] T056 [P] E2E test for mobile responsiveness in tests/e2e/mobile.spec.ts
- [ ] T057 [P] E2E test for form submission flow in tests/e2e/contact.spec.ts
- [ ] T058 [P] E2E test for performance benchmarks in tests/e2e/performance.spec.ts

## Phase 3.10: Polish
- [ ] T059 [P] Accessibility audit and WCAG compliance fixes
- [ ] T060 [P] Performance optimization and Core Web Vitals improvement
- [ ] T061 [P] Local SEO optimization with schema markup
- [ ] T062 [P] Error handling and user feedback improvements
- [ ] T063 [P] Content loading states and skeleton screens
- [ ] T064 Deploy to Netlify with environment configuration
- [ ] T065 [P] Documentation updates in README.md

## Dependencies

### Critical Path
1. **Setup (T001-T005)** → **All other phases**
2. **Contract Tests (T006-T010)** → **Schemas (T021-T025)**
3. **Component Tests (T016-T020)** → **Components (T026-T032)**
4. **Integration Tests (T011-T015)** → **Pages (T039-T045)**
5. **Schemas (T021-T025)** → **Services (T033-T037)**
6. **Services (T033-T037)** → **Pages (T039-T045)**
7. **Components + Services + Styling** → **Integration (T050-T054)**
8. **All Implementation** → **E2E Tests (T055-T058)**
9. **E2E Tests** → **Polish (T059-T065)**

### Blocking Dependencies
- T025 blocks T033 (Sanity config needs schemas)
- T033 blocks T034-T037 (Services need client)
- T047 blocks T039-T044 (Pages need layout)
- T049 blocks T046-T048 (Styling needs theme)

### Parallel Groups
```
Group 1 - Contract Tests (T006-T010): All independent
Group 2 - Integration Tests (T011-T015): All independent  
Group 3 - Component Tests (T016-T020): All independent
Group 4 - Schemas (T021-T024): Different files
Group 5 - Components (T026-T032): Different files
Group 6 - Services (T034-T037): Different files
Group 7 - E2E Tests (T055-T058): Different test files
Group 8 - Polish (T059-T063): Different aspects
```

## Parallel Execution Examples

### Phase 3.2 - All Contract Tests Together
```bash
# Launch T006-T010 together:
Task: "Contract test for studio info API in tests/contract/studio-info.test.ts"
Task: "Contract test for membership plans API in tests/contract/membership-plans.test.ts"  
Task: "Contract test for instructors API in tests/contract/instructors.test.ts"
Task: "Contract test for photos API in tests/contract/photos.test.ts"
Task: "Contract test for contact form submission in tests/contract/contact-form.test.ts"
```

### Phase 3.3 - All Schemas Together  
```bash
# Launch T021-T024 together:
Task: "Create StudioInfo schema in studio/schemas/studioInfo.ts"
Task: "Create MembershipPlan schema in studio/schemas/membershipPlan.ts"
Task: "Create Instructor schema in studio/schemas/instructor.ts"
Task: "Create Photo schema in studio/schemas/photo.ts"
```

### Phase 3.4 - All Components Together
```bash
# Launch T026-T032 together:
Task: "StudioInfo component in src/components/StudioInfo.astro"
Task: "MembershipCard component in src/components/MembershipCard.astro"
Task: "InstructorProfile component in src/components/InstructorProfile.astro"
Task: "ContactForm component in src/components/ContactForm.astro"
Task: "PhotoGallery component in src/components/PhotoGallery.astro"
Task: "Header navigation in src/components/Header.astro"
Task: "Footer component in src/components/Footer.astro"
```

## Validation Checklist
*GATE: Checked before task execution begins*

- [x] All contracts have corresponding tests (T006-T010)
- [x] All entities have schema tasks (T021-T024) 
- [x] All tests come before implementation
- [x] Parallel tasks use different files
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] TDD order enforced (tests → schemas → components → pages)

## Notes
- **[P] tasks** = different files, no dependencies - can run simultaneously
- **Verify tests fail** before implementing (RED-GREEN-Refactor cycle)
- **Commit after each task** for proper Git history
- **Mobile-first development** - test on mobile devices throughout
- **Performance targets**: <3s load time, Lighthouse score >90