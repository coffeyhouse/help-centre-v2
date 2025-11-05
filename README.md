# Help Centre v2

A modern, multi-region customer support portal built with React, TypeScript, and Tailwind CSS. This application provides a self-service knowledge base with region-specific content, persona-based filtering, and comprehensive product documentation.

## Features

- **Multi-Region Support**: Dedicated experiences for GB, IE, US, CA, FR, and more
- **Persona-Based Navigation**: Tailored content for customers, accountants, partners, and developers
- **Product-Centric Architecture**: Organized help content by product with topic hierarchies
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

## Configuration

### Region Configuration

Regions are defined in JSON configuration files located in the `public/` directory. Each region has:

- Region code (e.g., `gb`, `us`, `ca`)
- Display name
- Language and currency settings
- Available personas
- Navigation structure

### Content Management

Content is managed through JSON files:

- **Products**: Product definitions, hot topics, and quick access cards
- **Topics**: Support hubs and topic hierarchies
- **Articles**: Help articles organized by topic
- **Contact**: Contact topics and methods

## Development

### Adding a New Region

1. Create a region configuration JSON file in `public/`
2. Add region-specific content files
3. Update the region selector component if needed

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route definition in `src/App.tsx`
3. Create page-specific components in `src/components/pages/`

### Creating Custom Hooks

Custom hooks should be placed in `src/hooks/` and follow the `use*` naming convention.

### Type Definitions

All TypeScript types are centralized in `src/types/index.ts` for consistency and reusability.

## Routing Structure

The application uses region-based routing:

```
/                                    → Redirects to /gb
/:region                            → Home page
/:region/products/:productId        → Product landing page
/:region/products/:productId/topics/:topicId → Topic page
/:region/contact                    → Contact page
```

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

## Key Features

### Scroll-to-Top

Automatically scrolls to the top of the page on route navigation for better UX. Implemented via `ScrollToTop` component.

### Responsive Design

Mobile-first approach with breakpoints for tablet and desktop views using Tailwind CSS.

### Product Filtering

Products can be filtered by persona to show relevant content for different user types.

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
