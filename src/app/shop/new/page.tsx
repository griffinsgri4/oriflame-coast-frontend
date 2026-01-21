'use client';

// Remove disallowed metadata export and use Head instead
import Head from 'next/head';

import Link from 'next/link';
import Image from 'next/image';
import { useApi } from '@/hooks/useApi';
import { Product, ApiResponse, PaginatedResponse } from '@/lib/types';
import AddToCartButton from '@/components/cart/AddToCartButton';

export default function NewArrivalsPage() {
  const { data: resp, loading, error } = useApi<ApiResponse<PaginatedResponse<Product>>>('/products', {
    per_page: 12,
    sort: 'created_desc',
  });

  const products = resp?.data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Head>
        <title>New Arrivals | Oriflame Coast Region</title>
        <meta name="description" content="Discover the latest arrivals from Oriflame — fresh products added regularly." />
      </Head>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white py-10 sm:py-14 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">New Arrivals</h1>
          <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto">
            Freshly added products straight from Oriflame — discover what's new.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl p-3 sm:p-4">
                <div className="aspect-square bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
                <div className="h-4 bg-gray-200 rounded mt-2 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && !products.length && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load new arrivals</h2>
            <p className="text-gray-600 mb-4">Please try again later.</p>
            <Link href="/shop" className="inline-block px-5 py-2.5 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors">
              Browse Shop
            </Link>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No new products yet</h2>
            <p className="text-gray-600 mb-4">Check back soon for fresh additions.</p>
            <Link href="/shop" className="inline-block px-5 py-2.5 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors">
              Browse Shop
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <div key={p.id} className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                <Link href={`/shop/${p.id}`} className="block">
                  <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-50">
                    <Image
                      src={p.image || '/placeholder.png'}
                      alt={p.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">{p.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      {p.sale_price != null ? (
                        <>
                          <span className="text-sm text-gray-500 line-through">KSh {Number(p.original_price ?? p.price).toFixed(2)}</span>
                          <span className="text-base sm:text-lg font-semibold text-[#4CAF50]">KSh {Number(p.sale_price).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-base sm:text-lg font-semibold text-[#4CAF50]">KSh {Number(p.price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="p-3 sm:p-4 pt-0">
                  <AddToCartButton product={p} quantity={1} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}