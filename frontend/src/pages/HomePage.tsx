import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Zap, Download, Star, TrendingUp, Sparkles } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import { productService, categoryService, type Product } from '@/services/productService';

const MOCK_CATEGORIES = [
  { id: 1, name: 'UI Kits', icon: '🎨', slug: 'ui-kits' },
  { id: 2, name: 'Mockups', icon: '📱', slug: 'mockups' },
  { id: 3, name: 'Social Media', icon: '📸', slug: 'social-media' },
  { id: 4, name: 'Flyers', icon: '📄', slug: 'flyers' },
  { id: 5, name: 'Logos', icon: '✏️', slug: 'logos' },
  { id: 6, name: 'Illustrations', icon: '🖼️', slug: 'illustrations' },
  { id: 7, name: 'Business Cards', icon: '💼', slug: 'business-cards' },
  { id: 8, name: 'Backgrounds', icon: '🌈', slug: 'backgrounds' },
];

const stats = [
  { label: 'Products', value: '500+', icon: <Sparkles className="w-5 h-5" /> },
  { label: 'Downloads', value: '50K+', icon: <Download className="w-5 h-5" /> },
  { label: 'Designers', value: '12K+', icon: <Star className="w-5 h-5" /> },
  { label: 'Rating', value: '4.9★', icon: <TrendingUp className="w-5 h-5" /> },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, l, t, c] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getLatestProducts(),
          productService.getTrendingProducts(),
          categoryService.getAll(),
        ]);
        setFeatured(f);
        setLatest(l);
        setTrending(t);
        if (c.length) setCategories(c);
      } catch {
        // Use mock data if API fails
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="bg-dark-bg">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero-glow">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />

        <div className="page-container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" />
              Premium Digital Assets for Designers
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white leading-[1.05] mb-6 text-balance">
              Download{' '}
              <span className="glow-text">Premium PSD</span>{' '}
              Files Instantly
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
              Explore thousands of professionally crafted PSD files, UI kits, mockups, 
              and design assets. One-time payment. Instant secure download.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-xl mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search UI kits, mockups, PSD files..."
                className="w-full pl-14 pr-32 py-4 rounded-xl bg-dark-card/80 border border-dark-border
                           text-white placeholder-slate-500 text-base
                           focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                           backdrop-blur-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-5 text-sm"
              >
                Search
              </button>
            </form>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2">
              <span className="text-slate-500 text-sm">Trending:</span>
              {['UI Kits', 'Mockups', 'Flyers', 'Backgrounds'].map(q => (
                <button
                  key={q}
                  onClick={() => navigate(`/products?search=${q}`)}
                  className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl"
          >
            {stats.map(s => (
              <div key={s.label} className="bg-dark-card/60 backdrop-blur-sm border border-dark-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-brand-400 mb-1">
                  {s.icon}
                  <span className="text-xl font-bold text-white">{s.value}</span>
                </div>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CATEGORIES ═══════════════ */}
      <section className="section-spacing border-t border-dark-border">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle mx-auto text-center">Find exactly what you need from our curated collections</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/products?categoryId=${cat.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl
                             bg-dark-card border border-dark-border
                             hover:border-brand-500/30 hover:bg-dark-hover
                             hover:shadow-glow-sm transition-all duration-300 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs text-slate-400 group-hover:text-white text-center font-medium transition-colors leading-tight">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED PRODUCTS ═══════════════ */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-2 text-brand-400 text-sm font-medium mb-2">
                <Star className="w-4 h-4" /> Featured
              </div>
              <h2 className="section-title">Hand-picked Designs</h2>
            </motion.div>
            <Link to="/products?featured=true" className="btn-ghost text-sm hidden md:flex">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} columns={4} />
        </div>
      </section>

      {/* ═══════════════ TRENDING ═══════════════ */}
      <section className="section-spacing bg-gradient-to-b from-dark-card/30 to-transparent border-y border-dark-border">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-2 text-accent-pink text-sm font-medium mb-2">
                <TrendingUp className="w-4 h-4" /> Trending Now
              </div>
              <h2 className="section-title">Most Downloaded</h2>
            </motion.div>
            <Link to="/products?sortBy=popular" className="btn-ghost text-sm hidden md:flex">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={trending} loading={loading} columns={4} />
        </div>
      </section>

      {/* ═══════════════ LATEST PRODUCTS ═══════════════ */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-2 text-accent-green text-sm font-medium mb-2">
                <Zap className="w-4 h-4" /> New Arrivals
              </div>
              <h2 className="section-title">Latest Additions</h2>
            </motion.div>
            <Link to="/products?sortBy=newest" className="btn-ghost text-sm hidden md:flex">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={latest} loading={loading} columns={4} />
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section className="section-spacing">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-brand-500/20 bg-gradient-to-br from-brand-500/10 via-dark-card to-accent-purple/10 p-12 text-center"
          >
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Ready to Download?
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of designers using SharpShadow assets to create 
                stunning projects faster than ever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products" className="btn-primary text-base px-8 py-3">
                  Browse Products <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3">
                  Sign Up Free
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
