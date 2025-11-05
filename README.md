# Help Centre v2

A modern, multi-region customer support portal built with React, TypeScript, and Tailwind CSS. This application provides a self-service knowledge base with region-based content architecture, persona-based filtering, and comprehensive product documentation.

## Features

- **Region-Based Data Architecture**: Shared content across geographic regions (UK-Ireland, North America, etc.) with country-level filtering
- **Country-Specific Content**: Flexible item-level country filtering for localized information
- **Persona-Based Navigation**: Tailored content for customers, accountants, partners, and developers
- **Product-Centric Architecture**: Topics belong to specific products; contact methods can be product-specific
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
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Icon.tsx
│   │   │   └── ScrollToTop.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
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
│       │       └── contact.json
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
- `npm run build` - Create optimized production build (TypeScript check + Vite build)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

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
│       └── contact.json            # Contact methods
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
