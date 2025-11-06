import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRegion } from '../hooks/useRegion';
import { useData } from '../hooks/useData';
import { usePageTitle } from '../hooks/usePageTitle';
import { loadReleaseNotes, loadProducts } from '../utils/dataLoader';
import type { ReleaseNotesData, ProductsData, ReleaseNote } from '../types';
import Hero from '../components/common/Hero';
import Breadcrumb from '../components/layout/Breadcrumb';

const ReleaseNotesPage: React.FC = () => {
  const { region } = useRegion();
  const { productId } = useParams<{ productId: string }>();

  // Load release notes filtered by productId
  const { data: releaseNotesData, loading: notesLoading, error: notesError } = useData<ReleaseNotesData>(
    () => loadReleaseNotes(region, productId),
    [region, productId]
  );

  // Load products to get product name
  const { data: productsData } = useData<ProductsData>(
    () => loadProducts(region),
    [region]
  );

  // Get the current product
  const currentProduct = useMemo(() => {
    return productsData?.products.find(p => p.id === productId);
  }, [productsData, productId]);

  // Set page title
  usePageTitle('Release Notes', currentProduct?.name);

  // Get release notes for the current product
  const filteredReleaseNotes = useMemo(() => {
    if (!releaseNotesData?.releaseNotes || !productId) return [];
    return releaseNotesData.releaseNotes[productId] || [];
  }, [releaseNotesData, productId]);

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group releases by year
  const releasesByYear = useMemo(() => {
    const grouped: { [year: string]: ReleaseNote[] } = {};

    filteredReleaseNotes.forEach(note => {
      const year = new Date(note.date).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(note);
    });

    return grouped;
  }, [filteredReleaseNotes]);

  const years = Object.keys(releasesByYear).sort((a, b) => parseInt(b) - parseInt(a));

  const breadcrumbItems = useMemo(() => [
    { label: 'Home', path: `/${region}` },
    { label: currentProduct?.name || 'Product', path: `/${region}/products/${productId}` },
    { label: 'Release Notes', current: true },
  ], [region, currentProduct, productId]);

  if (notesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading release notes...</p>
        </div>
      </div>
    );
  }

  if (notesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading release notes: {notesError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Hero
        title={`${currentProduct?.name || 'Product'} Release Notes`}
        subtitle="Stay up to date with the latest features, improvements, and fixes"
      />

      <div className="container-custom py-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Timeline */}
        {filteredReleaseNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No release notes available for this product.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {years.map(year => (
              <div key={year}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">{year}</h2>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-0 md:left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-8">
                    {releasesByYear[year].map((release) => (
                      <div key={release.id} className="relative pl-8 md:pl-20">
                        {/* Timeline dot */}
                        <div className="absolute left-0 md:left-8 top-2 -ml-1.5 h-3 w-3 rounded-full bg-black border-2 border-white shadow"></div>

                        {/* Release card */}
                        <div className="card card-hover p-6 bg-white">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-black text-white">
                                  {release.version}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {release.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {formatDate(release.date)}
                              </p>
                            </div>
                          </div>

                          {release.description && (
                            <p className="text-gray-700 mb-4">{release.description}</p>
                          )}

                          <div className="space-y-4">
                            {release.features && release.features.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  New Features
                                </h4>
                                <ul className="space-y-1 ml-7">
                                  {release.features.map((feature, idx) => (
                                    <li key={idx} className="text-gray-700 text-sm">
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {release.improvements && release.improvements.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                  Improvements
                                </h4>
                                <ul className="space-y-1 ml-7">
                                  {release.improvements.map((improvement, idx) => (
                                    <li key={idx} className="text-gray-700 text-sm">
                                      {improvement}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {release.fixes && release.fixes.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  Bug Fixes
                                </h4>
                                <ul className="space-y-1 ml-7">
                                  {release.fixes.map((fix, idx) => (
                                    <li key={idx} className="text-gray-700 text-sm">
                                      {fix}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReleaseNotesPage;
