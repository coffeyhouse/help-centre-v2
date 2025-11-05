# Help Centre MVP - Implementation Plan

**Project:** Help Centre v2 - MVP Implementation
**Regions:** GB (United Kingdom), IE (Ireland)
**Personas:** Customer, Accountant/Bookkeeper
**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS 4
**Target Timeline:** 10 days (split into 10 phases)

---

## Current State Assessment

**Completed:**
- ✅ Vite + React + TypeScript project initialized
- ✅ Tailwind CSS 4 configured
- ✅ Basic project structure exists
- ✅ Documentation reviewed (PRD.md, MVP.md)

**To Build:**
- All application functionality
- All components (layout, common, page-specific)
- Routing infrastructure
- State management (context)
- JSON data structure
- All 4 pages (Homepage, Product Landing, Topic, Contact)

---

## Phase 1: Foundation & Project Structure (Day 1)

**Goal:** Set up the foundational project structure, install dependencies, and create the folder hierarchy

### Tasks:
1. **Install Additional Dependencies**
   ```bash
   npm install react-router-dom
   ```

2. **Create Directory Structure**
   ```
   src/
   ├── components/
   │   ├── layout/          # Header, Footer, Breadcrumb, RegionSelector
   │   ├── common/          # Card, Button, Dropdown, Hero
   │   └── pages/           # Page-specific components
   │       ├── HomePage/
   │       ├── ProductLanding/
   │       ├── TopicPage/
   │       └── ContactPage/
   ├── pages/               # Main page components
   ├── context/             # React Context providers
   ├── hooks/               # Custom hooks
   ├── utils/               # Utility functions
   └── types/               # TypeScript type definitions
   ```

3. **Create TypeScript Type Definitions**
   - `src/types/index.ts` - Global types for Region, Persona, Product, Topic, Article, etc.

4. **Update Tailwind Configuration**
   - Add custom utilities for cards, buttons, links
   - Configure container settings

**Deliverables:**
- ✅ All directories created
- ✅ Dependencies installed
- ✅ Type definitions created
- ✅ Tailwind configured

---

## Phase 2: Data Layer Setup (Day 1-2)

**Goal:** Create all JSON data files and implement data loading utilities

### Tasks:
1. **Create JSON Data Structure**
   ```
   public/
   └── data/
       ├── regions.json
       ├── gb/
       │   ├── config.json
       │   ├── products.json
       │   ├── topics.json
       │   ├── articles.json
       │   └── contact.json
       └── ie/
           ├── config.json
           ├── products.json
           ├── topics.json
           ├── articles.json
           └── contact.json
   ```

2. **Populate JSON Files**
   - **regions.json** - List of available regions (GB, IE)
   - **gb/config.json** - GB region configuration, personas, navigation
   - **gb/products.json** - Products, hot topics, quick access cards for GB
   - **gb/topics.json** - Support hubs/topics for GB
   - **gb/articles.json** - Articles grouped by topic for GB
   - **gb/contact.json** - Contact topics and methods for GB
   - **ie/** - Mirror structure for Ireland with appropriate variations

3. **Create Data Loading Utilities**
   - `src/utils/dataLoader.ts` - Helper functions to fetch JSON data
   - `src/hooks/useData.ts` - Custom hook for data loading with loading/error states

**Deliverables:**
- ✅ All JSON files created and populated
- ✅ Data loading utilities implemented
- ✅ Custom useData hook created

---

## Phase 3: Context & State Management (Day 2)

**Goal:** Implement React Context for region and persona management

### Tasks:
1. **Create RegionContext**
   - `src/context/RegionContext.tsx`
   - Manage current region state
   - Handle region switching
   - Load region configuration
   - Sync with URL parameters

2. **Create PersonaContext**
   - `src/context/PersonaContext.tsx`
   - Manage selected persona state
   - Persist to localStorage
   - Handle persona switching

3. **Create Custom Hooks**
   - `src/hooks/useRegion.ts` - Access region context
   - `src/hooks/usePersona.ts` - Access persona context

4. **Test Context Providers**
   - Ensure region switching works
   - Ensure persona persists in localStorage
   - Verify data loads correctly for each region

**Deliverables:**
- ✅ RegionContext implemented
- ✅ PersonaContext implemented
- ✅ Custom hooks created
- ✅ Context providers tested

---

## Phase 4: Routing Setup (Day 2)

**Goal:** Configure React Router with region-based routing

### Tasks:
1. **Install and Configure React Router**
   - Set up BrowserRouter
   - Define route structure with region parameters

2. **Create Route Configuration**
   - `/` → Redirect to `/gb`
   - `/:region` → HomePage
   - `/:region/products/:productId` → ProductLanding
   - `/:region/products/:productId/topics/:topicId` → TopicPage
   - `/:region/contact` → ContactPage
   - `*` → Redirect to `/gb` (404 fallback)

3. **Create Placeholder Page Components**
   - `src/pages/HomePage.tsx` - Placeholder
   - `src/pages/ProductLanding.tsx` - Placeholder
   - `src/pages/TopicPage.tsx` - Placeholder
   - `src/pages/ContactPage.tsx` - Placeholder

4. **Update App.tsx**
   - Wrap with RegionProvider and PersonaProvider
   - Set up Routes with all paths
   - Add main layout structure

**Deliverables:**
- ✅ React Router configured
- ✅ All routes defined
- ✅ Placeholder pages created
- ✅ App.tsx updated with providers and routes

---

## Phase 5: Common Components (Day 3)

**Goal:** Build reusable UI components used throughout the app

### Tasks:
1. **Create Card Component**
   - `src/components/common/Card.tsx`
   - Props: title, description, icon, onClick, href
   - Styling: White background, hover shadow, clickable
   - Support for navigation (Link component)

2. **Create Button Component**
   - `src/components/common/Button.tsx`
   - Variants: primary (filled black), secondary (outlined), text
   - Sizes: sm, md, lg
   - Support for links and onClick handlers

3. **Create Dropdown Component**
   - `src/components/common/Dropdown.tsx`
   - Props: label, value, options, onChange
   - Accessible select element
   - Tailwind styling

4. **Create Hero Component**
   - `src/components/common/Hero.tsx`
   - Props: title, subtitle, searchBar, searchPlaceholder
   - Black background, white text
   - Optional search bar
   - Responsive grid layout

**Deliverables:**
- ✅ Card component created and styled
- ✅ Button component with all variants
- ✅ Dropdown component created
- ✅ Hero component created
- ✅ All components tested in isolation

---

## Phase 6: Layout Components (Day 3-4)

**Goal:** Build the main layout components (Header, Footer, Breadcrumb, RegionSelector)

### Tasks:
1. **Create Header Component**
   - `src/components/layout/Header.tsx`
   - Black background, white text
   - Logo on left
   - Navigation links (Help Centre, Products, Contact us)
   - RegionSelector on right
   - Sticky positioning
   - Responsive design (mobile menu)

2. **Create RegionSelector Component**
   - `src/components/layout/RegionSelector.tsx`
   - Display current region (GB or IE)
   - Dropdown with both regions
   - Use RegionContext to switch regions
   - Update URL when region changes

3. **Create Footer Component**
   - `src/components/layout/Footer.tsx`
   - Black background, white text
   - Three columns: Popular Products, Product Roadmaps, Useful Links
   - Social media icons (placeholder)
   - Copyright and legal links
   - Responsive design (stacks on mobile)

4. **Create Breadcrumb Component**
   - `src/components/layout/Breadcrumb.tsx`
   - Props: items array with label, path, current flag
   - Arrows between items
   - Current item styled differently
   - Links use React Router Link

**Deliverables:**
- ✅ Header component created
- ✅ RegionSelector integrated in header
- ✅ Footer component created
- ✅ Breadcrumb component created
- ✅ All layout components responsive

---

## Phase 7: Homepage Implementation (Day 4-5)

**Goal:** Build the complete Homepage with all sections

### Tasks:
1. **Create PersonaTabs Component**
   - `src/components/pages/HomePage/PersonaTabs.tsx`
   - Two tabs: Customer, Accountant/Bookkeeper
   - Use PersonaContext for state
   - Green underline for active tab
   - Accessible tab navigation

2. **Create ProductGrid Component**
   - `src/components/pages/HomePage/ProductGrid.tsx`
   - 2x3 grid of product cards
   - Filter products by selected persona
   - Use Card component
   - Link to Product Landing page
   - "See more products" button

3. **Create HotTopics Component**
   - `src/components/pages/HomePage/HotTopics.tsx`
   - Display hot topics from products.json
   - Simple card layout
   - Links to topic pages

4. **Create QuickAccessCards Component**
   - `src/components/pages/HomePage/QuickAccessCards.tsx`
   - 3 cards in a row
   - Account management, Community Hub, Training
   - Use Card component

5. **Assemble HomePage**
   - `src/pages/HomePage.tsx`
   - Use Hero component
   - Add PersonaTabs
   - Add ProductGrid
   - Add HotTopics
   - Add QuickAccessCards
   - Load data using useData hook
   - Handle loading/error states

**Deliverables:**
- ✅ PersonaTabs component created
- ✅ ProductGrid component created with filtering
- ✅ HotTopics component created
- ✅ QuickAccessCards component created
- ✅ Complete HomePage assembled
- ✅ Data loading working
- ✅ Persona filtering working

---

## Phase 8: Product Landing Page (Day 5-6)

**Goal:** Build the Product Landing Page with support hubs

### Tasks:
1. **Create TopNavigation Component**
   - `src/components/pages/ProductLanding/TopNavigation.tsx`
   - Horizontal navigation bar
   - Links: Hot topics, Contact us
   - Use data from region config

2. **Create SupportHubsGrid Component**
   - `src/components/pages/ProductLanding/SupportHubsGrid.tsx`
   - 2x3 grid of support hub cards
   - Filter hubs by current product
   - Use Card component
   - Link to Topic pages
   - "View all support hubs" button

3. **Assemble ProductLanding Page**
   - `src/pages/ProductLanding.tsx`
   - Get productId from route params
   - Load topics for this product
   - Use Breadcrumb component
   - Use TopNavigation component
   - Use Hero component with search
   - Use SupportHubsGrid component
   - Handle loading/error states

**Deliverables:**
- ✅ TopNavigation component created
- ✅ SupportHubsGrid component created
- ✅ Complete ProductLanding page assembled
- ✅ Product filtering working
- ✅ Navigation to topic pages working

---

## Phase 9: Topic Page (Day 6-7)

**Goal:** Build the Topic Page with article listings

### Tasks:
1. **Create TabNavigation Component**
   - `src/components/pages/TopicPage/TabNavigation.tsx`
   - Two tabs: "Support guides", "Get in touch"
   - Green underline for active tab
   - Accessible tab navigation

2. **Create ArticleGrid Component**
   - `src/components/pages/TopicPage/ArticleGrid.tsx`
   - 2-column grid of article cards
   - Filter articles by current topic
   - Use Card component
   - Article links (placeholder for now)

3. **Assemble TopicPage**
   - `src/pages/TopicPage.tsx`
   - Get productId and topicId from route params
   - Load articles for this topic
   - Use Breadcrumb component (Product > Support hubs > Topic)
   - Use Hero component with search
   - Use TabNavigation component
   - Use ArticleGrid component
   - Handle loading/error states

**Deliverables:**
- ✅ TabNavigation component created
- ✅ ArticleGrid component created
- ✅ Complete TopicPage assembled
- ✅ Articles filtered by topic
- ✅ Breadcrumb navigation working

---

## Phase 10: Contact Page (Day 7-8)

**Goal:** Build the Contact Page with form and contact methods

### Tasks:
1. **Create ContactForm Component**
   - `src/components/pages/ContactPage/ContactForm.tsx`
   - Three dropdowns: I'm in, I'm a, I need help with
   - Use Dropdown component
   - Update region when "I'm in" changes
   - Filter products by region

2. **Create TopicsGrid Component**
   - `src/components/pages/ContactPage/TopicsGrid.tsx`
   - 2x3 grid of quick access topics
   - Use data from contact.json
   - Use Card component
   - Link to topic pages

3. **Create ContactMethods Component**
   - `src/components/pages/ContactPage/ContactMethods.tsx`
   - Community Hub card
   - Phone contact card with region-specific number
   - Display support hours
   - Use Button component

4. **Assemble ContactPage**
   - `src/pages/ContactPage.tsx`
   - Use Hero component
   - Use ContactForm component
   - Use TopicsGrid component
   - Use ContactMethods component
   - Load contact data using useData hook
   - Handle loading/error states

**Deliverables:**
- ✅ ContactForm component created
- ✅ TopicsGrid component created
- ✅ ContactMethods component created
- ✅ Complete ContactPage assembled
- ✅ Region-specific contact info working

---

## Phase 11: Testing & Responsive Design (Day 9)

**Goal:** Test all functionality and ensure responsive design works

### Tasks:
1. **Functionality Testing**
   - Test all routes (Homepage, Product Landing, Topic, Contact)
   - Test region switching (GB ↔ IE)
   - Test persona switching (Customer ↔ Accountant)
   - Test product filtering by persona
   - Test navigation between pages
   - Test breadcrumb navigation
   - Test all internal links
   - Test localStorage persistence for persona

2. **Responsive Design Testing**
   - Test on mobile (<640px)
   - Test on tablet (640px-1024px)
   - Test on desktop (>1024px)
   - Verify grids adapt correctly
   - Verify header/footer stack properly
   - Verify navigation works on mobile

3. **Data Loading Testing**
   - Verify GB data loads correctly
   - Verify IE data loads correctly
   - Test loading states display
   - Test error handling
   - Verify JSON files are valid

4. **Bug Fixes**
   - Fix any bugs discovered during testing
   - Address any console errors
   - Fix any TypeScript errors
   - Improve loading states
   - Add error boundaries (if needed)

**Deliverables:**
- ✅ All routes tested and working
- ✅ Region switching working
- ✅ Persona switching working
- ✅ Responsive design verified
- ✅ All bugs fixed
- ✅ No console errors

---

## Phase 12: Polish & Documentation (Day 10)

**Goal:** Final polish, optimization, and documentation

### Tasks:
1. **Code Cleanup**
   - Remove unused imports
   - Remove console.logs
   - Format all code consistently
   - Add comments where needed
   - Verify TypeScript types are correct

2. **Performance Optimization**
   - Add React.lazy() for route components
   - Add Suspense for loading states
   - Optimize images (if any)
   - Verify build size is reasonable

3. **Documentation**
   - Update README.md with:
     - Project overview
     - Installation instructions
     - Development setup
     - Available scripts
     - Project structure
     - How to add new regions/content
   - Create DEPLOYMENT.md with deployment instructions
   - Document component usage (JSDoc comments)

4. **Build & Test Production**
   - Run `npm run build`
   - Test production build with `npm run preview`
   - Verify all routes work in production
   - Verify data loads in production

**Deliverables:**
- ✅ Code cleaned up
- ✅ Performance optimized
- ✅ README.md complete
- ✅ DEPLOYMENT.md created
- ✅ Production build tested
- ✅ Project ready for deployment

---

## Success Criteria

The MVP is considered complete when all of the following are achieved:

### Core Functionality
- ✅ All 4 pages render without errors
- ✅ GB and IE regions both work
- ✅ Customer and Accountant personas both work
- ✅ Region switching updates URL and loads correct data
- ✅ Persona switching filters products correctly
- ✅ All navigation links work correctly
- ✅ Breadcrumb navigation works
- ✅ Data loads from JSON files

### Technical Requirements
- ✅ TypeScript compiles without errors
- ✅ ESLint passes with no errors
- ✅ Production build succeeds
- ✅ No console errors in browser
- ✅ Responsive on mobile, tablet, desktop

### Documentation
- ✅ README.md is complete and accurate
- ✅ Code is well-commented
- ✅ Deployment instructions exist

---

## Risk Mitigation

### Potential Risks:
1. **Risk:** TypeScript types become complex with nested data
   - **Mitigation:** Define clear interfaces early, use strict typing

2. **Risk:** State management becomes complicated
   - **Mitigation:** Keep contexts simple, use custom hooks to encapsulate logic

3. **Risk:** Responsive design breaks on certain devices
   - **Mitigation:** Test early and often, use Tailwind's responsive utilities

4. **Risk:** Data loading performance issues
   - **Mitigation:** Implement caching, use React.memo where appropriate

5. **Risk:** Route changes cause full page reloads
   - **Mitigation:** Ensure React Router Link component is used everywhere

---

## Post-MVP Enhancements (Future)

Once MVP is complete, consider these enhancements:

1. **Search Functionality**
   - Implement search across articles
   - Add search suggestions
   - Highlight matching terms

2. **Chat Assistant**
   - Add placeholder chat widget
   - Position in bottom right
   - Show greeting message

3. **Analytics**
   - Add Google Analytics or similar
   - Track page views by region
   - Track persona selections
   - Track search queries

4. **Additional Regions**
   - Add US, CA, FR, ES, PT, DE, ZA
   - Create translations for non-English regions
   - Test multi-language support

5. **Additional Personas**
   - Add Business Partner persona
   - Add Developer persona
   - Create persona-specific content

6. **Automated Testing**
   - Add unit tests with Vitest
   - Add component tests with React Testing Library
   - Add E2E tests with Playwright

---

## Development Guidelines

### Code Standards:
- Use TypeScript for all new files
- Use functional components with hooks
- Use Tailwind CSS for all styling (no custom CSS unless necessary)
- Follow ESLint rules
- Use React Router Link for internal navigation
- Keep components small and focused
- Extract reusable logic into custom hooks

### Naming Conventions:
- Components: PascalCase (e.g., `HomePage.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useRegion.ts`)
- Utilities: camelCase (e.g., `dataLoader.ts`)
- Types: PascalCase (e.g., `Region`, `Product`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_REGION`)

### File Organization:
- One component per file
- Co-locate related components in subdirectories
- Keep page components in `src/pages/`
- Keep reusable components in `src/components/`
- Keep types in `src/types/`

---

## Timeline Summary

| Phase | Duration | Description |
|-------|----------|-------------|
| 1 | 0.5 day | Foundation & Project Structure |
| 2 | 0.5 day | Data Layer Setup |
| 3 | 0.5 day | Context & State Management |
| 4 | 0.5 day | Routing Setup |
| 5 | 1 day | Common Components |
| 6 | 1 day | Layout Components |
| 7 | 1.5 days | Homepage Implementation |
| 8 | 1 day | Product Landing Page |
| 9 | 1 day | Topic Page |
| 10 | 1 day | Contact Page |
| 11 | 1.5 days | Testing & Responsive Design |
| 12 | 1 day | Polish & Documentation |
| **Total** | **10 days** | **Complete MVP** |

---

## Next Steps

To begin implementation:

1. **Review this plan** with the team
2. **Start with Phase 1** - Foundation & Project Structure
3. **Work sequentially** through each phase
4. **Test continuously** as you build
5. **Document as you go** - don't wait until the end
6. **Commit regularly** with clear commit messages
7. **Ask questions early** if anything is unclear

---

**Document End**
