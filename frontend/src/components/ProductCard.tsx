import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Star, ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '@/services/productService';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/products/${product.id}`} className="block product-card group">
        {/* Image */}
        <div className="product-card-image">
          <img
            src={product.previewImageUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://picsum.photos/seed/${product.id}/800/600`;
            }}
          />

          {/* Hover overlay */}
          <div className="product-card-overlay group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                            bg-brand-500 text-white text-sm font-semibold
                            shadow-glow-sm hover:shadow-glow-md transition-all">
              <Eye className="w-4 h-4" />
              View Details
            </span>
          </div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <span className="badge badge-brand text-xs">
                <Star className="w-3 h-3 mr-1" /> Featured
              </span>
            )}
          </div>

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-lg bg-dark-bg/90 backdrop-blur-sm border border-dark-border text-white text-sm font-bold">
              {product.price === 0 ? 'FREE' : formatPrice(product.price)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-semibold text-sm leading-tight line-clamp-1 group-hover:text-brand-400 transition-colors">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="badge-category text-xs">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Download className="w-3 h-3" />
              {product.downloadCount.toLocaleString()}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs text-slate-500 bg-dark-bg px-2 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
