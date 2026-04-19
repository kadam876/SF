import { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders, DEFAULT_CATALOGUE_IMAGE_URL } from '../../config';
import { cachedFetch } from '../../utils/apiCache';
import { CLOTH_CATEGORIES } from '../../data/clothCategories';
import { useCart } from '../../contexts/CartContext';
import {
  Camera, ShoppingCart, Star, ArrowRight, ShieldCheck,
  Truck, Zap, ChevronRight, Heart, Eye, Package,
  BadgeCheck, Users, TrendingUp,
} from 'lucide-react';
import ProductCardSkeleton from '../../components/ProductCardSkeleton';

const VirtualTryOn = lazy(() => import('../../components/VirtualTryOn'));

const BEST_SELLER_COUNT = 8;

// ── Marquee ticker ────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  '✦ Premium Wholesale Fashion',
  '✦ Factory Direct Pricing',
  '✦ 500+ Retail Partners',
  '✦ Pan-India Shipping',
  '✦ New Arrivals Every Week',
  '✦ Flexible MOQ',
  '✦ 14 Years of Trust',
  '✦ Surat Global Textile Market',
];

const Ticker = () => (
  <div className="bg-gray-950 text-gray-300 py-2.5 overflow-hidden">
    <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span key={i} className="text-xs font-bold uppercase tracking-[0.15em] mx-8 flex-shrink-0">{item}</span>
      ))}
    </div>
  </div>
);

// ── Star rating ───────────────────────────────────────────────────────────────
const Stars = ({ rating = 0 }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={11} className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
    ))}
  </div>
);

// ── Product card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onCart, onTryOn, onView }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [liked, setLiked]         = useState(false);
  const img   = product.imageUrl || product.image || DEFAULT_CATALOGUE_IMAGE_URL;
  const price = Math.round(Number(product.price) || 0);
  const orig  = product.originalPrice ? Math.round(Number(product.originalPrice)) : null;
  const disc  = orig && orig > price ? Math.round(((orig - price) / orig) * 100) : null;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]" onClick={() => onView(product)}>
        {!imgLoaded && <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />}
        <img src={img} alt={product.name}
          onLoad={() => setImgLoaded(true)}
          onError={e => { e.target.src = DEFAULT_CATALOGUE_IMAGE_URL; setImgLoaded(true); }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {disc && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">-{disc}%</div>
        )}
        {/* Hover actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-200">
          <button onClick={e => { e.stopPropagation(); setLiked(l => !l); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${liked ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 hover:text-rose-500'}`}>
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={e => { e.stopPropagation(); onTryOn(product); }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-emerald-600 transition-colors">
            <Camera size={13} />
          </button>
        </div>
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={e => { e.stopPropagation(); onCart(product); }}
            className="w-full bg-white text-gray-900 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center gap-2">
            <ShoppingCart size={13} /> Add to Cart
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        {product.category && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">{product.category}</span>}
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 hover:text-emerald-600 transition-colors cursor-pointer" onClick={() => onView(product)}>
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <Stars rating={Number(product.ratings) || 0} />
          <span className="text-[10px] text-gray-400 font-medium">({Number(product.ratings || 0).toFixed(1)})</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
            {orig && orig > price && <span className="text-xs text-gray-400 line-through">₹{orig.toLocaleString('en-IN')}</span>}
          </div>
          <button onClick={e => { e.stopPropagation(); onCart(product); }}
            className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm">
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Landing page ──────────────────────────────────────────────────────────────
const Landing = () => {
  const [bestsellers, setBestsellers]           = useState([]);
  const [bestsellersLoading, setBestsellersLoading] = useState(true);
  const [tryOnProduct, setTryOnProduct]         = useState(null);
  const navigate = useNavigate();
  const { openCart, addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setBestsellersLoading(true);
      try {
        const json = await cachedFetch(`${API_ENDPOINTS.PRODUCTS}?page=0&size=20`, { headers: getAuthHeaders() });
        if (cancelled) return;
        const list = Array.isArray(json) ? json : (json.content || []);
        const sorted = [...list].sort((a, b) => (Number(b.ratings) || 0) - (Number(a.ratings) || 0));
        setBestsellers(sorted.slice(0, BEST_SELLER_COUNT));
      } catch { /* silent */ }
      finally { if (!cancelled) setBestsellersLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleCart = (product) => {
    const size = product.sizes?.length > 0 ? product.sizes[0] : 'M';
    addToCart({ ...product, imageUrl: product.imageUrl || product.image }, size, 1);
    openCart();
  };

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center bg-[#080a0e] overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Premium Wholesale Fashion · Surat
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-8">
                Fashion That
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
                  Sells Itself
                </span>
              </h1>

              <p className="text-lg text-gray-400 font-medium leading-relaxed mb-10 max-w-lg">
                Factory-direct wholesale apparel from Surat's largest textile hub. Premium quality, unbeatable margins, delivered pan-India.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-14">
                <button onClick={() => navigate('/shop')}
                  className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-base hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5">
                  Shop Collection
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => navigate('/about')}
                  className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white/8 text-white rounded-2xl font-bold text-base hover:bg-white/15 transition-all border border-white/15">
                  Our Story
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6">
                {[
                  { icon: ShieldCheck, text: 'Quality Verified' },
                  { icon: Truck,       text: 'Pan-India Shipping' },
                  { icon: Zap,         text: 'Fast Dispatch' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-gray-400">
                    <Icon size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — image collage */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg ml-auto">
                {/* Main image */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                  <img
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800"
                    alt="Fashion Collection"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Floating stat cards */}
                <div className="absolute -left-10 top-1/4 bg-white rounded-2xl shadow-2xl p-4 min-w-[140px]">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Partners</p>
                  <p className="text-3xl font-black text-gray-900">500+</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />)}
                  </div>
                </div>

                <div className="absolute -right-8 bottom-1/4 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl p-4 min-w-[150px]">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-3xl font-black text-white">14 Yrs</p>
                  <p className="text-xs text-emerald-400 font-bold mt-1">Est. 2010</p>
                </div>

                <div className="absolute -bottom-6 left-1/4 bg-emerald-600 rounded-2xl shadow-2xl shadow-emerald-500/30 p-4">
                  <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">Satisfaction</p>
                  <p className="text-3xl font-black text-white">98%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <Ticker />

      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+',   label: 'Retail Partners',   icon: Users },
              { value: '10K+',   label: 'Orders Delivered',  icon: Package },
              { value: '14 Yrs', label: 'In Business',       icon: BadgeCheck },
              { value: '98%',    label: 'Satisfaction Rate', icon: TrendingUp },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                  <Icon size={22} className="text-emerald-600" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
                <p className="text-sm font-semibold text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════════ */}
      <section id="categories" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Collections</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">Shop by Category</h2>
            </div>
            <button onClick={() => navigate('/shop')}
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors group">
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CLOTH_CATEGORIES.slice(0, 10).map((cat, i) => (
              <button key={cat.name} type="button"
                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <img src={cat.imageUrl || DEFAULT_CATALOGUE_IMAGE_URL} alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={e => { e.target.src = DEFAULT_CATALOGUE_IMAGE_URL; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                  <h3 className="text-white font-extrabold text-base leading-tight mb-1">{cat.name}</h3>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Shop Now <ArrowRight size={11} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Trending Now</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">Bestsellers</h2>
              <p className="text-gray-500 font-medium mt-2 max-w-md">Top-rated products loved by our retail partners across India.</p>
            </div>
            <button onClick={() => navigate('/shop')}
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors group">
              Full Catalogue <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {bestsellersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : bestsellers.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
              <Package size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium mb-6">No products available yet.</p>
              <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {bestsellers.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCart={handleCart}
                  onTryOn={setTryOnProduct}
                  onView={p => navigate(`/product/${p.id}`)}
                />
              ))}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <button onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
              View All Products <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY US — FEATURE STRIP
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Why Sandhya Fashion</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Built for Retailers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Quality Guaranteed',    desc: 'Every product passes strict quality checks before it reaches you. No surprises, no returns.',       color: 'bg-emerald-500' },
              { icon: Truck,       title: 'Pan-India Delivery',    desc: 'Fast, reliable shipping to every corner of India. Track your order in real time.',                  color: 'bg-blue-500' },
              { icon: Zap,         title: 'Same-Day Dispatch',     desc: 'Orders placed before 2 PM are dispatched the same day from our Surat warehouse.',                   color: 'bg-amber-500' },
              { icon: BadgeCheck,  title: 'Factory Direct',        desc: 'No middlemen. We source directly from manufacturers so you get the best margins possible.',          color: 'bg-purple-500' },
              { icon: Users,       title: 'Dedicated Support',     desc: 'A real team available Mon–Sat to help with orders, queries, and bulk customisations.',               color: 'bg-rose-500' },
              { icon: TrendingUp,  title: 'New Arrivals Weekly',   desc: 'Fresh styles added every week to keep your store ahead of trends and your customers coming back.',   color: 'bg-teal-500' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gray-950 rounded-3xl overflow-hidden px-8 py-16 md:py-20 text-center">
            {/* Orbs */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-600/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-teal-600/10 rounded-full blur-[80px]" />
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative">
              <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Start Today</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Ready to Scale Your<br />Fashion Business?
              </h2>
              <p className="text-gray-400 text-lg font-medium mb-10 max-w-xl mx-auto">
                Join 500+ retailers who trust Sandhya Fashion for premium wholesale apparel at factory-direct prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/shop')}
                  className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-base hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/25 hover:-translate-y-0.5">
                  Browse Catalogue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => navigate('/contact')}
                  className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white/8 text-white rounded-2xl font-bold text-base hover:bg-white/15 transition-all border border-white/15">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual try-on */}
      {tryOnProduct && (
        <Suspense fallback={null}>
          <VirtualTryOn product={tryOnProduct} onClose={() => setTryOnProduct(null)} />
        </Suspense>
      )}

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
