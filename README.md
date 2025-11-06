# Help Centre v2

A modern, multi-region customer support portal built with React, TypeScript, and Tailwind CSS. This application provides a self-service knowledge base with region-based content architecture, persona-based filtering, and comprehensive product documentation.

## Features

- **Admin Panel**: Password-protected CMS for managing JSON content files with form-based editing and visual preview
- **Region-Based Data Architecture**: Shared content across geographic regions (UK-Ireland, North America, etc.) with country-level filtering
- **Country-Specific Content**: Flexible item-level country filtering for localized information
- **Persona-Based Navigation**: Tailored content for customers, accountants, partners, and developers
- **Product-Centric Architecture**: Topics belong to specific products; contact methods can be product-specific
- **Release Notes Timeline**: Product-specific release notes with automatic navigation integration
- **Incident Banner System**: Multi-state notification banners for service announcements and incidents
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **JSON-Powered Content**: Easy content management without backend changes
- **TypeScript**: Full type safety across the application
- **Automatic Scroll Management**: Smart scroll-to-top on page navigation

## Tech Stack

- **Framework**: React 19.1.1
- **Language**: TypeScript 5.9.3
- **Routing**: React Router DOM 7.9.5
- **Styling**: Tailwind CSS 4.1.16
- **Build Tool**: Vite 7.1.7
- **Linting**: ESLint 9.36.0

## Project Structure

```
help-centre-v2/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── BannerManager.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── IncidentBanner.tsx
│   │   │   └── ScrollToTop.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── RegionSelector.tsx
│   │   └── pages/           # Page-specific components
│   │       ├── ContactPage/
│   │       ├── HomePage/
│   │       ├── ProductLanding/
│   │       └── TopicPage/
│   ├── context/             # React Context providers
│   │   ├── PersonaContext.tsx
│   │   └── RegionContext.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useData.ts
│   │   ├── usePersona.ts
│   │   └── useRegion.ts
│   ├── pages/               # Page components
│   │   ├── ContactPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── ProductLanding.tsx
│   │   ├── ReleaseNotesPage.tsx
│   │   └── TopicPage.tsx
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── dataLoader.ts
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets and JSON data
│   └── data/
│       ├── regions.json     # Country definitions with region mappings
│       ├── regions/         # Regional content (shared across countries)
│       │   └── uk-ireland/
│       │       ├── products.json
│       │       ├── topics.json
│       │       ├── articles.json
│       │       ├── contact.json
│       │       ├── incidents.json
│       │       └── release-notes.json
│       └── countries/       # Country-specific configurations
│           ├── gb/
│           │   └── config.json
│           └── ie/
│               └── config.json
├── docs/                    # Documentation
│   ├── PRD.md              # Product Requirements Document
│   ├── MVP.md              # Minimum Viable Product spec
│   └── IMPLEMENTATION_PLAN.md
└── dist/                    # Production build output
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd help-centre-v2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized production build will be created in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run dev:server` - Start Express API server for admin panel
- `npm run dev:all` - Start both frontend and backend servers
- `npm run build` - Create optimized production build (TypeScript check + Vite build)
- `npm run start` - Start production server (serves built app + API)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Admin Panel

The application includes a password-protected admin panel for managing JSON content files.

**Access:** http://localhost:5173/admin/login

**Features:**
- Form-based editing for products, articles, topics, etc.
- JSON editor with real-time validation
- Visual preview of changes
- Automatic backups before saving
- Password protection

**Setup:**
1. Copy `.env.example` to `.env` and set `ADMIN_PASSWORD`
2. Run `npm run dev:server` (backend) and `npm run dev` (frontend)
3. Navigate to `/admin/login` and enter your password

For detailed documentation, see [ADMIN_README.md](./ADMIN_README.md)

## Data Architecture

### Region-Based Structure

Content is organized by **geographic regions** (not individual countries) to eliminate duplication while supporting country-specific variations:

```
public/data/
├── regions.json                    # Country list with region mappings
├── regions/
│   └── uk-ireland/                 # Shared content for GB & IE
│       ├── products.json           # Products, hot topics, quick access cards
│       ├── topics.json             # Support hubs (product-specific)
│       ├── articles.json           # Help articles by topic
│       ├── contact.json            # Contact methods
│       ├── incidents.json          # Incident banners and notifications
│       └── release-notes.json      # Product release notes
└── countries/
    ├── gb/config.json              # UK-specific configuration
    └── ie/config.json              # Ireland-specific configuration
```

### Country Filtering

Items can optionally specify which countries they apply to using a `countries` field:

- **No `countries` field**: Applies to all countries in the region
- **With `countries: ["gb"]`**: Only shows for United Kingdom
- **With `countries: ["ie"]`**: Only shows for Ireland

**Examples:**

```json
// Applies to all countries in region
{
  "id": "product-a",
  "name": "Product A"
}

// Only shows in Ireland
{
  "id": "vat-returns-ie",
  "title": "Submit VAT returns to Revenue",
  "countries": ["ie"]
}

// Only shows in UK
{
  "id": "phone-gb",
  "phoneNumber": "+44 (0) 191 294 3000",
  "countries": ["gb"]
}
```

### Product-Specific Topics

Each topic (support hub) belongs to **one specific product**:

```json
{
  "id": "manage-vat-product-a",
  "title": "Manage your VAT",
  "productId": "product-a"
}
```

This ensures topics are properly scoped to individual products.

### Product-Specific Contact Methods

Contact methods can optionally specify which products they support using `productIds`:

```json
{
  "id": "live-chat",
  "title": "Live Chat",
  "productIds": ["product-b", "product-c"]
}
```

- **No `productIds` field**: Shows for all products
- **With `productIds`**: Only shows for specified products

This enables product-specific support channels (e.g., chat only for cloud products).

### Configuration

**regions.json** defines available countries and their region mappings:

```json
{
  "code": "gb",
  "name": "United Kingdom",
  "region": "uk-ireland",
  "language": "en-GB",
  "currency": "GBP",
  "currencySymbol": "£"
}
```

**Country configs** (e.g., `countries/gb/config.json`) contain:
- Display name
- Available personas
- Navigation structure

## Development

### Adding a New Geographic Region

When expanding to a new region (e.g., North America):

1. **Create region data folder**: `public/data/regions/north-america/`
2. **Add content files**:
   - `products.json`
   - `topics.json`
   - `articles.json`
   - `contact.json`
3. **Use country filters** for region-specific items (e.g., US vs Canada differences)

### Adding a New Country

When adding a new country to an existing region:

1. **Update `regions.json`** with the new country entry (including `region` field)
2. **Create country config**: `public/data/countries/{country-code}/config.json`
3. **Add country-specific items** to region data using `countries: ["new-country"]`

Example for adding Canada to North America:

```json
// In regions.json
{
  "code": "ca",
  "name": "Canada",
  "region": "north-america",
  "language": "en-CA",
  "currency": "CAD"
}

// In regions/north-america/contact.json
{
  "id": "phone-ca",
  "phoneNumber": "+1 (555) 123-4567",
  "countries": ["ca"]
}
```

### Adding Product-Specific Features

**Topics**: Each topic belongs to one product:

```json
{
  "id": "getting-started-product-f",
  "title": "Getting started",
  "productId": "product-f"
}
```

**Contact Methods**: Optionally restrict to specific products:

```json
{
  "id": "chat-support",
  "title": "Live Chat",
  "productIds": ["product-b", "product-c"]
}
```

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route definition in `src/App.tsx`
3. Create page-specific components in `src/components/pages/`

### Creating Custom Hooks

Custom hooks should be placed in `src/hooks/` and follow the `use*` naming convention.

### Type Definitions

All TypeScript types are centralized in `src/types/index.ts` for consistency and reusability.

### Data Loader

The `dataLoader.ts` utility automatically:
- Maps countries to their geographic regions
- Filters data by country code (respects `countries` field)
- Filters data by product (respects `productIds` field)

No manual filtering needed when using the data loader functions.

## Routing Structure

The application uses country-code-based routing:

```
/                                             → Redirects to /gb
/:countryCode                                 → Home page
/:countryCode/products/:productId             → Product landing page
/:countryCode/products/:productId/release-notes → Product release notes
/:countryCode/products/:productId/topics/:topicId → Topic page
/:countryCode/contact                         → Contact page
```

**Note**: URLs use country codes (e.g., `/gb`, `/ie`) but data is loaded from shared regional files. The dataLoader automatically:
1. Maps the country code to its region (e.g., `gb` → `uk-ireland`)
2. Loads data from the regional files
3. Filters content by the country code

## Context Providers

### RegionContext

Manages the current region selection and provides:
- Current region code
- Region configuration
- Region change handler
- Loading and error states

### PersonaContext

Manages the current persona selection:
- Current persona (customer, accountant, partner, developer)
- Persona change handler

## Architecture Benefits

### Content Reusability

- **Eliminates Duplication**: UK and Ireland share the same products, topics, and articles
- **Scales Efficiently**: Adding a new country to a region doesn't require duplicating content
- **Easy Updates**: Update shared content once, applies to all countries in the region

### Flexible Localization

- **Country-Specific Overrides**: Add country-specific items when needed (e.g., different VAT rates)
- **Product-Specific Support**: Different products can have different contact options (e.g., chat for cloud products)
- **Granular Control**: Filter at the item level, not just file level

### Future-Ready

- **Prepared for Growth**: North America, France, and other regions can be added easily
- **Product-Specific Contact**: Ready for chat bots, specialist teams per product
- **Maintains Performance**: Filtering happens in-memory after loading regional data

## Key Features

### Incident Banner System

Display important notifications, service updates, and incident information to users with contextual targeting and priority management.

**States:**
- `info` (blue) - General announcements and feature updates
- `caution` (yellow) - Warnings, scheduled maintenance, upcoming changes
- `resolved` (green) - Issue resolutions and all-clear notifications
- `error` (red) - Critical issues, service disruptions, urgent alerts

**Scoping Options:**

1. **Global** - Display on all pages across the site
   ```json
   {
     "scope": {
       "type": "global"
     }
   }
   ```

2. **Product-specific** - Target specific products
   ```json
   {
     "scope": {
       "type": "product",
       "productIds": ["product-a", "product-b"]
     }
   }
   ```

3. **Topic-specific** - Target specific topics within products (most granular)
   ```json
   {
     "scope": {
       "type": "topic",
       "productIds": ["product-a"],
       "topicIds": ["banking", "invoicing"]
     }
   }
   ```
   This banner will only display on the specified topic pages within the specified products.
   Example: Only shows on `/gb/products/product-a/topics/banking`

4. **Page-specific** - Target specific routes using patterns
   ```json
   {
     "scope": {
       "type": "page",
       "pagePatterns": ["/contact", "/products/:productId"]
     }
   }
   ```

**Banner Priority:**
When multiple active banners match the current context, the system displays the highest priority banner:
- `error` (highest priority)
- `caution`
- `info`
- `resolved` (lowest priority)

**Configuration Examples:**

Edit `public/data/regions/uk-ireland/incidents.json`:

```json
{
  "banners": [
    {
      "id": "maintenance-2025-01-15",
      "state": "caution",
      "title": "Scheduled Maintenance",
      "message": "Our services will undergo scheduled maintenance on January 15th from 2:00 AM to 6:00 AM GMT.",
      "link": {
        "text": "View maintenance details",
        "url": "https://status.example.com"
      },
      "scope": {
        "type": "global"
      },
      "active": true,
      "countries": ["gb", "ie"]
    },
    {
      "id": "banking-topic-issue",
      "state": "caution",
      "title": "Known Issue: Bank Feed Sync",
      "message": "We're aware of an issue with bank feed synchronization in this section.",
      "link": {
        "text": "View workaround",
        "url": "https://status.example.com"
      },
      "scope": {
        "type": "topic",
        "productIds": ["product-a"],
        "topicIds": ["banking"]
      },
      "active": true
    }
  ]
}
```

**Architecture:**

The incident banner system uses a Layout component pattern to access route parameters:
- `Layout.tsx` wraps all routes using React Router's `<Outlet />` pattern
- `BannerManager` lives inside the route structure, giving it access to `useParams()`
- Captures `productId`, `topicId`, and `subtopicId` from the URL for precise targeting
- Automatically matches active banners against current route context

**Features:**
- Dismissible by users (per session)
- Optional links (internal or external)
- Country-level filtering
- Granular targeting (global → product → topic)
- Color-coded styling with icons
- Priority-based display when multiple banners match
- Responsive design
- Accessible (ARIA labels, semantic HTML)

### Release Notes Timeline

Display product update history in a chronological timeline format with automatic navigation integration.

**Features:**
- Product-specific release notes organized by year
- Timeline layout with visual indicators (dots and connecting lines)
- Categorized information: Features, Improvements, Bug Fixes
- Color-coded icons for each category
- Automatic navigation link on product pages (only appears if product has release notes)
- Country-level filtering support
- Responsive design (mobile and desktop optimized)

**Data Structure:**

Release notes are organized by product in `public/data/regions/{region}/release-notes.json`:

```json
{
  "releaseNotes": {
    "product-a": [
      {
        "id": "release-product-a-2024-11",
        "version": "12.5.1",
        "date": "2024-11-20",
        "title": "Year-End Tax Preparation Update",
        "description": "Essential updates for year-end tax preparation and compliance.",
        "features": [
          "Automatic tax code updates for 2024/2025 tax year",
          "Making Tax Digital (MTD) compliance enhancements"
        ],
        "improvements": [
          "Streamlined bank reconciliation process",
          "Enhanced backup and restore functionality"
        ],
        "fixes": [
          "Fixed issue with CIS deductions not appearing in reports",
          "Resolved printing problems with aged debtor reports"
        ],
        "countries": ["gb", "ie"]
      }
    ],
    "product-b": [...]
  }
}
```

**Field Descriptions:**
- `id` (required) - Unique identifier for the release
- `version` (required) - Version number (e.g., "5.2.0", "12.5.1")
- `date` (required) - Release date in ISO format (YYYY-MM-DD)
- `title` (required) - Release title
- `description` (optional) - Brief description of the release
- `features` (optional) - Array of new features
- `improvements` (optional) - Array of improvements and enhancements
- `fixes` (optional) - Array of bug fixes
- `countries` (optional) - Array of country codes (e.g., ["gb"], ["ie"]) - omit to show in all countries

**Automatic Navigation:**

The release notes link automatically appears in the product landing page navigation bar if the product has release notes:

- Products with release notes: Navigation shows "Hot topics | **Release notes** | Contact us"
- Products without release notes: Navigation shows "Hot topics | Contact us"

**Adding Release Notes:**

1. Edit `public/data/regions/{region}/release-notes.json`
2. Add entries under the appropriate product key
3. Releases are automatically sorted by date (newest first)
4. The navigation link appears automatically if releases exist

**Route:**
- `/:countryCode/products/:productId/release-notes`
- Example: `/gb/products/product-a/release-notes`

### Scroll-to-Top

Automatically scrolls to the top of the page on route navigation for better UX. Implemented via `ScrollToTop` component.

### Responsive Design

Mobile-first approach with breakpoints for tablet and desktop views using Tailwind CSS.

### Product Filtering

Products can be filtered by persona to show relevant content for different user types.

### Smart Data Loading

The application automatically:
- Detects the country from the URL
- Maps to the appropriate region
- Loads regional data
- Filters by country and product as needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [MVP Specification](docs/MVP.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass and linting is clean
4. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions, please contact the development team or open an issue in the repository.
