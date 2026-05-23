import api from './api';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  previewImageUrl: string;
  categoryId: number;
  categoryName: string;
  tags: string[];
  featured: boolean;
  downloadCount: number;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductFilters {
  page?: number;
  size?: number;
  categoryId?: number | null;
  search?: string;
  sortBy?: string;
}

export const productService = {
  getProducts: (filters: ProductFilters = {}): Promise<PagedResponse<Product>> =>
    api.get('/products', { params: filters }).then(r => r.data),

  getProductById: (id: number): Promise<Product> =>
    api.get(`/products/${id}`).then(r => r.data),

  getFeaturedProducts: (): Promise<Product[]> =>
    api.get('/products/featured').then(r => r.data),

  getLatestProducts: (): Promise<Product[]> =>
    api.get('/products/latest').then(r => r.data),

  getTrendingProducts: (): Promise<Product[]> =>
    api.get('/products/trending').then(r => r.data),

  getRelatedProducts: (id: number, categoryId?: number): Promise<Product[]> =>
    api.get(`/products/${id}/related`, { params: { categoryId } }).then(r => r.data),
};

export const categoryService = {
  getAll: () => api.get('/categories').then(r => r.data),
};

export default productService;
