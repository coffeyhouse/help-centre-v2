# Help Centre MVP - Technical Specification

## Document Information

**Project:** Help Centre MVP  
**Version:** 1.0 MVP  
**Date:** November 5, 2025  
**Status:** Ready for Development  

---

## MVP Scope

### What's Included
- **Regions:** UK (GB), Ireland (IE) only
- **Personas:** Customer, Accountant/Bookkeeper only
- **Pages:** All 4 core pages (Homepage, Product Landing, Topic Page, Contact)
- **Technology:** React + Vite + Tailwind CSS
- **Content:** JSON-based, static data
- **Styling:** Basic Tailwind wireframes, no branding

### What's Excluded
- Business Partner and Developer personas
- Other regions (US, CA, FR, ES, PT, DE, ZA)
- Chat assistant integration
- Search functionality (can be added post-MVP)
- Analytics tracking
- Translations (English only)
- Authentication/user accounts

---

## Technical Stack

### Core Technologies
- **Framework:** React 18+
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** React Context API (for region/persona state)
- **Data:** Static JSON files in `/public/data`

### Development Tools
- **Package Manager:** npm or yarn
- **Linting:** ESLint
- **Formatting:** Prettier
- **Version Control:** Git

---

## Project Structure

```
help-centre-mvp/
├── public/
│   ├── data/
│   │   ├── regions.json
│   │   ├── gb/
│   │   │   ├── config.json
│   │   │   ├── products.json
│   │   │   ├── topics.json
│   │   │   ├── articles.json
│   │   │   └── contact.json
│   │   └── ie/
│   │       ├── config.json
│   │       ├── products.json
│   │       ├── topics.json
│   │       ├── articles.json
│   │       └── contact.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   └── RegionSelector.jsx
│   │   ├── common/
│   │   │   ├── Card.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   └── Hero.jsx
│   │   └── pages/
│   │       ├── HomePage/
│   │       │   ├── PersonaTabs.jsx
│   │       │   ├── ProductGrid.jsx
│   │       │   ├── HotTopics.jsx
│   │       │   └── QuickAccessCards.jsx
│   │       ├── ProductLanding/
│   │       │   ├── TopNavigation.jsx
│   │       │   └── SupportHubsGrid.jsx
│   │       ├── TopicPage/
│   │       │   ├── TabNavigation.jsx
│   │       │   └── ArticleGrid.jsx
│   │       └── ContactPage/
│   │           ├── ContactForm.jsx
│   │           ├── TopicsGrid.jsx
│   │           └── ContactMethods.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ProductLanding.jsx
│   │   ├── TopicPage.jsx
│   │   └── ContactPage.jsx
│   ├── context/
│   │   ├── RegionContext.jsx
│   │   └── PersonaContext.jsx
│   ├── hooks/
│   │   ├── useRegion.js
│   │   ├── usePersona.js
│   │   └── useData.js
│   ├── utils/
│   │   ├── regionDetection.js
│   │   └── dataLoader.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## JSON Data Structure

### `/public/data/regions.json`
```json
{
  "regions": [
    {
      "code": "gb",
      "name": "United Kingdom",
      "language": "en-GB",
      "currency": "GBP",
      "currencySymbol": "£",
      "dateFormat": "DD/MM/YYYY",
      "default": true
    },
    {
      "code": "ie",
      "name": "Ireland",
      "language": "en-IE",
      "currency": "EUR",
      "currencySymbol": "€",
      "dateFormat": "DD/MM/YYYY",
      "default": false
    }
  ]
}
```

### `/public/data/gb/config.json`
```json
{
  "region": "gb",
  "displayName": "United Kingdom",
  "personas": [
    {
      "id": "customer",
      "label": "I'm a Customer",
      "default": true
    },
    {
      "id": "accountant",
      "label": "I'm an Accountant or Bookkeeper",
      "default": false
    }
  ],
  "navigation": {
    "main": [
      { "label": "Help Centre", "path": "/gb", "icon": "home" },
      { "label": "Products", "path": "/gb/products", "type": "dropdown" },
      { "label": "Contact us", "path": "/gb/contact" }
    ]
  }
}
```

### `/public/data/gb/products.json`
```json
{
  "products": [
    {
      "id": "product-a",
      "name": "Product A",
      "description": "Desktop accounting software",
      "personas": ["customer", "accountant"],
      "icon": "icon-a"
    },
    {
      "id": "product-b",
      "name": "Product B",
      "description": "Cloud-based accounting",
      "personas": ["customer", "accountant"],
      "icon": "icon-b"
    },
    {
      "id": "product-c",
      "name": "Product C",
      "description": "Payroll software",
      "personas": ["customer"],
      "icon": "icon-c"
    },
    {
      "id": "product-d",
      "name": "Product D",
      "description": "Tax management",
      "personas": ["accountant"],
      "icon": "icon-d"
    },
    {
      "id": "product-e",
      "name": "Product E",
      "description": "Invoice management",
      "personas": ["customer", "accountant"],
      "icon": "icon-e"
    },
    {
      "id": "product-f",
      "name": "Product F",
      "description": "Expense tracking",
      "personas": ["customer"],
      "icon": "icon-f"
    }
  ],
  "hotTopics": [
    {
      "id": "2fa",
      "title": "2-factor authentication (2FA)",
      "icon": "lock"
    },
    {
      "id": "whats-new",
      "title": "What's new in 2025",
      "icon": "star"
    }
  ],
  "quickAccessCards": [
    {
      "id": "account-mgmt",
      "title": "Account management and services",
      "description": "Register your software, access your invoices, and download software updates to stay up to date.",
      "icon": "checklist"
    },
    {
      "id": "community",
      "title": "Visit Community Hub",
      "description": "Community Hub is the place to ask questions, share tips and ideas, get practical advice and all the breaking news.",
      "icon": "community"
    },
    {
      "id": "training",
      "title": "Free training",
      "description": "100% free courses available across all products.",
      "icon": "graduation"
    }
  ]
}
```

### `/public/data/gb/topics.json`
```json
{
  "supportHubs": [
    {
      "id": "install-software",
      "title": "Install your software",
      "description": "Everything you need to install your software.",
      "icon": "download",
      "productIds": ["product-a", "product-c"]
    },
    {
      "id": "manage-vat",
      "title": "Manage your VAT",
      "description": "Record VAT transactions and produce VAT Returns.",
      "icon": "document",
      "productIds": ["product-a", "product-b", "product-d"]
    },
    {
      "id": "banking",
      "title": "Working with the bank",
      "description": "Record and keep track of money paid and received.",
      "icon": "bank",
      "productIds": ["product-a", "product-b"]
    },
    {
      "id": "remote-access",
      "title": "Run your accounts remotely",
      "description": "Don't be tied to the office, work flexibly with Remote Data Access.",
      "icon": "remote",
      "productIds": ["product-a"]
    },
    {
      "id": "year-end",
      "title": "Financial year end",
      "description": "Complete your year end, then get ready for the new year.",
      "icon": "calendar",
      "productIds": ["product-a", "product-b"]
    },
    {
      "id": "getting-started",
      "title": "Getting started",
      "description": "New to this product? Start here for basics.",
      "icon": "play",
      "productIds": ["product-a", "product-b", "product-c", "product-d", "product-e", "product-f"]
    }
  ]
}
```

### `/public/data/gb/articles.json`
```json
{
  "articles": {
    "install-software": [
      {
        "id": "whats-new",
        "title": "What's new?",
        "description": "Find out more about the latest improvements and features.",
        "topicId": "install-software"
      },
      {
        "id": "first-time",
        "title": "New to this product?",
        "description": "Installing for the first time? Don't worry it's a quick and easy process.",
        "topicId": "install-software"
      },
      {
        "id": "install-guide",
        "title": "Install your software",
        "description": "Install software on a new computer.",
        "topicId": "install-software"
      },
      {
        "id": "upgrade",
        "title": "Upgrade your installed software",
        "description": "Upgrade to the latest version and get the most from your software.",
        "topicId": "install-software"
      },
      {
        "id": "older-versions",
        "title": "Download older versions",
        "description": "You can download older versions here.",
        "topicId": "install-software"
      },
      {
        "id": "troubleshooting",
        "title": "Common queries and troubleshooting",
        "description": "Not going as expected? Check these common queries.",
        "topicId": "install-software"
      }
    ],
    "manage-vat": [
      {
        "id": "vat-setup",
        "title": "Set up VAT",
        "description": "Configure your VAT settings correctly.",
        "topicId": "manage-vat"
      },
      {
        "id": "vat-returns",
        "title": "Submit VAT returns",
        "description": "How to submit your VAT return online.",
        "topicId": "manage-vat"
      }
    ]
  }
}
```

### `/public/data/gb/contact.json`
```json
{
  "contactTopics": [
    {
      "id": "install-software",
      "title": "Install your software",
      "icon": "download"
    },
    {
      "id": "manage-vat",
      "title": "Manage your VAT",
      "icon": "document"
    },
    {
      "id": "banking",
      "title": "Working with the bank",
      "icon": "bank"
    },
    {
      "id": "remote-access",
      "title": "Run your accounts remotely",
      "icon": "remote"
    },
    {
      "id": "year-end",
      "title": "Financial year end",
      "icon": "calendar"
    },
    {
      "id": "other",
      "title": "Something else...",
      "icon": "question"
    }
  ],
  "contactMethods": [
    {
      "id": "community",
      "type": "card",
      "title": "Tap into the wisdom of our community forums",
      "icon": "community",
      "buttonLabel": "Go to Community Hub",
      "buttonStyle": "primary"
    },
    {
      "id": "phone",
      "type": "action",
      "title": "Telephone",
      "description": "Give us a call and talk to one of our experts on the phone.",
      "icon": "phone",
      "buttonLabel": "Call now",
      "buttonStyle": "outline",
      "phoneNumber": "+44 (0) 191 294 3000",
      "hours": "Monday-Friday, 9:00-17:00 GMT"
    }
  ]
}
```

---

## Component Specifications

### Layout Components

#### `Header.jsx`
```jsx
// Header with navigation and region selector
// - Black background (bg-black)
// - White text (text-white)
// - Contains: Logo, Navigation links, Region selector
// - Sticky on scroll (sticky top-0)
// - Full width, max-width container
```

**Props:** None (uses context for region/navigation)

**Tailwind Classes:**
- Container: `bg-black text-white sticky top-0 z-50`
- Inner wrapper: `container mx-auto px-4 py-4 flex items-center justify-between`
- Nav links: `flex gap-6 text-sm hover:text-gray-300`

#### `Footer.jsx`
```jsx
// Footer with social links and site links
// - Black background
// - Three columns: Popular Products, Product Roadmaps, Useful Links
// - Social media icons row
// - Copyright and legal links
```

**Tailwind Classes:**
- Container: `bg-black text-white mt-auto`
- Inner wrapper: `container mx-auto px-4 py-8`
- Grid: `grid grid-cols-1 md:grid-cols-3 gap-8`

#### `Breadcrumb.jsx`
```jsx
// Breadcrumb navigation
// - Shows: Region > Product > Topic > Current Page
// - Clickable links with arrows between
```

**Props:**
```typescript
interface BreadcrumbProps {
  items: Array<{
    label: string;
    path?: string;
    current?: boolean;
  }>;
}
```

**Tailwind Classes:**
- Container: `flex items-center gap-2 text-sm text-gray-600 mb-4`
- Separator: `text-gray-400`
- Current item: `text-gray-900 font-medium`

#### `RegionSelector.jsx`
```jsx
// Region dropdown selector
// - Shows current region (GB or IE)
// - Dropdown to switch regions
// - Updates URL and reloads data
```

**Tailwind Classes:**
- Button: `flex items-center gap-2 px-3 py-2 border border-white/20 rounded hover:bg-white/10`
- Dropdown: `absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg`

### Common Components

#### `Card.jsx`
```jsx
// Reusable card component
// - White background
// - Shadow on hover
// - Clickable with arrow/chevron
// - Icon on left, text on right
```

**Props:**
```typescript
interface CardProps {
  title: string;
  description?: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
}
```

**Tailwind Classes:**
- Container: `bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer`
- Icon area: `w-12 h-12 bg-gray-100 rounded flex items-center justify-center mb-4`
- Title: `text-lg font-semibold mb-2`
- Description: `text-sm text-gray-600`

#### `Button.jsx`
```jsx
// Button component with variants
// - Variants: primary (filled), secondary (outline), text
// - Sizes: sm, md, lg
```

**Props:**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  href?: string;
}
```

**Tailwind Classes:**
- Primary: `bg-black text-white px-6 py-2 rounded hover:bg-gray-800`
- Secondary: `border border-black text-black px-6 py-2 rounded hover:bg-gray-50`
- Text: `text-black hover:underline`

#### `Dropdown.jsx`
```jsx
// Dropdown select component
// - Label above
// - Select with options
// - Styled to match design
```

**Props:**
```typescript
interface DropdownProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}
```

**Tailwind Classes:**
- Container: `mb-4`
- Label: `block text-sm font-medium mb-2`
- Select: `w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black`

#### `Hero.jsx`
```jsx
// Hero section component
// - Black background
// - White text
// - Heading + subheading
// - Optional search bar
// - Illustration on right (placeholder)
```

**Props:**
```typescript
interface HeroProps {
  title: string;
  subtitle: string;
  searchBar?: boolean;
  searchPlaceholder?: string;
}
```

**Tailwind Classes:**
- Container: `bg-black text-white py-16`
- Inner wrapper: `container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center`
- Title: `text-4xl md:text-5xl font-bold mb-4`
- Subtitle: `text-lg text-gray-300 mb-6`

---

## Page Components

### 1. HomePage (`src/pages/HomePage.jsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│ Header (with region selector)       │
├─────────────────────────────────────┤
│ Hero Section                        │
│ - Welcome title                     │
│ - Subtitle                          │
│ - Illustration (right)              │
├─────────────────────────────────────┤
│ Persona Tabs                        │
│ [Customer] [Accountant]             │
├─────────────────────────────────────┤
│ Product Grid (2x3)                  │
│ ┌────┐ ┌────┐ ┌────┐              │
│ │ A  │ │ B  │ │ C  │              │
│ └────┘ └────┘ └────┘              │
│ ┌────┐ ┌────┐ ┌────┐              │
│ │ D  │ │ E  │ │ F  │              │
│ └────┘ └────┘ └────┘              │
│ [See more products]                 │
├─────────────────────────────────────┤
│ Hot Topics                          │
│ ┌──────────────────────┐           │
│ │ 2FA                  │           │
│ └──────────────────────┘           │
├─────────────────────────────────────┤
│ Quick Access Cards (3 columns)     │
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ Acct │ │ Comm │ │ Train│        │
│ └──────┘ └──────┘ └──────┘        │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**State Management:**
```javascript
const [selectedPersona, setSelectedPersona] = useState('customer');
const [products, setProducts] = useState([]);
const [filteredProducts, setFilteredProducts] = useState([]);
```

**Data Loading:**
```javascript
useEffect(() => {
  // Load products based on region and persona
  const loadData = async () => {
    const response = await fetch(`/data/${region}/products.json`);
    const data = await response.json();
    setProducts(data.products);
  };
  loadData();
}, [region]);

useEffect(() => {
  // Filter products by selected persona
  const filtered = products.filter(p => 
    p.personas.includes(selectedPersona)
  );
  setFilteredProducts(filtered);
}, [products, selectedPersona]);
```

**Route:** `/` or `/:region` (e.g., `/gb`, `/ie`)

### 2. ProductLanding (`src/pages/ProductLanding.jsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Breadcrumb: Product A               │
├─────────────────────────────────────┤
│ Top Navigation                      │
│ Hot topics | Contact us             │
├─────────────────────────────────────┤
│ Hero Section                        │
│ "You need help. We have answers."   │
│ [Search bar]                        │
├─────────────────────────────────────┤
│ Support Hubs Grid (2x3)             │
│ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │Install │ │  VAT   │ │ Banking│  │
│ └────────┘ └────────┘ └────────┘  │
│ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │ Remote │ │Yr End  │ │ Start  │  │
│ └────────┘ └────────┘ └────────┘  │
│ [View all support hubs]             │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**Route:** `/:region/products/:productId`

**Data Loading:**
```javascript
const { region, productId } = useParams();
const [supportHubs, setSupportHubs] = useState([]);

useEffect(() => {
  const loadData = async () => {
    const response = await fetch(`/data/${region}/topics.json`);
    const data = await response.json();
    // Filter support hubs for this product
    const filtered = data.supportHubs.filter(hub =>
      hub.productIds.includes(productId)
    );
    setSupportHubs(filtered);
  };
  loadData();
}, [region, productId]);
```

### 3. TopicPage (`src/pages/TopicPage.jsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Breadcrumb                          │
│ Product A > Support hubs > Install  │
├─────────────────────────────────────┤
│ Hero Section                        │
│ "Install your software"             │
│ [Search bar]                        │
├─────────────────────────────────────┤
│ Tab Navigation                      │
│ [Support guides] [Get in touch]     │
├─────────────────────────────────────┤
│ Article Grid (2 columns)            │
│ ┌─────────────┐ ┌─────────────┐   │
│ │ What's new? │ │ First time? │   │
│ └─────────────┘ └─────────────┘   │
│ ┌─────────────┐ ┌─────────────┐   │
│ │Install guide│ │  Upgrade    │   │
│ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**Route:** `/:region/products/:productId/topics/:topicId`

**State Management:**
```javascript
const [activeTab, setActiveTab] = useState('support-guides');
const [articles, setArticles] = useState([]);
```

### 4. ContactPage (`src/pages/ContactPage.jsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Hero: "Get in touch"                │
├─────────────────────────────────────┤
│ Contact Form                        │
│ [ I'm in: UK ▼ ]                   │
│ [ I'm a: Customer ▼ ]              │
│ [ I need help with: Product A ▼ ]  │
├─────────────────────────────────────┤
│ Quick Access Topics Grid (2x3)      │
│ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │Install │ │  VAT   │ │ Banking│  │
│ └────────┘ └────────┘ └────────┘  │
├─────────────────────────────────────┤
│ Contact Methods                     │
│ ┌───────────────────────────┐      │
│ │ Community Forums          │      │
│ │ [Go to Community Hub]     │      │
│ └───────────────────────────┘      │
│ ┌──────────┐ ┌──────────┐         │
│ │ Phone    │ │          │         │
│ │[Call now]│ │          │         │
│ └──────────┘ └──────────┘         │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**Route:** `/:region/contact`

**State Management:**
```javascript
const [formRegion, setFormRegion] = useState(region);
const [formPersona, setFormPersona] = useState('customer');
const [formProduct, setFormProduct] = useState('');
const [contactMethods, setContactMethods] = useState([]);
```

---

## Routing Configuration

### `App.jsx`
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RegionProvider } from './context/RegionContext';
import { PersonaProvider } from './context/PersonaContext';

// Pages
import HomePage from './pages/HomePage';
import ProductLanding from './pages/ProductLanding';
import TopicPage from './pages/TopicPage';
import ContactPage from './pages/ContactPage';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
  return (
    <BrowserRouter>
      <RegionProvider>
        <PersonaProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                {/* Root redirects to default region */}
                <Route path="/" element={<Navigate to="/gb" replace />} />
                
                {/* Region-based routes */}
                <Route path="/:region" element={<HomePage />} />
                <Route path="/:region/products/:productId" element={<ProductLanding />} />
                <Route path="/:region/products/:productId/topics/:topicId" element={<TopicPage />} />
                <Route path="/:region/contact" element={<ContactPage />} />
                
                {/* 404 */}
                <Route path="*" element={<Navigate to="/gb" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </PersonaProvider>
      </RegionProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## Context API Implementation

### `RegionContext.jsx`
```jsx
import { createContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const RegionContext = createContext();

export function RegionProvider({ children }) {
  const { region: urlRegion } = useParams();
  const navigate = useNavigate();
  const [region, setRegion] = useState(urlRegion || 'gb');
  const [regionConfig, setRegionConfig] = useState(null);

  // Load region configuration
  useEffect(() => {
    const loadRegionConfig = async () => {
      try {
        const response = await fetch(`/data/${region}/config.json`);
        const data = await response.json();
        setRegionConfig(data);
      } catch (error) {
        console.error('Failed to load region config:', error);
      }
    };
    
    if (region) {
      loadRegionConfig();
    }
  }, [region]);

  // Sync with URL parameter
  useEffect(() => {
    if (urlRegion && urlRegion !== region) {
      setRegion(urlRegion);
    }
  }, [urlRegion]);

  const changeRegion = (newRegion) => {
    setRegion(newRegion);
    // Navigate to the new region homepage
    navigate(`/${newRegion}`);
  };

  return (
    <RegionContext.Provider value={{ region, regionConfig, changeRegion }}>
      {children}
    </RegionContext.Provider>
  );
}
```

### `PersonaContext.jsx`
```jsx
import { createContext, useState, useEffect } from 'react';

export const PersonaContext = createContext();

export function PersonaProvider({ children }) {
  const [persona, setPersona] = useState(() => {
    // Load from localStorage if available
    return localStorage.getItem('selectedPersona') || 'customer';
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('selectedPersona', persona);
  }, [persona]);

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}
```

---

## Custom Hooks

### `useRegion.js`
```javascript
import { useContext } from 'react';
import { RegionContext } from '../context/RegionContext';

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within RegionProvider');
  }
  return context;
}
```

### `usePersona.js`
```javascript
import { useContext } from 'react';
import { PersonaContext } from '../context/PersonaContext';

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within PersonaProvider');
  }
  return context;
}
```

### `useData.js`
```javascript
import { useState, useEffect } from 'react';

export function useData(region, dataFile) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/data/${region}/${dataFile}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${dataFile}`);
        }
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (region && dataFile) {
      loadData();
    }
  }, [region, dataFile]);

  return { data, loading, error };
}
```

---

## Tailwind Configuration

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors if needed
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
    },
  },
  plugins: [],
}
```

### `index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
@layer components {
  .card-hover {
    @apply transition-all duration-200 hover:shadow-lg hover:scale-105;
  }
  
  .link-hover {
    @apply transition-colors duration-200 hover:text-gray-600;
  }
  
  .btn-primary {
    @apply bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors;
  }
  
  .btn-secondary {
    @apply border border-black text-black px-6 py-2 rounded-md hover:bg-gray-50 transition-colors;
  }
}
```

---

## Installation & Setup

### Step 1: Create Vite Project
```bash
npm create vite@latest help-centre-mvp -- --template react
cd help-centre-mvp
```

### Step 2: Install Dependencies
```bash
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3: Configure Tailwind
Update `tailwind.config.js` with configuration above.

Update `src/index.css` with Tailwind directives.

### Step 4: Create Directory Structure
```bash
mkdir -p src/{components/{layout,common,pages/{HomePage,ProductLanding,TopicPage,ContactPage}},pages,context,hooks,utils}
mkdir -p public/data/{gb,ie}
```

### Step 5: Create JSON Data Files
Create all JSON files in `/public/data/` as specified above.

### Step 6: Start Development Server
```bash
npm run dev
```

---

## Development Checklist

### Phase 1: Setup (Day 1)
- [ ] Initialize Vite + React project
- [ ] Install and configure Tailwind CSS
- [ ] Install React Router
- [ ] Create directory structure
- [ ] Set up JSON data files for GB and IE

### Phase 2: Layout Components (Day 1-2)
- [ ] Create Header component
- [ ] Create Footer component
- [ ] Create Breadcrumb component
- [ ] Create RegionSelector component
- [ ] Test layout on all breakpoints

### Phase 3: Common Components (Day 2-3)
- [ ] Create Card component
- [ ] Create Button component
- [ ] Create Dropdown component
- [ ] Create Hero component
- [ ] Test all components in isolation

### Phase 4: Context & Hooks (Day 3)
- [ ] Implement RegionContext
- [ ] Implement PersonaContext
- [ ] Create useRegion hook
- [ ] Create usePersona hook
- [ ] Create useData hook
- [ ] Test context providers

### Phase 5: Homepage (Day 4-5)
- [ ] Create HomePage component
- [ ] Create PersonaTabs component
- [ ] Create ProductGrid component
- [ ] Create HotTopics component
- [ ] Create QuickAccessCards component
- [ ] Test persona filtering
- [ ] Test region switching

### Phase 6: Product Landing Page (Day 5-6)
- [ ] Create ProductLanding component
- [ ] Create TopNavigation component
- [ ] Create SupportHubsGrid component
- [ ] Test product data loading
- [ ] Test hub filtering by product

### Phase 7: Topic Page (Day 6-7)
- [ ] Create TopicPage component
- [ ] Create TabNavigation component
- [ ] Create ArticleGrid component
- [ ] Test article loading
- [ ] Test breadcrumb navigation

### Phase 8: Contact Page (Day 7-8)
- [ ] Create ContactPage component
- [ ] Create ContactForm component
- [ ] Create TopicsGrid component
- [ ] Create ContactMethods component
- [ ] Test form interactions
- [ ] Test region-specific contact info

### Phase 9: Testing & Polish (Day 9-10)
- [ ] Test all routes
- [ ] Test region switching on all pages
- [ ] Test persona switching
- [ ] Test responsive design on mobile
- [ ] Test responsive design on tablet
- [ ] Fix any bugs
- [ ] Code cleanup
- [ ] Add loading states
- [ ] Add error handling

### Phase 10: Documentation (Day 10)
- [ ] Write README.md
- [ ] Document component usage
- [ ] Document data structure
- [ ] Create development guide
- [ ] Create deployment guide

---

## Testing Strategy

### Manual Testing Checklist

#### Region Functionality
- [ ] Default region (GB) loads correctly
- [ ] Can switch to IE from GB
- [ ] Can switch to GB from IE
- [ ] Region persists across page navigation
- [ ] Region-specific content loads correctly
- [ ] Region-specific contact info displays

#### Persona Functionality
- [ ] Default persona (Customer) loads correctly
- [ ] Can switch to Accountant persona
- [ ] Products filter by persona
- [ ] Persona persists across pages
- [ ] Persona selection saves to localStorage

#### Navigation
- [ ] All internal links work correctly
- [ ] Breadcrumbs show correct path
- [ ] Breadcrumb links navigate correctly
- [ ] Back button works as expected
- [ ] URL reflects current page/region

#### Data Loading
- [ ] Products load for GB
- [ ] Products load for IE
- [ ] Topics load for products
- [ ] Articles load for topics
- [ ] Contact info loads per region
- [ ] Loading states display
- [ ] Errors handled gracefully

#### Responsive Design
- [ ] Mobile (< 640px) renders correctly
- [ ] Tablet (640px - 1024px) renders correctly
- [ ] Desktop (> 1024px) renders correctly
- [ ] Navigation works on mobile
- [ ] Grid layouts adapt to screen size

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Implement React.lazy() for route components
   - Use Suspense for loading states

2. **Data Caching**
   - Cache loaded JSON data in context
   - Avoid re-fetching on every render

3. **Image Optimization**
   - Use SVG icons where possible
   - Optimize any images before deployment

4. **Code Splitting**
   - Split code by routes
   - Split large components

5. **Build Optimization**
   - Use Vite's built-in optimizations
   - Minify production build

---

## Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Checklist
- [ ] Update base URL in vite.config.js if needed
- [ ] Test production build locally
- [ ] Ensure all JSON files are in /public/data
- [ ] Configure server for SPA routing
- [ ] Set up 404 redirects to index.html
- [ ] Test on deployed environment

### Server Configuration (Example for Nginx)
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
- [ ] Search functionality
- [ ] Chat assistant placeholder
- [ ] Analytics integration
- [ ] Loading animations
- [ ] Error boundary components
- [ ] 404 page design
- [ ] Keyboard shortcuts
- [ ] Print styles

### Additional Regions
- [ ] Add US region data
- [ ] Add CA region data
- [ ] Add FR region data (with translations)
- [ ] Add remaining regions

### Additional Personas
- [ ] Business Partner persona
- [ ] Developer persona
- [ ] Persona-specific content

---

## Known Limitations (MVP)

1. **No Search**: Search functionality not implemented
2. **No Chat**: Chat assistant not integrated
3. **No Analytics**: No tracking or analytics
4. **No Authentication**: No user accounts or login
5. **Static Data**: All data is static JSON (no API)
6. **English Only**: No translations for IE (both use English)
7. **No Images**: Placeholder icons only, no real images
8. **Basic Styling**: Wireframe-level styling, no branding
9. **No Tests**: No automated tests (manual testing only)
10. **No CI/CD**: No automated deployment pipeline

---

## Success Criteria

### MVP is complete when:
- [ ] All 4 pages render without errors
- [ ] GB and IE regions both work
- [ ] Customer and Accountant personas both work
- [ ] Region switching works
- [ ] Persona filtering works
- [ ] All navigation links work
- [ ] All routes work correctly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Data loads from JSON files
- [ ] No console errors
- [ ] Can build for production
- [ ] README documentation complete

---

## Time Estimate

**Total: 10 days (80 hours)**

| Phase | Duration | Description |
|-------|----------|-------------|
| Setup | 0.5 days | Project initialization, dependencies |
| Layout | 1 day | Header, Footer, Breadcrumb |
| Common Components | 1 day | Card, Button, Dropdown, Hero |
| Context & Hooks | 0.5 days | State management setup |
| Homepage | 1.5 days | Full homepage implementation |
| Product Landing | 1 day | Product landing page |
| Topic Page | 1 day | Topic page with articles |
| Contact Page | 1 day | Contact page with form |
| Testing | 1.5 days | Manual testing, bug fixes |
| Documentation | 1 day | README, guides, cleanup |

---

## Support & Maintenance

### Post-MVP Support
- Bug fixes as discovered
- Performance monitoring
- Content updates (JSON files)
- Minor UI improvements
- User feedback collection

### Maintenance Tasks
- Regular dependency updates
- Security patches
- Browser compatibility testing
- Performance audits
- Code quality reviews

---

## Appendix

### A. Icon Placeholder System
Since this is a wireframe MVP, use simple text/emoji placeholders for icons:
- Download: ⬇️
- Lock: 🔒
- Document: 📄
- Bank: 🏦
- Remote: 🖥️
- Calendar: 📅
- Community: 💬
- Phone: 📞
- Question: ❓

Or use Tailwind's built-in utilities to create simple geometric shapes.

### B. Color Palette (Wireframe)
- Black: #000000
- White: #FFFFFF
- Gray 50: #F9FAFB
- Gray 100: #F3F4F6
- Gray 200: #E5E7EB
- Gray 300: #D1D5DB
- Gray 600: #4B5563
- Gray 800: #1F2937

### C. Typography Scale
- Heading 1: text-5xl (48px)
- Heading 2: text-4xl (36px)
- Heading 3: text-2xl (24px)
- Heading 4: text-xl (20px)
- Body: text-base (16px)
- Small: text-sm (14px)
- Tiny: text-xs (12px)

---

**Document End**