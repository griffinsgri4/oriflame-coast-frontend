'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';

const defaultCategories = ['Skincare', 'Makeup', 'Fragrance', 'Body Care', 'Hair Care'];
const iconMap: Record<string, string> = {
  skincare: '🧴',
  makeup: '💄',
  fragrance: '🌸',
  'body-care': '🧴',
  'hair-care': '💇‍♀️',
};

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

export default function CategoriesPage() {
  const [categories, setCategories] = useState<(Category & { count?: number; icon?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'alphabetical'>('popular');
  const [period, setPeriod] = useState<'30d' | '90d' | 'all'>('90d');
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try fetching categories from backend first
        let serverCategories: Category[] | null = null;
        try {
          const catRes = await api.categories.getAll({ per_page: 100, period });
          const payload: any = catRes?.data;
          const list: any[] = Array.isArray(payload) ? payload : payload?.data || [];
          if (Array.isArray(list) && list.length) {
            serverCategories = list.map((c: any) => ({
              id: c.id,
              name: c.name ?? c.title ?? 'Unnamed',
              slug: c.slug ?? toSlug(c.name ?? c.title ?? 'Unnamed'),
              order: c.order ?? c.position,
              thumbnail_url: c.thumbnail_url ?? c.image ?? c.thumbnail,
              product_count: c.product_count ?? c.products_count,
              sales_count: c.sales_count ?? c.total_sales,
              meta: c.meta ?? {},
            }));
          }
        } catch (e) {
          // No categories endpoint or it failed – continue to derive from products
        }

        if (serverCategories && serverCategories.length) {
          setCategories(serverCategories);
        } else {
          // Derive categories from products as fallback
          const response = await api.products.getAll({ per_page: 100, page: 1 });
          if (response?.data?.data?.length) {
            const counts: Record<string, number> = {};
            for (const p of response.data.data) {
              const name = p.category || 'Uncategorized';
              counts[name] = (counts[name] ?? 0) + 1;
            }

            const derived = Object.keys(counts)
              .map((name) => {
                const slug = toSlug(name);
                return {
                  name,
                  slug,
                  count: counts[name],
                  icon: iconMap[slug] || '📦',
                };
              })
              .sort((a, b) => a.name.localeCompare(b.name));

            setCategories(derived);
          } else {
            // Fallback to default categories
            setCategories(
              defaultCategories.map((n) => ({
                name: n,
                slug: toSlug(n),
                count: 0,
                icon: iconMap[toSlug(n)] || '📦',
              }))
            );
          }
        }
      } catch (e) {
        console.error('Failed to load categories', e);
        setError('Unable to load categories');
        setCategories(
          defaultCategories.map((n) => ({
            name: n,
            slug: toSlug(n),
            count: 0,
            icon: iconMap[toSlug(n)] || '📦',
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [period]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#4CAF50] transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/shop" className="text-gray-500 hover:text-[#4CAF50] transition-colors">
              Shop
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Categories</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Shop by Category</h1>
          <p className="text-lg opacity-90">Browse products by category for faster discovery</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              {categories.length} categories
            </span>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 text-sm">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-full ${sortBy === 'popular' ? 'bg-white text-[#4CAF50]' : 'text-white/90'}`}
                aria-pressed={sortBy === 'popular'}
              >
                Popular
              </button>
              <button
                onClick={() => setSortBy('alphabetical')}
                className={`px-3 py-1 rounded-full ${sortBy === 'alphabetical' ? 'bg-white text-[#4CAF50]' : 'text-white/90'}`}
                aria-pressed={sortBy === 'alphabetical'}
              >
                A–Z
              </button>
            </div>
            <select
              className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
            >
              <option className="text-black" value="30d">30d</option>
              <option className="text-black" value="90d">90d</option>
              <option className="text-black" value="all">All</option>
            </select>
            {loading && (
              <span className="ml-2 inline-flex items-center text-white/90 text-xs">
                <span className="mr-1 h-2 w-2 rounded-full bg-white/90 animate-pulse" />
                Loading
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories
              .slice()
              .sort((a, b) => {
                const aScore = (a.sales_count ?? 0) || (a.product_count ?? 0) || (a.count ?? 0);
                const bScore = (b.sales_count ?? 0) || (b.product_count ?? 0) || (b.count ?? 0);
                return sortBy === 'popular'
                  ? bScore - aScore
                  : (a.name ?? '').localeCompare(b.name ?? '');
              })
              .map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/category/${cat.slug}`}
                className="group p-3 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg hover:border-[#4CAF50]/30 hover:shadow-md transition-all duration-200"
                title={`Browse ${cat.name}`}
                prefetch
                onMouseEnter={() => router.prefetch(`/shop/category/${cat.slug}`)}
              >
                <div className="text-center">
                  {cat.thumbnail_url ? (
                    <div className="mx-auto mb-2 h-14 w-14 rounded-full overflow-hidden shadow-sm ring-1 ring-gray-200">
                      <Image
                        src={cat.thumbnail_url}
                        alt={cat.name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">{cat.icon ?? '📦'}</div>
                  )}
                  <div className="text-sm font-medium text-gray-700 group-hover:text-[#4CAF50] transition-colors">{cat.name}</div>
                  {((cat.sales_count ?? 0) || (cat.product_count ?? 0) || (cat.count ?? 0)) ? (
                    <div className="text-xs text-gray-500 mt-1">
                      {cat.sales_count ? `${cat.sales_count} sold` : (cat.product_count ?? cat.count) + ' items'}
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 text-center text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}