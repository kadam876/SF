import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Star, Camera, ChevronLeft, ChevronRight,
  Search, X, SlidersHorizontal, Sparkles, Heart, Eye,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { API_ENDPOINTS, getAuthHeaders, DEFAULT_CATALOGUE_IMAGE_URL } from '../../config';
import { cachedFetch } from '../../utils/apiCache';
import VirtualTryOn from '../../components/VirtualTryOn';
import ProductCardSkeleton from '../../components/ProductCardSkeleton';

const PAGE_SIZE = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={11}
        className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
      />
    ))}
  </div>
);

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onAddToCart, onBuyNow, onTryOn, onView }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [liked, setLiked] = useState(false);
  const imgUrl = product.imageUrl || product.image || DEFAULT_CATALOGUE_IMAGE_URL;

  const discount = product.specialPrice && product.price && product.specialPrice < product.price
    ? Math.round(((product.price - product.specialPrice) / product.price) * 100)
    : product.wholesalePrice && product.wholesalePrice < product.price
      ? Math.round(((product.price - product.wholesalePrice) / product.price) * 100)
      : null;

  const displayPrice  = product.specialPrice || product.price || 0;
  const originalPrice = product.price || 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">

      {/* Image area */}
      <div className="relative overflow-hidden bg-gray-50" onClick={() => onView(product)}>
        {/* Skeleton shimmer until image loads */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
        )}
        <img
          src={imgUrl}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.target.src = DEFAULT_CATALOGUE_IMAGE_URL; setImgLoaded(true); }}
          className={`w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.badge && (
            <span className={`${product.badgeColor || 'bg-emerald-500'} text-white text-[10px] font-black px-2 py-0.5 rounded-full`}>
              {product.badge}
            </span>
          )}
        </div>

        {/* Hover action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${liked ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 hover:text-rose-500'}`}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onTryOn(product); }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <Camera size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onView(product); }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Quick add overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-full bg-white text-gray-900 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={13} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info area */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category tag */}
        {product.category && (
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
            {product.category}
          </span>
        )}

        {/* Name */}
        <h3
          className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 hover:text-emerald-600 transition-colors"
          onClick={() => onView(product)}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.ratings || 0} />
          <span className="text-[10px] text-gray-400 font-medium">({product.ratings || 0})</span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-gray-900">{fmt(displayPrice)}</span>
            {originalPrice > displayPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">{fmt(originalPrice)}</span>
            )}
          </div>
          {product.sizes?.length > 0 && (
            <span className="text-[10px] text-gray-400 font-medium">{product.sizes.length} sizes</span>
          )}
        </div>

        {/* Buy Now button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onBuyNow(product); }}
          className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all duration-200 active:scale-[0.98]"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

// ── Shop Page ─────────────────────────────────────────────────────────────────
const Shop = () => {
  const [searchParams] = useSearchParams();
  const catalogueId      = searchParams.get('catalogue');
  const catalogueLabelRaw = searchParams.get('label');
  const categoryFromUrl  = searchParams.get('category');
  const searchFromUrl    = searchParams.get('search') || '';

  const decodedShopCategory = useMemo(() => {
    if (!categoryFromUrl) return null;
    try { return decodeURIComponent(categoryFromUrl.replace(/\+/g, ' ')); }
    catch { return categoryFromUrl; }
  }, [categoryFromUrl]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy]       = useState('featured');
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [addedId, setAddedId]     = useState(null); // flash feedback

  const { addToCart, openCart } = useCart();
  const navigate = useNavigate();

  const catalogueTitle = catalogueLabelRaw
    ? decodeURIComponent(catalogueLabelRaw.replace(/\+/g, ' '))
    : 'This catalogue';
  const narrowShopView = Boolean(catalogueId || decodedShopCategory);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const data = await cachedFetch(`${API_ENDPOINTS.PRODUCTS}?page=${p}&size=${PAGE_SIZE}`, { headers: getAuthHeaders() });
      if (data?.content) {
        setProducts(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else {
        setProducts(Array.isArray(data) ? data : []);
        setTotalPages(1);
      }
      setError(null);
    } catch { setError('Failed to load products. Please try again.'); }
    finally { setLoading(false); }
  }, []);

  const fetchProductsByCategory = useCallback(async (category) => {
    setLoading(true);
    try {
      const data = await cachedFetch(API_ENDPOINTS.PRODUCTS_BY_CATEGORY(category), { headers: getAuthHeaders() });
      setProducts(Array.isArray(data) ? data : []);
      setTotalPages(1);
      setError(null);
    } catch { setError('Failed to load products. Please try again.'); }
    finally { setLoading(false); }
  }, []);

  const fetchProductsByCatalogue = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await cachedFetch(API_ENDPOINTS.PRODUCTS_BY_CATALOGUE(id), { headers: getAuthHeaders() });
      setProducts(Array.isArray(data) ? data : []);
      setTotalPages(1);
      setError(null);
    } catch { setError('Failed to load products for this catalogue.'); }
    finally { setLoading(false); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await cachedFetch(API_ENDPOINTS.PRODUCT_CATEGORIES, { headers: getAuthHeaders() });
      setCategories(['all', ...(data.categories || [])]);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { setPage(0); }, [catalogueId, decodedShopCategory, selectedCategory]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => {
    if (catalogueId) { fetchProductsByCatalogue(catalogueId); return; }
    if (decodedShopCategory) { fetchProductsByCategory(decodedShopCategory); return; }
    if (selectedCategory === 'all') { fetchProducts(page); }
    else { fetchProductsByCategory(selectedCategory); }
  }, [catalogueId, decodedShopCategory, selectedCategory, page,
      fetchProducts, fetchProductsByCategory, fetchProductsByCatalogue]);

  // ── Sorted + filtered products ────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    let list = [...products];
    if (sortBy === 'price-low')  list.sort((a, b) => (a.specialPrice || a.price) - (b.specialPrice || b.price));
    if (sortBy === 'price-high') list.sort((a, b) => (b.specialPrice || b.price) - (a.specialPrice || a.price));
    if (sortBy === 'rating')     list.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    return list;
  }, [products, sortBy, searchTerm]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddToCart = (product) => {
    const size = product.sizes?.length > 0 ? product.sizes[0] : 'M';
    addToCart(product, size, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
    openCart();
  };

  const handleBuyNow = (product) => {
    const size = product.sizes?.length > 0 ? product.sizes[0] : 'M';
    addToCart(product, size, 1);
    openCart(1);
  };

  const pageTitle = catalogueId ? catalogueTitle : decodedShopCategory ?? 'All Products';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky top bar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 md:top-[72px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Title + controls row */}
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-extrabold text-gray-900 truncate">{pageTitle}</h1>
              {!loading && totalElements > 0 && !narrowShopView && (
                <p className="text-xs text-gray-400 font-medium">{totalElements} products</p>
              )}
            </div>

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 py-2 w-48 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-8 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-700 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden pb-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          {!narrowShopView && (
            <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap text-xs transition-all flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? '✦ All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Catalogue / category filter banner ── */}
      {narrowShopView && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {catalogueId ? `Catalogue: ${catalogueTitle}` : `Category: ${decodedShopCategory}`}
            </div>
            <Link
              to="/shop"
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <X size={12} /> Clear
            </Link>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm font-medium flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => { setError(null); fetchProducts(page); }}
              className="text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Product grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {loading
            ? [...Array(PAGE_SIZE)].map((_, i) => <ProductCardSkeleton key={i} />)
            : sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onTryOn={setTryOnProduct}
                  onView={(p) => navigate(`/product/${p.id}`)}
                />
              ))
          }
        </div>

        {/* Empty state */}
        {!loading && sortedProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 mt-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">No products found</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Try adjusting your search or filters.
            </p>
            {(narrowShopView || searchTerm || selectedCategory !== 'all') && (
              <Link
                to="/shop"
                onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors inline-block"
              >
                Clear Filters
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {!narrowShopView && totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                  i === page ? 'bg-emerald-600 text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Virtual try-on modal */}
      {tryOnProduct && <VirtualTryOn product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </div>
  );
};

export default Shop;
