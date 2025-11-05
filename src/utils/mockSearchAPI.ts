/**
 * Mock Search API
 *
 * This mock API simulates search functionality until a real API is implemented.
 * It filters mock data based on search query, region, and product.
 */

import type { SearchResult } from '../types';

// Mock search data - this will eventually come from an API
const mockSearchData: SearchResult[] = [
  {
    id: 'search-1',
    title: 'Getting Started with Cloud Accounting',
    summary: 'Learn how to set up your cloud accounting software and configure your first company.',
    productId: 'cloud-accounting',
    topicId: 'getting-started',
    url: '/products/cloud-accounting/topics/getting-started'
  },
  {
    id: 'search-2',
    title: 'How to Create an Invoice',
    summary: 'Step-by-step guide to creating and sending invoices to your customers.',
    productId: 'cloud-accounting',
    topicId: 'invoicing',
    url: '/products/cloud-accounting/topics/invoicing'
  },
  {
    id: 'search-3',
    title: 'Managing Your VAT Returns',
    summary: 'Complete guide to submitting VAT returns and Managing Tax Digital compliance.',
    productId: 'cloud-accounting',
    topicId: 'vat-tax',
    url: '/products/cloud-accounting/topics/vat-tax'
  },
  {
    id: 'search-4',
    title: 'Bank Reconciliation Guide',
    summary: 'Learn how to reconcile your bank accounts and match transactions automatically.',
    productId: 'cloud-accounting',
    topicId: 'banking',
    url: '/products/cloud-accounting/topics/banking'
  },
  {
    id: 'search-5',
    title: 'Installing Desktop Software',
    summary: 'System requirements and installation instructions for desktop accounting software.',
    productId: 'desktop-accounting',
    topicId: 'installation',
    url: '/products/desktop-accounting/topics/installation'
  },
  {
    id: 'search-6',
    title: 'Troubleshooting Connection Issues',
    summary: 'Fix common connection problems and network errors in your accounting software.',
    productId: 'cloud-accounting',
    topicId: 'troubleshooting',
    url: '/products/cloud-accounting/topics/troubleshooting'
  },
  {
    id: 'search-7',
    title: 'Understanding Financial Reports',
    summary: 'Guide to profit & loss, balance sheets, and other essential financial reports.',
    productId: 'cloud-accounting',
    topicId: 'reports',
    url: '/products/cloud-accounting/topics/reports'
  },
  {
    id: 'search-8',
    title: 'Adding Users and Permissions',
    summary: 'How to invite team members and configure their access rights and permissions.',
    productId: 'cloud-accounting',
    topicId: 'user-management',
    url: '/products/cloud-accounting/topics/user-management'
  },
  {
    id: 'search-9',
    title: 'Payroll Setup and Configuration',
    summary: 'Set up payroll processing, configure employee details, and run your first payroll.',
    productId: 'cloud-payroll',
    topicId: 'setup',
    url: '/products/cloud-payroll/topics/setup'
  },
  {
    id: 'search-10',
    title: 'Backing Up Your Data',
    summary: 'Best practices for backing up your accounting data and restoring from backups.',
    productId: 'desktop-accounting',
    topicId: 'data-management',
    url: '/products/desktop-accounting/topics/data-management'
  },
  {
    id: 'search-11',
    title: 'Error: "Cannot Connect to Server"',
    summary: 'Resolve the "Cannot Connect to Server" error message when launching the application.',
    productId: 'cloud-accounting',
    topicId: 'troubleshooting',
    url: '/products/cloud-accounting/topics/troubleshooting'
  },
  {
    id: 'search-12',
    title: 'How to Export Data',
    summary: 'Export your transactions, reports, and customer data to CSV, Excel, or PDF formats.',
    productId: 'cloud-accounting',
    topicId: 'data-management',
    url: '/products/cloud-accounting/topics/data-management'
  },
];

/**
 * Mock search function
 *
 * @param query - Search query string
 * @param _region - Region code (e.g., 'gb', 'ie') - currently unused in mock
 * @param productId - Optional product ID to filter results
 * @param limit - Maximum number of results to return
 * @returns Promise resolving to array of search results
 */
export async function searchArticles(
  query: string,
  _region: string,
  productId?: string,
  limit?: number
): Promise<SearchResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();

  // Filter results based on query
  let results = mockSearchData.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(searchTerm);
    const summaryMatch = item.summary.toLowerCase().includes(searchTerm);
    return titleMatch || summaryMatch;
  });

  // Filter by product if specified
  if (productId) {
    results = results.filter(item => item.productId === productId);
  }

  // Apply limit if specified
  if (limit) {
    results = results.slice(0, limit);
  }

  return results;
}
