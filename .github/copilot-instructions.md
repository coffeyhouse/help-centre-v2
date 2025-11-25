# Copilot Instructions - Help Centre v2

## Project Overview
Multi-region customer support portal built with React 19, TypeScript, Vite, and Tailwind CSS 4. Features a JSON-powered CMS, region-based content architecture, and an Express backend for admin functionality and search API proxying.

## Architecture

### Data Architecture: Region Groups
Content is organized by **region groups** (not individual countries):
- **Structure**: `public/data/groups/{group-id}/` (e.g., `uki/`, `north-america/`)
- Each group contains: `config.json`, `products.json`, `topics.json`, `articles.json`, `contact.json`, `incidents.json`, `popups.json`, `release-notes.json`
- **Country filtering**: Items have optional `countries?: string[]` field. Omit to show in all countries within the group.
- Server routes in `server/routes/publicData.js` use `filterByCountry()` to filter JSON responses
- **Product-Topic-Article hierarchy**: Articles belong to topics, topics belong to products

### Routing Pattern
- **Public routes**: `/{countryCode}/...` (e.g., `/gb/products/product-a`)
- **Admin routes**: `/admin/{groupId}/...` (e.g., `/admin/uki/products`)
- Region/country detection via URL path, stored in `RegionContext`

### Context Providers (Order Matters!)
Wrap in this order in `App.tsx`:
1. `AdminAuthProvider` - Admin panel authentication
2. `AdminRegionProvider` - Admin-specific region context
3. `RegionProvider` - Public region/country context (loads from URL)
4. `PersonaProvider` - User persona (customer, accountant, partner, developer)
5. `AuthProvider` - Public user authentication

### Data Loading Pattern
Use the `useData` hook for async data fetching:
```tsx
import { useRegion } from '../hooks/useRegion';
import { useData } from '../hooks/useData';
import { loadProducts } from '../utils/dataLoader';

const { region } = useRegion();
const { data, loading, error } = useData(() => loadProducts(region), [region]);
```

All data loaders in `src/utils/dataLoader.ts` use API routes (`/api/public/data/{group}/{resource}`) not direct file access.

## Development Workflow

### Running the App
**Development**: `npm run dev:all` (starts both servers simultaneously)
- Frontend (Vite): `http://localhost:5173`
- Backend (Express): `http://localhost:3001`
- **OR** run separately: `npm run dev:server` then `npm run dev`

**Production**: `npm run build` then `npm start`

### Admin Panel Access
- URL: `/admin/login`
- Password stored in `.env` as `ADMIN_PASSWORD`
- Protected routes use `<ProtectedRoute>` component checking `AdminAuthContext`
- Session-based auth (token in `sessionStorage`)

### API Proxy Pattern
Vite proxies `/api` to Express (`vite.config.ts` → `server: { proxy }`). External search API credentials stored server-side in `.env` to avoid client exposure.

## Key Conventions

### TypeScript Types
- All types in `src/types/index.ts`
- Use interfaces for data structures: `Product`, `SupportHub`, `ArticleItem`, `Region`, etc.
- Persona types: `PersonaId = 'customer' | 'accountant' | 'partner' | 'developer'`

### Component Organization
- `src/components/common/` - Reusable UI (Button, Card, Modal, Icon, Hero, BannerManager, PopupManager)
- `src/components/layout/` - Layout-level (Header, Footer, Breadcrumb, RegionSelector)
- `src/components/pages/` - Page-specific components grouped by page
- `src/components/admin/` - Admin panel components (forms, editors, drag-drop)

### File Naming
- Components: PascalCase (e.g., `HomePage.tsx`, `BannerManager.tsx`)
- Utilities/hooks: camelCase (e.g., `dataLoader.ts`, `useRegion.ts`)
- JSON data files: kebab-case (e.g., `products.json`, `release-notes.json`)

### Admin Content Management
- All JSON edits go through Express API routes (`/api/files/{groupId}/{resource}`)
- Automatic backups created with `.backup-{timestamp}` suffix
- Admin editors in `src/components/admin/editors/` use form-based editing + JSON view toggle
- Drag-and-drop reordering uses `useDragAndDrop` hook

### Icon System
Uses `@heroicons/react` exclusively. Icon components:
- Import: `import { HomeIcon } from '@heroicons/react/24/outline'`
- Helper component: `<Icon icon="home" />` in `src/components/common/Icon.tsx`
- Admin IconSelector component for JSON icon field editing

### Search Integration
- External API proxied via `/api/search`
- Server builds request with auth headers from `.env` (`SEARCH_API_KEY`, `SEARCH_API_TOKEN`)
- Client calls: `fetch('/api/search?q=...')`
- Results link to internal articles via `knowledgebase_collection` mapping in `Product` type

## Common Patterns

### Adding New Region Group
1. Create folder: `public/data/groups/{group-id}/`
2. Add JSON files: `config.json`, `products.json`, `topics.json`, `articles.json`, `contact.json`, `incidents.json`, `popups.json`, `release-notes.json`
3. Update `config.json` with countries array and group metadata
4. Server auto-discovers groups from filesystem

### Country-Specific Content
Add `countries?: string[]` to any item:
```json
{
  "id": "item-1",
  "title": "UK Only Item",
  "countries": ["gb"]  // Omit for all countries
}
```

### Persona Filtering
Products/content filtered by `personas: PersonaId[]` field. Use `PersonaContext` to get active persona, filter arrays in components.

### Page Titles
Use `usePageTitle('Page Name')` hook to set document title with region name appended.

## Testing & Debugging
- **No test suite configured** - manual testing only
- ESLint: `npm run lint`
- Check browser console for data loading logs (`[dataLoader]`, `[fetchJSON]` prefixes)
- Admin panel logs write operations to server console

## Important Notes
- **Breaking change**: Content moved from `public/data/regions/` to `public/data/groups/` structure
- All data fetching goes through Express API (no direct public folder access)
- Admin password authentication is basic - upgrade before production deployment
- Tailwind 4 syntax differs from v3 (uses CSS variables, new @layer syntax)
