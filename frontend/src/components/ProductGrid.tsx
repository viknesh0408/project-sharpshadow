import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/services/productService';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading, columns = 3 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-24">
        <div className="w-20 h-20 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎨</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No products found</h3>
        <p className="text-slate-400 text-sm">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
}
