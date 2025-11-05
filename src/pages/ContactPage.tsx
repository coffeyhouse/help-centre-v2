/**
 * ContactPage - Contact and support options page
 *
 * Features:
 * - Hero section
 * - Contact form with dropdowns (Persona, Product)
 * - Quick access topics grid
 * - Contact methods (Community, Phone)
 */

import { useState } from 'react';
import { useRegion } from '../hooks/useRegion';
import { useData } from '../hooks/useData';
import { loadProducts, loadContact } from '../utils/dataLoader';
import Hero from '../components/common/Hero';
import ContactForm from '../components/pages/ContactPage/ContactForm';
import ContactTopicsGrid from '../components/pages/ContactPage/ContactTopicsGrid';
import ContactMethods from '../components/pages/ContactPage/ContactMethods';
import type { ProductsData, ContactData } from '../types';

export default function ContactPage() {
  const { region, regionConfig, loading: regionLoading, error: regionError } = useRegion();

  // State for selected product
  const [selectedProduct, setSelectedProduct] = useState('product-a');

  // Load products data
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useData<ProductsData>(() => loadProducts(region), [region]);

  // Load contact data
  const {
    data: contactData,
    loading: contactLoading,
    error: contactError,
  } = useData<ContactData>(() => loadContact(region), [region]);

  const loading = regionLoading || productsLoading || contactLoading;
  const error = regionError || productsError || contactError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const personas = regionConfig?.personas || [];
  const products = productsData?.products || [];
  const contactTopics = contactData?.contactTopics || [];
  const contactMethods = contactData?.contactMethods || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Hero
        title="Get in touch"
        subtitle="If you want to get in touch with us, select an option below."
      />

      {/* Main Content */}
      <div className="container-custom py-12">
        {/* Contact Form */}
        <ContactForm
          personas={personas}
          products={products}
          selectedProduct={selectedProduct}
          onProductChange={setSelectedProduct}
        />

        {/* Contact Topics Grid */}
        <ContactTopicsGrid
          topics={contactTopics}
          productId={selectedProduct}
        />

        {/* Contact Methods */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Alternative contact methods</h2>
          <ContactMethods methods={contactMethods} />
        </div>
      </div>
    </div>
  );
}
