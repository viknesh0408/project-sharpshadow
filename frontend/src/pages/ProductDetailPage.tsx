import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ShoppingCart, Tag, Calendar, Eye, ArrowLeft, CheckCircle } from 'lucide-react';
import { productService, type Product } from '@/services/productService';
import { initiateRazorpayPayment, downloadService } from '@/services/orderService';
import { orderService } from '@/services/orderService';
import ProductGrid from '@/components/ProductGrid';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await productService.getProductById(Number(id));
        setProduct(p);
        const rel = await productService.getRelatedProducts(p.id, p.categoryId);
        setRelated(rel);

        // Check if purchased
        if (isAuthenticated) {
          const history = await orderService.getOrderHistory();
          const purchased = history.some((o: any) =>
            o.status === 'PAID' && o.items?.some((item: any) => item.productId === p.id)
          );
          setHasPurchased(purchased);
        }
      } catch {
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated]);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toastInfo('Please sign in to purchase');
      navigate('/login');
      return;
    }
    if (!product || !user) return;
    setPaying(true);
    initiateRazorpayPayment(
      product.id,
      { name: user.name, email: user.email },
      () => {
        setPaying(false);
        setHasPurchased(true);
        toastSuccess('Payment successful! You can now download the file.');
      },
      (msg) => {
        setPaying(false);
        if (msg !== 'Payment cancelled') toastError(msg);
      }
    );
  };

  const handleDownload = async () => {
    if (!product) return;
    setDownloading(true);
    try {
      const { downloadUrl } = await downloadService.getDownloadUrl(product.id);
      window.open(downloadUrl, '_blank');
      toastSuccess('Download started! Link expires in 15 minutes.');
    } catch {
      toastError('Failed to get download link. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg py-8">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="skeleton aspect-[4/3] rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-24 rounded" />
              <div className="skeleton h-14 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="page-container py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          <span>/</span>
          <span className="text-white line-clamp-1">{product.title}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* ─── LEFT: Preview Image ─── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div
              className="relative rounded-2xl overflow-hidden border border-dark-border cursor-zoom-in group"
              onClick={() => setImageZoomed(true)}
            >
              <img
                src={product.previewImageUrl}
                alt={product.title}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://picsum.photos/seed/${product.id}/1200/900`;
                }}
              />
              <div className="absolute inset-0 bg-dark-bg/0 group-hover:bg-dark-bg/10 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-dark-card/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-dark-border text-sm text-white flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Click to zoom
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── RIGHT: Details ─── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">

            {/* Category + Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Link to={`/products?categoryId=${product.categoryId}`} className="badge-category">
                {product.categoryName}
              </Link>
              {product.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="badge bg-dark-hover text-slate-400 border border-dark-border">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-display font-bold text-white mb-4 leading-tight">
              {product.title}
            </h1>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-6 pb-6 border-b border-dark-border">
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4" /> {product.downloadCount.toLocaleString()} downloads
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Description */}
            <p className="text-slate-300 leading-relaxed text-base mb-8 flex-1">
              {product.description}
            </p>

            {/* Price + CTA */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Price</p>
                  <p className="text-4xl font-display font-bold text-white">
                    {product.price === 0 ? 'FREE' : formatPrice(product.price)}
                  </p>
                </div>
                {hasPurchased && (
                  <span className="badge badge-green">
                    <CheckCircle className="w-3 h-3 mr-1" /> Purchased
                  </span>
                )}
              </div>

              {hasPurchased ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full btn-primary justify-center py-4 text-base"
                >
                  <Download className="w-5 h-5" />
                  {downloading ? 'Preparing download...' : 'Download File'}
                </button>
              ) : (
                <button
                  onClick={handleBuyNow}
                  disabled={paying}
                  className="w-full btn-primary justify-center py-4 text-base disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {paying ? 'Processing...' : product.price === 0 ? 'Get for Free' : `Buy Now · ${formatPrice(product.price)}`}
                </button>
              )}

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 justify-center">
                <span>✓ One-time payment</span>
                <span>✓ Instant download</span>
                <span>✓ Lifetime access</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Related Products ─── */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-8">Related Products</h2>
            <ProductGrid products={related} columns={4} />
          </section>
        )}

        {/* Image Zoom Modal */}
        {imageZoomed && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setImageZoomed(false)}
          >
            <img
              src={product.previewImageUrl}
              alt={product.title}
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
