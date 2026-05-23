import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import { productService, categoryService, type Product } from '@/services/productService';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '0');
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const sortBy = searchParams.get('sortBy') || 'newest';

  useEffect(() => {
    categoryService.getAll().then(c => setCategories(c)).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({ page, size: 12, categoryId, search, sortBy });
        setProducts(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, categoryId, sortBy]);

  const updateParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    if (key !== 'page') p.set('page', '0');
    setSearchParams(p);
  };

  const [localSearch, setLocalSearch] = useState(search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', localSearch || null);
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="page-container">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {search ? `Results for "${search}"` : selectedCategory ? selectedCategory.name : 'All Products'}
          </h1>
          <p className="text-slate-400 text-sm">
            {loading ? 'Loading...' : `${totalElements} products found`}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ─── FILTERS SIDEBAR ─── */}
          <aside className="lg:w-60 shrink-0">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterOpen(s => !s)}
              className="lg:hidden w-full flex items-center gap-2 btn-secondary mb-4"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <div className={`space-y-6 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
              {/* Search */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Search</h3>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={localSearch}
                    onChange={e => setLocalSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl bg-dark-card border border-dark-border
                               text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                  />
                </form>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Sort By</h3>
                <div className="space-y-1">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateParam('sortBy', opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all
                        ${sortBy === opt.value
                          ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-dark-hover'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => updateParam('categoryId', null)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all
                      ${!categoryId ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-dark-hover'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam('categoryId', String(cat.id))}
                      className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl text-sm transition-all
                        ${categoryId === cat.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-dark-hover'}`}
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ─── PRODUCT GRID ─── */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} loading={loading} columns={3} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => updateParam('page', String(page - 1))}
                  disabled={page === 0}
                  className="btn-secondary py-2 px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pageNum = totalPages <= 7 ? i : i + Math.max(0, page - 3);
                  if (pageNum >= totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateParam('page', String(pageNum))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all
                        ${page === pageNum ? 'bg-brand-500 text-white' : 'btn-secondary'}`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => updateParam('page', String(page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-secondary py-2 px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
