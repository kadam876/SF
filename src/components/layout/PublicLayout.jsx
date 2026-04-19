import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Menu, X, User, LogOut, ChevronDown,
  Package, Settings, Instagram, Facebook, Phone, Mail,
  MapPin, Search, Sparkles,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const NAV_LINKS = [
  { label: 'Home',    to: '/' },
  { label: 'Shop',    to: '/shop' },
  { label: 'About',   to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const PublicLayout = () => {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen]   = useState(false);

  const accountRef = useRef(null);
  const searchRef  = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems, openCart } = useCart();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setAccountOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate('/login');
  };

  const cartCount = getTotalItems();
  const initials  = (user?.name || user?.email || 'U')[0].toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Static announcement bar (not inside fixed header) ── */}
      {!scrolled && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-2 text-xs font-semibold tracking-wide z-40 relative">
          <span className="flex items-center justify-center gap-2">
            <Sparkles size={11} />
            Free shipping on orders above ₹5,000 · Wholesale prices direct from factory
            <Sparkles size={11} />
          </span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-2xl border-b border-gray-200/60 shadow-[0_1px_20px_rgba(0,0,0,0.06)]'
            : 'bg-white border-b border-gray-100'
        }`}
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── Logo ── */}
            <button onClick={() => navigate('/')} className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
                  <span className="text-white font-black text-xl leading-none tracking-tighter">S</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[17px] font-black text-gray-900 tracking-tight leading-none">Sandhya</span>
                <span className="text-[17px] font-black text-emerald-600 tracking-tight leading-none ml-1">Fashion</span>
              </div>
            </button>

            {/* ── Desktop nav ── */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center bg-gray-100/80 rounded-2xl p-1 gap-0.5">
                {NAV_LINKS.map(({ label, to }) => (
                  <NavLink
                    key={label}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-gray-900 shadow-sm shadow-gray-200'
                          : 'text-gray-500 hover:text-gray-800'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* ── Desktop actions ── */}
            <div className="hidden md:flex items-center gap-1.5">

              {/* Search */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setSearchOpen(o => !o)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                    searchOpen ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Search size={18} />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 p-3 animate-[fadeDown_0.15s_ease-out]">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search products, categories…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 text-sm font-medium bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                        />
                      </div>
                      <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap">
                        Search
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Account */}
              {isAuthenticated ? (
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen(o => !o)}
                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border transition-all ${
                      accountOpen
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                      {initials}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 max-w-[80px] truncate hidden lg:block">
                      {user?.name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${accountOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden animate-[fadeDown_0.15s_ease-out]">
                      {/* User info */}
                      <div className="px-4 py-4 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-base shadow-md">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      {/* Menu items */}
                      <div className="p-2">
                        {[
                          { icon: Settings, label: 'Profile Settings', path: '/profile' },
                          { icon: Package,  label: 'My Orders',        path: '/my-orders' },
                        ].map(({ icon: Icon, label, path }) => (
                          <button
                            key={label}
                            onClick={() => { navigate(path); setAccountOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                          >
                            <Icon size={16} className="text-gray-400" /> {label}
                          </button>
                        ))}
                        <div className="h-px bg-gray-100 my-1.5" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all duration-200 shadow-sm"
                >
                  <User size={15} /> Sign In
                </button>
              )}
            </div>

            {/* ── Mobile actions ── */}
            <div className="md:hidden flex items-center gap-1">
              <button onClick={openCart} className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:text-emerald-600 rounded-xl hover:bg-gray-100 transition-colors">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white border-t border-gray-100 px-4 pt-4 pb-6 space-y-1">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-400"
                />
              </div>
              <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold">
                <Search size={16} />
              </button>
            </form>

            {/* Nav links */}
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Account section */}
            <div className="pt-3 mt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  {[
                    { icon: Settings, label: 'Profile Settings', path: '/profile' },
                    { icon: Package,  label: 'My Orders',        path: '/my-orders' },
                  ].map(({ icon: Icon, label, path }) => (
                    <button key={label} onClick={() => { navigate(path); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      <Icon size={16} className="text-gray-400" /> {label}
                    </button>
                  ))}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                >
                  <User size={16} /> Sign In to Your Account
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════ */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="bg-[#0c0c0e] text-gray-400">
        {/* Top section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

            {/* Brand col */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-white font-black text-xl">S</span>
                </div>
                <div>
                  <span className="text-white font-black text-lg tracking-tight">Sandhya</span>
                  <span className="text-emerald-400 font-black text-lg tracking-tight ml-1">Fashion</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 max-w-xs mb-6">
                Premium wholesale fashion from Surat's Global Textile Market. Factory-direct pricing, curated collections, trusted by 500+ retailers across India.
              </p>
              {/* Social */}
              <div className="flex gap-2.5">
                {[
                  { Icon: Instagram, href: '#', label: 'Instagram' },
                  { Icon: Facebook,  href: '#', label: 'Facebook' },
                ].map(({ Icon, href, label }) => (
                  <a key={label} href={href}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200">
                    <Icon size={16} />
                  </a>
                ))}
                <a href="https://wa.me/917574927364" target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-200 text-[11px] font-black">
                  WA
                </a>
              </div>
            </div>

            {/* Spacer */}
            <div className="hidden lg:block lg:col-span-1" />

            {/* Links */}
            <div className="lg:col-span-3">
              <p className="text-white font-bold text-xs uppercase tracking-[0.12em] mb-5">Navigation</p>
              <ul className="space-y-3">
                {[['Shop Collection', '/shop'], ['About Us', '/about'], ['Contact', '/contact'], ['Terms of Service', '/terms'], ['Refund Policy', '/refund']].map(([label, to]) => (
                  <li key={label}>
                    <NavLink to={to} className="text-sm text-gray-500 hover:text-emerald-400 transition-colors font-medium">
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <p className="text-white font-bold text-xs uppercase tracking-[0.12em] mb-5">Contact Us</p>
              <ul className="space-y-4">
                {[
                  { Icon: Phone,  text: '+91 7574927364',                href: 'tel:+917574927364' },
                  { Icon: Mail,   text: 'Sandhyafashion39@gmail.com',    href: 'mailto:Sandhyafashion39@gmail.com' },
                  { Icon: MapPin, text: 'Shop B/5083, Global Textile Market, Surat 395010', href: null },
                ].map(({ Icon, text, href }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={13} className="text-emerald-400" />
                    </div>
                    {href ? (
                      <a href={href} className="text-sm text-gray-500 hover:text-emerald-400 transition-colors font-medium leading-snug break-all">{text}</a>
                    ) : (
                      <span className="text-sm text-gray-500 font-medium leading-snug">{text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600 font-medium">© 2026 Sandhya Fashion. All rights reserved.</p>
            <div className="flex gap-6">
              {[['Terms', '/terms'], ['Refund Policy', '/refund']].map(([label, to]) => (
                <NavLink key={label} to={to} className="text-xs text-gray-600 hover:text-gray-300 transition-colors font-medium">{label}</NavLink>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PublicLayout;
