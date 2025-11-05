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

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  personas: PersonaId[];
  icon: string;
  countries?: string[];
}

export interface ProductsData {
  products: Product[];
  hotTopics: HotTopic[];
  quickAccessCards: QuickAccessCard[];
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
  countries?: string[];
}

export interface TopicsData {
  supportHubs: SupportHub[];
}

// ==================== Article Types ====================

export interface Article {
  id: string;
  title: string;
  description: string;
  countries?: string[];
}

export interface ArticlesData {
  articles: {
    [productId: string]: {
      [topicId: string]: Article[];
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
  countries?: string[];
  productIds?: string[];
}

export interface ContactData {
  contactMethods: ContactMethod[];
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

// ==================== Hook Return Types ====================

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
