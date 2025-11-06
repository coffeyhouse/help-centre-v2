// Type definitions for Help Centre application

// ==================== Region Types ====================

export interface Region {
  code: string;
  name: string;
  language: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  region: string;
  default?: boolean;
}

export interface RegionConfig {
  region: string;
  displayName: string;
  personas: Persona[];
  navigation: Navigation;
}

export interface Navigation {
  main: NavigationItem[];
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  type?: 'dropdown';
}

// ==================== Persona Types ====================

export interface Persona {
  id: string;
  label: string;
  default?: boolean;
}

export type PersonaId = 'customer' | 'accountant' | 'partner' | 'developer';

// ==================== Product Types ====================

export type ProductType = 'cloud' | 'desktop';

export type ProductCategory =
  | 'accounting-software'
  | 'people-payroll'
  | 'business-management'
  | 'solutions-accountants-bookkeepers';

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  personas: PersonaId[];
  categories: ProductCategory[];
  icon: string;
  countries?: string[];
}

export interface ProductsData {
  products: Product[];
  hotTopics: HotTopic[];
  quickAccessCards: QuickAccessCard[];
}

// ==================== Release Notes Types ====================

export interface ReleaseNote {
  id: string;
  version: string;
  date: string; // ISO date format: YYYY-MM-DD
  title: string;
  description?: string;
  features?: string[];
  improvements?: string[];
  fixes?: string[];
  countries?: string[];
}

export interface ReleaseNotesData {
  releaseNotes: {
    [productId: string]: ReleaseNote[];
  };
}

// ==================== Hot Topics ====================

export interface HotTopic {
  id: string;
  title: string;
  icon: string;
  url?: string;
  countries?: string[];
}

// ==================== Quick Access Cards ====================

export interface QuickAccessCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  url?: string;
  countries?: string[];
}

// ==================== Topic/Support Hub Types ====================

export interface SupportHub {
  id: string;
  title: string;
  description: string;
  icon: string;
  productId: string;
  parentTopicId?: string; // For subtopics, references the parent topic ID
  showOnProductLanding?: boolean; // Controls visibility on product landing page
  countries?: string[];
}

export interface TopicsData {
  supportHubs: SupportHub[];
}

// ==================== Article Types ====================

export interface ArticleItem {
  id: string;
  type?: 'article' | 'subtopic'; // Default: 'article'
  title?: string; // For articles, or override for subtopics
  description?: string; // For articles, or override for subtopics
  icon?: string; // For subtopic overrides
  countries?: string[];
}

// Deprecated: keeping for backwards compatibility
export interface Article {
  id: string;
  title: string;
  description: string;
  countries?: string[];
}

export interface ArticlesData {
  articles: {
    [productId: string]: {
      [topicId: string]: ArticleItem[];
    };
  };
}

// ==================== Contact Types ====================

export interface ContactMethod {
  id: string;
  type: 'card' | 'action';
  title: string;
  description?: string;
  icon: string;
  buttonLabel: string;
  buttonStyle: 'primary' | 'outline';
  phoneNumber?: string;
  hours?: string;
  url?: string;
  openModal?: boolean; // If true, clicking opens a modal instead of navigating
  modalContent?: {
    title: string;
    sections: {
      heading?: string;
      content: string;
      type?: 'text' | 'list' | 'warning' | 'info';
    }[];
  };
  countries?: string[];
  productIds?: string[];
}

export interface ContactData {
  contactMethods: ContactMethod[];
}

// ==================== Incident Banner Types ====================

export type IncidentBannerState = 'info' | 'caution' | 'resolved' | 'error';

export interface IncidentBanner {
  id: string;
  state: IncidentBannerState;
  title: string;
  message: string;
  link?: {
    text: string;
    url: string;
  };
  scope: {
    type: 'global' | 'product' | 'topic' | 'page';
    productIds?: string[]; // For product-specific banners
    topicIds?: string[]; // For topic-specific banners (requires productId match too)
    pagePatterns?: string[]; // For page-specific banners (e.g., "/products/:productId", "/contact")
  };
  active: boolean;
  countries?: string[];
}

export interface IncidentBannersData {
  banners: IncidentBanner[];
}

// ==================== Popup Modal Types ====================

export type PopupTriggerType = 'immediate' | 'delay' | 'scroll';

export interface PopupButton {
  text: string;
  url?: string; // External or internal link
  action?: 'dismiss' | 'link'; // Action to perform
  primary?: boolean; // Primary button styling
}

export interface PopupModal {
  id: string;
  title: string;
  message: string;
  image?: string; // Optional image URL
  video?: string; // Optional video URL (YouTube embed, etc.)
  buttons?: PopupButton[]; // Call-to-action buttons
  scope: {
    type: 'global' | 'product' | 'topic' | 'page';
    productIds?: string[]; // For product-specific popups
    topicIds?: string[]; // For topic-specific popups (requires productId match too)
    pagePatterns?: string[]; // For page-specific popups (e.g., "/products/:productId", "/contact")
  };
  trigger: {
    type: PopupTriggerType;
    delay?: number; // Delay in milliseconds (for 'delay' type)
    scrollPercentage?: number; // Scroll percentage 0-100 (for 'scroll' type)
  };
  priority: number; // Higher number = higher priority
  active: boolean;
  countries?: string[];
}

export interface PopupsData {
  popups: PopupModal[];
}

// ==================== Breadcrumb Types ====================

export interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

// ==================== Common Component Props ====================

export interface CardProps {
  title: string;
  description?: string;
  type?: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  href?: string;
  className?: string;
}

export interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface HeroProps {
  title: string;
  subtitle: string;
  searchBar?: boolean;
  searchPlaceholder?: string;
  productId?: string;
}

// ==================== Context Types ====================

export interface RegionContextValue {
  region: string;
  regionConfig: RegionConfig | null;
  changeRegion: (newRegion: string) => void;
  loading: boolean;
  error: string | null;
}

export interface PersonaContextValue {
  persona: PersonaId;
  setPersona: (persona: PersonaId) => void;
}

export interface AuthContextValue {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
  loading: boolean;
}

// ==================== User Types ====================

export interface User {
  id: string;
  name: string;
  email: string;
  persona: PersonaId;
  ownedProducts: string[];
}

export interface UsersData {
  users: User[];
}

// ==================== Search Types ====================

export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  productId?: string;
  topicId?: string;
  url: string;
}

// ==================== Hook Return Types ====================

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
