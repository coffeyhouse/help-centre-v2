# Product Requirements Document: Help Centre Rebuild

## Document Information

**Product:** Help Centre  
**Version:** 2.0  
**Date:** November 5, 2025  
**Status:** Draft  
**Owner:** Product Team

---

## Executive Summary

This document outlines the requirements for rebuilding the Help Centre, a customer-facing knowledge base and support portal. The system will be powered by JSON files to enable easy content management and rapid deployment without requiring backend infrastructure changes. The new system will support multiple regions with region-specific content and routing.

---

## Product Overview

### Purpose

The Help Centre provides customers, accountants, bookkeepers, business partners, and developers with self-service access to product documentation, support resources, and contact options across the product portfolio.

### Goals

- Enable users to quickly find relevant help content for their specific product and region
- Support multi-region deployment with localized content
- Reduce support ticket volume through improved self-service
- Provide clear pathways to different types of help (installation, troubleshooting, training, contact)
- Maintain product-specific context throughout the user journey
- Support multiple user personas with tailored content

---

## Region Support

### Overview

The Help Centre will support multiple regions with region-specific content, product availability, and contact options. Each region will have its own URL path structure and content configuration.

### Supported Regions

| Region Code | Region Name | URL Path | Language(s) |
|-------------|-------------|----------|-------------|
| `gb` | United Kingdom | `/gb/` | English (UK) |
| `ie` | Ireland | `/ie/` | English (IE) |
| `us` | United States | `/us/` | English (US) |
| `ca` | Canada | `/ca/` | English (CA), French (CA) |
| `fr` | France | `/fr/` | French |
| `es` | Spain | `/es/` | Spanish |
| `pt` | Portugal | `/pt/` | Portuguese |
| `de` | Germany | `/de/` | German |
| `za` | South Africa | `/za/` | English (ZA) |

### URL Structure

**Format:** `[site]/[region-code]/[page-path]`

**Examples:**
- `https://help.example.com/gb/products/product-a`
- `https://help.example.com/us/topics/installation`
- `https://help.example.com/fr/contact`

### Region Detection & Selection

#### Default Behavior
1. Detect user's region via IP geolocation or browser locale
2. Redirect to appropriate region path (e.g., `/gb/`)
3. Store region preference in browser storage
4. If region cannot be determined, default to `/gb/`

#### Region Selector Component
- **Location:** Header navigation (top right)
- **Display:** Flag icon or region code with dropdown
- **Behavior:** 
  - Shows current region
  - Dropdown lists all available regions
  - Selecting new region redirects to equivalent page in that region
  - If page doesn't exist in new region, redirect to region homepage
- **Persistence:** Save selection to browser storage

### Region-Specific Content

#### Configuration Structure
```json
{
  "region": "gb",
  "displayName": "United Kingdom",
  "language": "en-GB",
  "currency": "GBP",
  "dateFormat": "DD/MM/YYYY",
  "phoneFormat": "+44 XXXX XXXXXX",
  "products": ["product-a", "product-b", "product-c"],
  "featuredTopics": ["topic-1", "topic-2"],
  "contactMethods": ["phone", "chat", "email"],
  "supportHours": {
    "timezone": "Europe/London",
    "hours": "Monday-Friday, 9:00-17:00 GMT"
  }
}
```

#### Content Variations by Region
- Product availability
- Support contact information
- Operating hours and timezones
- Featured topics and hot topics
- Legal/compliance information
- Pricing and currency
- Date/time formats
- Phone number formats

### Fallback Strategy

If content is not available in the selected region:
1. Check for content in default language (English)
2. Display content with region disclaimer
3. Provide link to switch to region where content is available
4. Log missing content for content team review

---

## Technical Architecture

### Data Structure

**Primary Data Format:** JSON  
**Content Management:** File-based system

#### Core JSON Structures

1. **Region Configuration** (`regions.json`)
2. **Products Configuration** (`products.json`)
3. **Topics Configuration** (`topics.json`)
4. **Navigation Configuration** (`navigation.json`)
5. **User Personas** (`personas.json`)

#### Region-Specific Data Organization
```
/data
  /regions
    - regions.json (all regions metadata)
    /gb
      - config.json
      - products.json
      - topics.json
      - featured-content.json
    /us
      - config.json
      - products.json
      - topics.json
      - featured-content.json
    /fr
      - config.json
      - products.json
      - topics.json
      - featured-content.json
    ...
```

---

## Page Requirements

## 1. Homepage

### Purpose
Serve as the main entry point, allowing users to self-identify their persona and select their product.

### Layout Components

#### Hero Section
- **Background:** Black
- **Content:**
  - Main heading: "Welcome to the [Brand] Help Centre"
  - Subheading explaining purpose
  - Illustration: Branded books/resources graphic (right side)

#### Persona Selection Tabs
- **Options:**
  - I'm a Customer (default selected)
  - I'm an Accountant or Bookkeeper
  - I'm a Business Partner
  - I'm a Developer
- **Behavior:** Tab selection filters product grid below
- **Visual:** Green underline for active tab

#### Product Selection Grid
- **Display:** 2x4 grid of product cards (8 visible initially)
- **Each Card Contains:**
  - Product icon
  - Product name
  - Arrow/chevron for navigation
- **Action:** Button "See more products"
- **Behavior:** Products shown are filtered by:
  1. Selected persona
  2. Current region (products available in that region)
- **Example Products (region-dependent):**
  - Product A
  - Product B
  - Product C
  - Product D
  - Product E
  - Product F
  - Product G
  - Product H

#### Hot Topics Section
- **Heading:** "Hot topics"
- **Subheading:** "Stay one step ahead with the latest news and trending topics"
- **Featured Topics:**
  - Configurable list of trending topics (region-specific)
  - Example: 2-factor authentication, new feature launches, regulatory updates
  - Visual prominence for high-priority items

#### Quick Access Cards
Three promotional cards in a row (region-configurable):

1. **Account management and services**
   - Icon: Document/checklist
   - Description: Register software, access invoices, download updates
   - Action: Clickable card

2. **Visit Community Hub**
   - Icon: Chat bubbles
   - Description: Ask questions, share tips, get advice
   - Action: Clickable card

3. **Free training in [Brand] University**
   - Icon: Graduation cap
   - Description: 100% free courses across all products
   - Action: Clickable card

**Note:** Cards are configurable per region and may vary based on available services.

#### Footer
- **Brand logo** (primary brand color)
- **Social Media Links:** Instagram, Facebook, LinkedIn, X (Twitter), YouTube
- **Column 1 - Popular Products:**
  - Product A
  - Product B
  - Product C
  - Product D
  - Product E
  - See all products
  - *(Region-specific product list)*
- **Column 2 - Product Roadmaps:**
  - Product A
  - Product B
  - Product C
  - Product D
  - *(Region-specific roadmap links)*
- **Column 3 - Useful Links:**
  - Community Hub
  - Store
  - Training/University
  - Advice Blog
  - Main Website
  - Contact us
- **Legal Footer:**
  - © [Company] [Year]
  - Legal
  - General Data Protection Regulation (GDPR)
  - Privacy and Cookies
  - Accessibility
  - Phishing email advice

**Note:** Footer content is region-specific and configurable via JSON.

### JSON Data Requirements

```json
{
  "region": "gb",
  "personas": [
    {
      "id": "customer",
      "label": "I'm a Customer",
      "default": true
    },
    {
      "id": "accountant",
      "label": "I'm an Accountant or Bookkeeper"
    },
    {
      "id": "partner",
      "label": "I'm a Business Partner"
    },
    {
      "id": "developer",
      "label": "I'm a Developer"
    }
  ],
  "products": [
    {
      "id": "product-a",
      "name": "Product A",
      "icon": "icon-product-a",
      "personas": ["customer", "accountant"],
      "regions": ["gb", "ie", "us"],
      "url": "/gb/products/product-a"
    },
    {
      "id": "product-b",
      "name": "Product B",
      "icon": "icon-product-b",
      "personas": ["customer"],
      "regions": ["gb", "us", "fr", "de"],
      "url": "/gb/products/product-b"
    }
    // ... additional products
  ],
  "hotTopics": [
    {
      "id": "2fa",
      "title": "2-factor authentication (2FA)",
      "icon": "icon-lock",
      "regions": ["gb", "ie", "us", "ca", "fr", "es", "pt", "de", "za"],
      "url": "/gb/topics/2fa"
    },
    {
      "id": "new-feature",
      "title": "What's new in 2025",
      "icon": "icon-star",
      "regions": ["gb", "ie"],
      "url": "/gb/topics/whats-new-2025"
    }
  ],
  "quickAccessCards": [
    {
      "title": "Account management and services",
      "description": "Register your software, access your invoices, and download software updates to stay up to date.",
      "icon": "icon-checklist",
      "url": "/gb/account-management",
      "regions": ["gb", "ie", "us", "ca"]
    },
    {
      "title": "Visit Community Hub",
      "description": "Community Hub is the place to ask questions, share tips and ideas, get practical advice and all the breaking news.",
      "icon": "icon-community",
      "url": "/gb/community",
      "regions": ["gb", "ie", "us", "ca", "fr", "es", "pt", "de", "za"]
    }
    // ... additional cards
  ]
}
```

### User Interactions

1. User lands on homepage (redirected to detected region, e.g., `/gb/`)
2. User can change region via region selector in header
3. User selects persona tab (optional - defaults to Customer)
4. Product grid filters based on:
   - Selected persona
   - Current region (only shows products available in that region)
5. User clicks product card → navigates to Product Landing Page (e.g., `/gb/products/product-a`)
6. User can access hot topics (region-specific), quick access cards, or footer links
7. All navigation maintains region context in URL path

---

## 2. Product Landing Page

### Purpose
Provide product-specific help navigation and search functionality.

### Layout Components

#### Breadcrumb Navigation
- Format: Product icon + Product Name
- Example: "Product A"
- Includes region context from URL path

#### Top Navigation Bar
- **Links:**
  - Hot topics (dropdown)
  - Webinars
  - Community Hub
  - Manage your account
  - Contact us

#### Hero Section
- **Background:** Black
- **Content:**
  - Main heading: "You need help. We have answers."
  - Search bar with placeholder: "Search for answers..."
  - Tip text: "Use detailed phrases or exact error messages to find the most relevant help guides"
  - Illustration: Branded books/resources graphic (right side)

#### Support Hubs Grid
- **Heading:** "What do you need help with today?"
- **Layout:** 2x3 grid of topic cards
- **Topics Include (examples - region/product configurable):**
  1. **Install your software**
     - Icon: Download arrow
     - Description: Everything you need to install your software
  2. **AI Assistant/Copilot** *(if applicable to product)*
     - Icon: Brand logo
     - Description: Get the most out of your new AI-powered productivity assistant
  3. **Manage your VAT/Tax** *(region-dependent)*
     - Icon: Document
     - Description: Record tax transactions and produce tax returns
  4. **Working with the bank**
     - Icon: Bank building
     - Description: Record and keep track of money paid and received
  5. **Run your accounts remotely**
     - Icon: Remote access
     - Description: Don't be tied to the office, work flexibly with Remote Data Access
  6. **Financial year end**
     - Icon: Calendar
     - Description: Complete your year end, then get ready for the new year

**Note:** Support hubs are configurable per product and region. Topics vary based on:
- Product capabilities
- Regional requirements (e.g., VAT vs Sales Tax)
- Available features

#### Call-to-Action Button
- **Label:** "View all support hubs"
- **Style:** Outlined button

#### Footer
(Same structure as homepage)

#### Floating Chat Assistant
- **Position:** Bottom right corner
- **Icon:** Brand-colored circle with logo
- **Label:** "[Brand] Assistant"
- **Text:** "Hi there! How can I help you today?"
- **Note:** May vary by region based on chat support availability

### JSON Data Requirements

```json
{
  "region": "gb",
  "product": {
    "id": "product-a",
    "name": "Product A",
    "icon": "icon-product-a",
    "regions": ["gb", "ie", "us"]
  },
  "topNavigation": [
    {
      "label": "Hot topics",
      "type": "dropdown",
      "url": "/gb/hot-topics"
    },
    {
      "label": "Webinars",
      "url": "/gb/webinars",
      "regions": ["gb", "ie", "us"]
    },
    {
      "label": "Community Hub",
      "url": "/gb/community"
    },
    {
      "label": "Manage your account",
      "url": "/gb/account"
    },
    {
      "label": "Contact us",
      "url": "/gb/contact"
    }
  ],
  "supportHubs": [
    {
      "id": "install-software",
      "title": "Install your software",
      "description": "Everything you need to install your software.",
      "icon": "icon-download",
      "url": "/gb/products/product-a/topics/install-software",
      "regions": ["gb", "ie", "us", "ca", "fr", "es", "pt", "de", "za"]
    },
    {
      "id": "manage-vat",
      "title": "Manage your VAT",
      "description": "Record VAT transactions and produce VAT Returns.",
      "icon": "icon-document",
      "url": "/gb/products/product-a/topics/manage-vat",
      "regions": ["gb", "ie"],
      "alternativeTitles": {
        "us": "Manage your Sales Tax",
        "ca": "Manage your GST/HST"
      }
    }
    // ... additional hubs
  ],
  "searchConfig": {
    "placeholder": "Search for answers...",
    "tipText": "Use detailed phrases or exact error messages to find the most relevant help guides"
  },
  "chatAssistant": {
    "enabled": true,
    "label": "Assistant",
    "greeting": "Hi there! How can I help you today?",
    "regions": ["gb", "ie", "us", "ca"]
  }
}
```

### User Interactions

1. User lands on product page from homepage (URL: `/[region]/products/[product-id]`)
2. User can change region via header selector (maintains product context if available)
3. User can search using search bar (searches within product and region)
4. User selects a support hub → navigates to Topic Page
5. User can access top navigation items (region-aware links)
6. User can interact with floating chat assistant (if available in region)
7. User can view all support hubs with button click

---

## 3. Topic Page

### Purpose
Display specific help articles and resources related to a chosen topic within a product.

### Layout Components

#### Breadcrumb Navigation
- Format: Product > Support hub > Current topic
- Example: "Product A > Support hubs > Install your software"
- All links maintain region context (e.g., `/gb/products/product-a`)

#### Hero Section
- **Background:** Black
- **Content:**
  - Main heading: Topic title (e.g., "Install your software")
  - Description: Brief overview of topic content
  - Search bar with placeholder: "Search for answers..."
  - Tip text below search

#### Tab Navigation
- **Tabs:**
  - Support guides (default selected)
  - Free training
  - Get in touch
- **Visual:** Green underline for active tab

#### Content Grid (Support Guides Tab)
- **Layout:** 2-column grid of article cards
- **Example Articles (content varies by product/region):**
  1. **What's new in [Product]?**
     - Description: Find out more about the latest improvements and features
     - Arrow/chevron for navigation
  
  2. **New to [Product]?**
     - Description: Installing for the first time? Don't worry it's a quick and easy process
     - Arrow/chevron for navigation
  
  3. **Install your software**
     - Description: Install [Product] on a new computer
     - Arrow/chevron for navigation
  
  4. **Upgrade your installed software**
     - Description: Upgrade to the latest version and get the most from your software
     - Arrow/chevron for navigation
  
  5. **Download older versions**
     - Description: [Current version] is the latest version. You can download older versions here
     - Arrow/chevron for navigation
  
  6. **Common queries and troubleshooting**
     - Description: Not going as expected? Check these common queries
     - Arrow/chevron for navigation
  
  7. **Additional configuration** *(example)*
     - Description: Follow these steps for advanced setup options
     - Arrow/chevron for navigation

**Note:** Article content is configurable per product, topic, and region.

#### Footer
(Same structure as homepage)

#### Floating Chat Assistant
(Same as Product Landing Page)

### JSON Data Requirements

```json
{
  "region": "gb",
  "topic": {
    "id": "install-software",
    "title": "Install your software",
    "description": "Here's everything you need to install [Product], whether you're installing for the first time, reinstalling, or upgrading to the latest version.",
    "productId": "product-a",
    "hubId": "install-software"
  },
  "tabs": [
    {
      "id": "support-guides",
      "label": "Support guides",
      "default": true
    },
    {
      "id": "free-training",
      "label": "Free training",
      "enabled": true,
      "regions": ["gb", "ie", "us", "ca"]
    },
    {
      "id": "get-in-touch",
      "label": "Get in touch"
    }
  ],
  "articles": [
    {
      "id": "whats-new",
      "title": "What's new in [Product]?",
      "description": "Find out more about the latest improvements and features.",
      "url": "/gb/products/product-a/articles/whats-new",
      "regions": ["gb", "ie", "us", "ca", "fr", "es", "pt", "de", "za"]
    },
    {
      "id": "first-time-install",
      "title": "New to [Product]?",
      "description": "Installing for the first time? Don't worry it's a quick and easy process.",
      "url": "/gb/products/product-a/articles/first-time-install",
      "regions": ["gb", "ie", "us", "ca", "fr", "es", "pt", "de", "za"]
    }
    // ... additional articles
  ],
  "breadcrumbs": [
    {
      "label": "Product A",
      "url": "/gb/products/product-a"
    },
    {
      "label": "Support hubs",
      "url": "/gb/products/product-a/hubs"
    },
    {
      "label": "Install your software",
      "url": null,
      "current": true
    }
  ]
}
```

### User Interactions

1. User lands on topic page from support hub selection (URL: `/[region]/products/[product]/topics/[topic]`)
2. User can change region via header selector (redirects to equivalent page if available)
3. User can search within topic using search bar (region-scoped results)
4. User can switch between tabs (Support guides, Free training, Get in touch)
   - Tab availability may vary by region
5. User clicks article card → navigates to detailed article view
6. User can navigate back using breadcrumbs (all links maintain region)
7. User can interact with chat assistant (if available in region)

---

## 4. Contact Page

### Purpose
Provide multiple contact options and route users to appropriate support channels based on their needs.

### Layout Components

#### Hero Section
- **Background:** Black
- **Content:**
  - Main heading: "Get in touch"
  - Description: "If you want to get in touch with us, select an option below."

#### Contact Form Section
- **Background:** Light gray
- **Dropdown Fields:**
  1. **I'm in**
     - Default: Based on detected region or user selection
     - Options: All supported regions
       - United Kingdom
       - Ireland
       - United States
       - Canada
       - France
       - Spain
       - Portugal
       - Germany
       - South Africa
  
  2. **I'm a**
     - Default: "Customer"
     - Options: Customer, Accountant/Bookkeeper, Business Partner, Developer
  
  3. **I need help with**
     - Default: Product A (or pre-selected based on context)
     - Options: All products available in selected region

- **Helper Text:**
  "To help us answer your query as quickly as possible, or to get in touch, select the topic you need help with:"

**Note:** Form behavior changes based on region selection:
- Product list updates to show region-specific products
- Contact methods update to show region-specific options
- Support hours and contact information reflect selected region

#### Quick Access Topics Grid
- **Layout:** 2x3 grid matching support hubs
- **Topics:**
  1. Install your software
  2. Manage your VAT
  3. Working with the bank
  4. Run your accounts remotely
  5. Financial year end
  6. Something else...

#### Call-to-Action Button
- **Label:** "View more topics"
- **Style:** Outlined button

#### Alternative Contact Methods Section
- **Background:** Light gray with brand accent color

1. **Community Forums Card**
   - Icon: Character with medal/badge
   - Heading: "Tap into the wisdom of our community forums"
   - Button: "Go to Community Hub"
   - **Availability:** All regions

2. **Chat with Support**
   - Icon: Chat bubble (brand color)
   - Heading: "Chat with [Brand]"
   - Description: "Instant guidance and expert support at anytime"
   - Button: "Chat now" (filled black)
   - **Availability:** Region-dependent (gb, ie, us, ca)
   - **Hours:** Region-specific support hours displayed

3. **Telephone**
   - Icon: Headphones
   - Heading: "Telephone"
   - Description: "Give us a call and talk to one of our experts on the phone"
   - Button: "Call now" (outlined)
   - **Phone Numbers:** Region-specific numbers displayed
   - **Hours:** Region-specific support hours displayed
   - **Availability:** All regions with different contact numbers

**Note:** Contact method availability and details vary by region:
- Chat support may not be available in all regions
- Phone numbers are region-specific
- Support hours reflect local timezone
- Some regions may have email-only support

#### Footer
(Same structure as homepage)

### JSON Data Requirements

```json
{
  "region": "gb",
  "contactForm": {
    "fields": [
      {
        "id": "region",
        "label": "I'm in",
        "type": "dropdown",
        "default": "gb",
        "options": [
          {"value": "gb", "label": "United Kingdom"},
          {"value": "ie", "label": "Ireland"},
          {"value": "us", "label": "United States"},
          {"value": "ca", "label": "Canada"},
          {"value": "fr", "label": "France"},
          {"value": "es", "label": "Spain"},
          {"value": "pt", "label": "Portugal"},
          {"value": "de", "label": "Germany"},
          {"value": "za", "label": "South Africa"}
        ]
      },
      {
        "id": "persona",
        "label": "I'm a",
        "type": "dropdown",
        "default": "customer",
        "options": [
          {"value": "customer", "label": "Customer"},
          {"value": "accountant", "label": "Accountant or Bookkeeper"},
          {"value": "partner", "label": "Business Partner"},
          {"value": "developer", "label": "Developer"}
        ]
      },
      {
        "id": "product",
        "label": "I need help with",
        "type": "dropdown",
        "default": "product-a",
        "dynamicOptions": true,
        "filterByRegion": true,
        "options": [
          {
            "value": "product-a",
            "label": "Product A",
            "regions": ["gb", "ie", "us", "ca"]
          },
          {
            "value": "product-b",
            "label": "Product B",
            "regions": ["gb", "us", "fr", "de"]
          }
        ]
      }
    ]
  },
  "quickAccessTopics": [
    {
      "id": "install-software",
      "title": "Install your software",
      "icon": "icon-download",
      "url": "/gb/topics/install-software"
    },
    {
      "id": "manage-tax",
      "title": "Manage your VAT",
      "icon": "icon-document",
      "url": "/gb/topics/manage-vat",
      "regionVariations": {
        "gb": "Manage your VAT",
        "ie": "Manage your VAT",
        "us": "Manage your Sales Tax",
        "ca": "Manage your GST/HST"
      }
    },
    {
      "id": "something-else",
      "title": "Something else...",
      "icon": "icon-question",
      "url": "/gb/contact/other-topics"
    }
  ],
  "alternativeContactMethods": [
    {
      "id": "community",
      "type": "card",
      "title": "Tap into the wisdom of our community forums",
      "icon": "icon-community",
      "buttonLabel": "Go to Community Hub",
      "url": "/gb/community",
      "regions": ["gb", "ie", "us", "ca", "fr", "es", "pt", "de", "za"]
    },
    {
      "id": "chat",
      "type": "action",
      "title": "Chat with Support",
      "description": "Instant guidance and expert support at anytime.",
      "icon": "icon-chat",
      "buttonLabel": "Chat now",
      "buttonStyle": "filled",
      "action": "openChat",
      "regions": ["gb", "ie", "us", "ca"],
      "supportHours": {
        "gb": {
          "timezone": "Europe/London",
          "hours": "Monday-Friday, 9:00-17:00 GMT",
          "display": "Available Monday-Friday, 9:00-17:00 GMT"
        },
        "us": {
          "timezone": "America/New_York",
          "hours": "Monday-Friday, 8:00-18:00 EST",
          "display": "Available Monday-Friday, 8:00-18:00 EST"
        }
      }
    },
    {
      "id": "phone",
      "type": "action",
      "title": "Telephone",
      "description": "Give us a call and talk to one of our experts on the phone.",
      "icon": "icon-phone",
      "buttonLabel": "Call now",
      "buttonStyle": "outlined",
      "action": "openPhoneDialog",
      "regions": ["gb", "ie", "us", "ca", "fr", "es", "pt", "de", "za"],
      "phoneNumbers": {
        "gb": {
          "display": "+44 (0) 191 294 3000",
          "number": "+441912943000",
          "hours": "Monday-Friday, 9:00-17:00 GMT"
        },
        "us": {
          "display": "+1 (866) 996-7243",
          "number": "+18669967243",
          "hours": "Monday-Friday, 8:00-18:00 EST"
        },
        "fr": {
          "display": "+33 (0) 825 825 603",
          "number": "+33825825603",
          "hours": "Lundi-Vendredi, 9:00-18:00 CET"
        }
      }
    },
    {
      "id": "email",
      "type": "action",
      "title": "Email Support",
      "description": "Send us an email and we'll respond within 24 hours.",
      "icon": "icon-email",
      "buttonLabel": "Email us",
      "buttonStyle": "outlined",
      "action": "openEmailForm",
      "regions": ["fr", "es", "pt", "de", "za"],
      "emails": {
        "fr": "support.fr@example.com",
        "es": "soporte.es@example.com",
        "pt": "suporte.pt@example.com",
        "de": "support.de@example.com",
        "za": "support.za@example.com"
      }
    }
  ]
}
```

### User Interactions

1. User lands on contact page (URL: `/[region]/contact`)
2. User can change region via:
   - Header region selector
   - "I'm in" dropdown in contact form
3. When region changes:
   - Product list updates to show region-available products
   - Contact methods update (chat/phone availability)
   - Support hours display in appropriate timezone
   - Quick access topics may update with region-specific variations
4. User selects persona and product from dropdowns
5. Quick access topics grid updates based on product selection
6. User can click topic → navigates to Topic Page (maintaining region context)
7. User can click "Go to Community Hub" → region-specific community link
8. User can click "Chat now" → opens chat widget (if available in region)
9. User can click "Call now" → displays region-specific phone numbers and hours
10. User can click "Email us" → opens email form (in regions without phone/chat)
11. User can view more topics with button click

---

## Global Components

### Navigation Header (All Pages)

**Structure:**
- **Left:** Brand logo (primary color)
- **Main Navigation:**
  - Help Centre (with home icon)
  - Products (dropdown)
  - Integrated Apps (dropdown)
  - Training/University
  - Useful links (dropdown)
- **Right:** Region selector
  - Current region display (flag icon or code)
  - Dropdown with all available regions
  - Switching region redirects to equivalent page or region homepage
- **Style:** Black background with white text

**Region Selector Behavior:**
- Shows current region (e.g., "🇬🇧 UK" or "GB")
- Clicking opens dropdown with all 9 regions
- Selecting new region:
  - Updates URL path (e.g., `/gb/` → `/us/`)
  - Maintains page context if content available in new region
  - Redirects to region homepage if page not available
  - Saves preference to browser storage
- Displays prominently for easy access

### Search Functionality

**Requirements:**
- Real-time search as user types
- Search across all help articles for selected product
- Fuzzy matching for typos
- Highlight matching terms in results
- Search suggestions/autocomplete
- Recent searches (optional)

### Chat Assistant

**Behavior:**
- Appears on all pages except homepage
- Fixed position: bottom right
- Expandable chat window
- Shows greeting message on hover/click
- Integration with Sage's AI assistant

---

## Content Management

### JSON File Structure

#### Directory Organization
```
/data
  /regions
    - regions.json (master list of all regions)
  /gb
    /config
      - region-config.json
      - navigation.json
      - footer.json
    /products
      - products.json
      - product-a.json
      - product-b.json
      ...
    /topics
      - install-software.json
      - manage-vat.json
      ...
    /articles
      - whats-new.json
      - install-guide.json
      ...
  /us
    /config
      - region-config.json
      - navigation.json
      - footer.json
    /products
      - products.json
      - product-a.json
      - product-c.json
      ...
    /topics
      - install-software.json
      - manage-sales-tax.json
      ...
  /fr
    /config
      - region-config.json
      - navigation.json
      - footer.json
    /products
      - products.json
      ...
  ... (additional regions)
  /shared
    - personas.json
    - icons.json
    - themes.json
```

#### Content Sharing Strategy
- **Shared Content:** Personas, icons, base templates stored in `/shared`
- **Region-Specific:** Products, topics, articles, contact info in region folders
- **Inheritance:** Regions can reference shared content or override with local versions
- **Localization:** Each region folder contains translated content where applicable

#### Update Process
1. Content editors modify JSON files for specific region(s)
2. Files are validated against JSON schema
3. Cross-region consistency checks (if updating shared content)
4. Changes are committed to version control
5. Automated build process regenerates static pages for affected region(s)
6. Region-specific deployment or full deployment
7. Changes deployed to production

#### Multi-Region Considerations
- **Global Changes:** Updates to shared content affect all regions
- **Regional Changes:** Updates to region-specific content affect only that region
- **Staged Rollout:** Ability to deploy changes to specific regions first
- **Content Synchronization:** Tools to identify content gaps across regions

---

## Design System

### Brand Colors
- **Primary Brand Color:** (e.g., #00DC82 or brand-specific)
- **Black:** #000000 (hero sections, footer)
- **White:** #FFFFFF (text on dark backgrounds)
- **Light Gray:** #F5F5F5 (card backgrounds)
- **Dark Gray:** #333333 (body text)

**Note:** Exact colors should align with brand guidelines.

### Typography
- **Headings:** Bold, sans-serif
- **Body:** Regular, sans-serif
- **Sizes:** Responsive scaling from mobile to desktop

### Components
- **Cards:** White background, subtle shadow, rounded corners
- **Buttons:** 
  - Primary: Filled black with white text
  - Secondary: Outlined with hover state
- **Icons:** Line-style icons with green accent color
- **Grid:** Responsive 12-column grid system

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for all images and icons
- Keyboard navigation support
- Focus indicators
- Sufficient color contrast (4.5:1 minimum)
- Screen reader compatibility
- Skip navigation links

### Additional Requirements
- Mobile-responsive design
- Touch-friendly tap targets (minimum 44x44px)
- Form labels and error messages
- ARIA landmarks and labels

---

## Performance Requirements

### Load Time
- Initial page load: < 3 seconds
- Time to interactive: < 5 seconds
- JSON file loading: < 500ms per file

### Optimization
- Lazy loading for images
- Minified JSON files
- CDN delivery for static assets
- Browser caching strategy
- Progressive enhancement approach

---

## SEO Requirements

### On-Page SEO
- Unique meta titles and descriptions per page and region
- Structured data markup (JSON-LD)
- Semantic HTML5 elements
- Clean URL structure with region paths
- XML sitemap generation (per region or combined)
- Robots.txt configuration
- Hreflang tags for regional variants

### Regional SEO Strategy
- **Hreflang Implementation:**
  ```html
  <link rel="alternate" hreflang="en-GB" href="https://help.example.com/gb/..." />
  <link rel="alternate" hreflang="en-IE" href="https://help.example.com/ie/..." />
  <link rel="alternate" hreflang="en-US" href="https://help.example.com/us/..." />
  <link rel="alternate" hreflang="fr-FR" href="https://help.example.com/fr/..." />
  <!-- etc. -->
  ```
- **Canonical URLs:** Each region page should have canonical URL pointing to itself
- **Region-specific Keywords:** Content optimized for regional search terms
- **Local Search Optimization:** Region-specific business information

### Content Structure
- Proper heading hierarchy (H1 → H6)
- Internal linking strategy (region-aware)
- Breadcrumb navigation with schema markup
- Canonical URLs per region

---

## Analytics & Tracking

### Required Tracking
- Page views (by region)
- Region selection and changes
- Search queries and results (by region)
- Product/topic selection paths
- Chat assistant interactions (by region)
- Contact form submissions (by region)
- Click-through rates on cards/topics
- User journey flow (cross-region if applicable)
- Exit pages
- Language/region preferences

### Event Tracking
- Navigation interactions
- Region selector usage
- Tab switches
- Button clicks
- Download/external links
- Error messages
- Content availability by region
- Fallback content displays

### Region-Specific Metrics
- Most popular products per region
- Search query variations by region
- Support method preferences by region
- Content gaps by region
- Cross-region user behavior

---

## Browser Support

### Desktop Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Mobile Browsers
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest 2 versions)
- Samsung Internet (latest version)

---

## Localization & Internationalization

### Supported Regions & Languages

| Region Code | Region | Primary Language | Additional Languages | Currency | Date Format |
|-------------|--------|------------------|---------------------|----------|-------------|
| `gb` | United Kingdom | English (en-GB) | - | GBP (£) | DD/MM/YYYY |
| `ie` | Ireland | English (en-IE) | - | EUR (€) | DD/MM/YYYY |
| `us` | United States | English (en-US) | - | USD ($) | MM/DD/YYYY |
| `ca` | Canada | English (en-CA) | French (fr-CA) | CAD ($) | YYYY-MM-DD |
| `fr` | France | French (fr-FR) | - | EUR (€) | DD/MM/YYYY |
| `es` | Spain | Spanish (es-ES) | - | EUR (€) | DD/MM/YYYY |
| `pt` | Portugal | Portuguese (pt-PT) | - | EUR (€) | DD/MM/YYYY |
| `de` | Germany | German (de-DE) | - | EUR (€) | DD.MM.YYYY |
| `za` | South Africa | English (en-ZA) | - | ZAR (R) | YYYY/MM/DD |

### Localization Features

#### Language Support
- Full UI translation for each region
- Content translation (articles, help text)
- Right-to-left (RTL) support if needed in future
- Multilingual support for Canada (EN/FR toggle)

#### Regional Formatting
- **Dates:** Region-specific formats
- **Times:** 12-hour vs 24-hour based on region
- **Numbers:** Decimal and thousand separators
- **Currency:** Display in local currency
- **Phone Numbers:** Local formatting patterns
- **Addresses:** Region-specific address formats

#### Content Localization
- Region-specific terminology:
  - VAT (GB, IE) vs Sales Tax (US) vs GST/HST (CA) vs TVA (FR) vs IVA (ES, PT) vs MwSt (DE)
  - Accounting terms variations
  - Legal/compliance terminology
- Cultural adaptations in imagery and examples
- Region-specific product names if applicable

### Implementation Strategy

#### URL Structure
- Region code in path: `/[region-code]/[page]`
- Language parameter if multiple languages: `/ca/fr/[page]`
- Automatic redirect based on browser locale/IP
- Manual region selection persists across sessions

#### Content Management
- Separate JSON files per region
- Fallback to English if translation unavailable
- Translation workflow and tools
- Content consistency across regions where applicable

### Future Considerations
- Additional regions (Australia, Brazil, Mexico, etc.)
- More language options per region
- Automatic translation services integration
- User preference for language override

---

## Security Requirements

### Data Protection
- GDPR compliance
- Privacy policy linked in footer
- Cookie consent management
- No sensitive data in JSON files
- Secure HTTPS connection

### Content Security
- XSS prevention
- Input sanitization for search
- Rate limiting on search queries
- CORS policy configuration

---

## Success Metrics

### Primary KPIs
- Reduction in support ticket volume
- Time to find information (search analytics)
- User satisfaction score (CSAT)
- Self-service resolution rate
- Search success rate

### Secondary Metrics
- Bounce rate per page
- Pages per session
- Average session duration
- Chat assistant engagement rate
- Community Hub click-through rate

---

## Future Enhancements

### Phase 2 Considerations
- Personalized content recommendations (region-aware)
- User feedback on article helpfulness (per region)
- Video tutorial integration (with subtitles/dubbing for regions)
- Interactive troubleshooting wizards
- Integration with product analytics
- AI-powered search improvements (multilingual)
- User account system for saved searches/bookmarks
- Cross-region content sharing and reuse tools
- Automated translation workflows
- Regional content performance dashboards
- Chatbot with regional language support
- Voice search for accessibility
- Mobile app for help centre
- Offline content access for key articles

### Additional Region Expansion
- Australia/New Zealand
- LATAM markets (Brazil, Mexico, Argentina)
- Asia-Pacific markets (Singapore, Hong Kong)
- Middle East markets
- Additional European markets (Netherlands, Belgium, Switzerland)

### Advanced Localization
- Machine translation with human review
- Context-aware terminology management
- Regional content variation testing
- Automated content gap detection
- Multi-language search capability
- Regional A/B testing framework

---

## Technical Constraints

### JSON File Limitations
- Maximum file size: 5MB per JSON file
- Maximum nesting depth: 5 levels
- UTF-8 encoding required
- Valid JSON schema enforcement

### Build Process
- Static site generation from JSON
- Build time: < 5 minutes
- Incremental builds support
- Rollback capability

---

## Dependencies

### External Services
- Sage Community Hub (external)
- Sage University (external)
- Chat assistant platform
- Analytics platform
- CDN provider
- Search indexing service (if applicable)

### Internal Systems
- Product catalog system
- Customer support ticketing system
- CRM integration (for contact forms)

---

## Launch Plan

### Phase 1: Core Regions (Weeks 1-6)
**Regions:** GB (United Kingdom), IE (Ireland)
- Homepage with product selection
- Product landing pages (priority products)
- Topic pages with article listings
- Contact page with region-specific contact info
- Basic search functionality
- Region selector implementation
- URL structure with region paths

**Deliverables:**
- `/gb/` and `/ie/` fully functional
- Region detection and redirect
- Core content in English
- Basic analytics tracking

### Phase 2: North America Expansion (Weeks 7-10)
**Regions:** US (United States), CA (Canada - English)
- Deploy all core functionality for US and CA
- US-specific terminology (Sales Tax vs VAT)
- North American contact information
- Extended product catalog for these regions
- Enhanced search with regional filtering

**Deliverables:**
- `/us/` and `/ca/` fully functional
- Regional content variations
- Canada bilingual preparation

### Phase 3: European Markets (Weeks 11-16)
**Regions:** FR (France), ES (Spain), PT (Portugal), DE (Germany)
- Full translations for each market
- Region-specific content and products
- Local contact information and support hours
- Cultural adaptations
- Legal and compliance content per region

**Deliverables:**
- `/fr/`, `/es/`, `/pt/`, `/de/` fully functional
- Complete translations
- Regional product catalogs

### Phase 4: Additional Markets & Optimization (Weeks 17-20)
**Regions:** ZA (South Africa)
- South Africa market deployment
- Cross-region analytics analysis
- Performance optimization across all regions
- Content gap analysis and filling
- A/B testing across regions
- User feedback collection
- Iterative improvements

**Deliverables:**
- `/za/` fully functional
- Optimization report
- Content strategy refinements
- Enhanced features based on feedback

### Post-Launch
- Ongoing content updates per region
- Regular performance monitoring
- Content localization improvements
- Additional region expansion planning
- Feature enhancements based on regional needs

---

## Acceptance Criteria

### Functional Requirements
- [ ] All four page types render correctly across all regions
- [ ] Region detection and automatic redirect works
- [ ] Region selector in header functions correctly
- [ ] Region switching maintains page context where possible
- [ ] Region paths in URLs work correctly (e.g., `/gb/`, `/us/`, etc.)
- [ ] Product filtering works based on persona and region
- [ ] Search returns relevant results scoped to region
- [ ] Navigation and breadcrumbs function properly with region context
- [ ] All links navigate to correct regional destinations
- [ ] Forms submit successfully with region data
- [ ] Chat assistant opens and functions (in supported regions)
- [ ] Region-specific contact information displays correctly
- [ ] Mobile responsive on all screen sizes across all regions

### Content Requirements
- [ ] All JSON files validate against schema
- [ ] Content displays without errors in all regions
- [ ] Region-specific products show only in applicable regions
- [ ] Images and icons load correctly
- [ ] Text is readable and properly formatted
- [ ] No broken links within or across regions
- [ ] Translations are accurate (for non-English regions)
- [ ] Regional terminology is correct (VAT vs Sales Tax, etc.)

### Region-Specific Requirements
- [ ] All 9 regions are accessible
- [ ] Region-specific configurations load correctly
- [ ] Contact methods reflect regional availability
- [ ] Support hours display in correct timezone
- [ ] Phone numbers format correctly per region
- [ ] Currency symbols display correctly
- [ ] Date formats match regional expectations
- [ ] Hreflang tags implemented correctly

### Performance Requirements
- [ ] Page load time meets targets across all regions
- [ ] JSON files load within 500ms
- [ ] No console errors
- [ ] Lighthouse score > 90 for all regional pages
- [ ] CDN serves content efficiently globally

### Accessibility Requirements
- [ ] WCAG 2.1 AA compliant in all regions
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes
- [ ] Language tags correct for all regions

### SEO Requirements
- [ ] Hreflang tags implemented correctly
- [ ] Regional sitemaps generated
- [ ] Canonical URLs set correctly
- [ ] Meta descriptions localized
- [ ] No duplicate content issues across regions

---

## Risk Assessment

### Technical Risks
- **Risk:** JSON file size grows too large with multiple regions
  - **Mitigation:** Implement pagination, split into smaller files per region, lazy loading
  
- **Risk:** Search performance degrades with content growth across regions
  - **Mitigation:** Implement search indexing service, region-scoped search

- **Risk:** CDN performance varies across global regions
  - **Mitigation:** Multi-region CDN setup, performance monitoring per region

- **Risk:** Region switching causes loss of user context
  - **Mitigation:** Implement intelligent redirection, maintain user state where possible

### Content Risks
- **Risk:** Outdated content shown to users in some regions
  - **Mitigation:** Content review workflow, update notifications, regional content audits
  
- **Risk:** Translation quality inconsistencies
  - **Mitigation:** Professional translation services, native speaker review, glossary management

- **Risk:** Content gaps vary significantly across regions
  - **Mitigation:** Content parity tracking, prioritized content creation strategy

### User Experience Risks
- **Risk:** Users can't find relevant help in their region
  - **Mitigation:** Analytics monitoring per region, user testing, search query analysis
  
- **Risk:** Region detection incorrectly routes users
  - **Mitigation:** Clear region selector, easy override, remember user preference

- **Risk:** Confusion with different regional terminology
  - **Mitigation:** Consistent glossaries, clear explanations, contextual help

### Operational Risks
- **Risk:** Managing content across 9 regions becomes unwieldy
  - **Mitigation:** Content management tools, clear workflows, automated validation
  
- **Risk:** Different support hours/methods cause user frustration
  - **Mitigation:** Clear communication of availability, alternative contact methods

- **Risk:** Compliance requirements vary by region
  - **Mitigation:** Legal review per region, region-specific compliance tracking

---

## Appendices

### A. JSON Schema Examples

See JSON data requirements sections within each page requirement.

### B. Wireframe References

Provided screenshots serve as visual reference for layout and components.

### C. Style Guide

Refer to Sage brand guidelines for complete design system documentation.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-05 | Product Team | Initial draft |

---

## Approval

**Product Owner:** _______________________  
**Engineering Lead:** _______________________  
**Design Lead:** _______________________  
**Date:** _______________________