import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Menu, X, User, LogOut, ChevronDown,
  Package, Settings, Instagram, Facebook, Phone, Mail,
  MapPin, Search,
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
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white/95 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 flex-shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <span className="text-white font-black text-lg leading-none">S</span>
              </div>
              <span className="text-lg font-extrabold text-gray-900 tracking-tight hidden sm:block">
                Sandhya <span className="text-emerald-600">Fashion</span>
              </span>
            </button>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, to }) => (
                <NavLink
                  key={label}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-2">

              {/* Search */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setSearchOpen(o => !o)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Search size={18} />
                </button>
                {searchOpen && (
                  <form
                    onSubmit={handleSearch}
                    className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex gap-2 w-72"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search products…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm font-medium outline-none bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Go
                    </button>
                  </form>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Account */}
              {isAuthenticated ? (
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen(o => !o)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-xs font-black">
                      {(user?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <ChevronDown size={13} className={`text-gray-400 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <button onClick={() => { navigate('/profile'); setAccountOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                          <Settings size={16} /> Profile Settings
                        </button>
                        <button onClick={() => { navigate('/my-orders'); setAccountOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                          <Package size={16} /> My Orders
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all"
                >
                  <User size={15} /> Sign In
                </button>
              )}
            </div>

            {/* Mobile right */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={openCart} className="relative p-2 text-gray-600 hover:text-emerald-600">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100 ${mobileOpen ? 'max-h-[480px]' : 'max-h-0'}`}>
          <div className="px-4 py-4 space-y-1">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-400"
              />
              <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold">
                <Search size={16} />
              </button>
            </form>

            {NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            <div className="pt-3 mt-3 border-t border-gray-100 space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-black">
                      {(user?.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { navigate('/profile'); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">
                    <Settings size={16} /> Profile Settings
                  </button>
                  <button onClick={() => { navigate('/my-orders'); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">
                    <Package size={16} /> My Orders
                  </button>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl">
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <User size={16} /> Sign In to Your Account
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <span className="text-white font-black text-lg">S</span>
                </div>
                <span className="text-white font-extrabold text-lg">Sandhya Fashion</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 max-w-sm mb-6">
                Premium wholesale fashion from Surat's Global Textile Market. Factory-direct pricing for retailers across India.
              </p>
              <div className="flex gap-3">
                {[Instagram, Facebook].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all text-gray-400">
                    <Icon size={16} />
                  </a>
                ))}
                <a href="https://wa.me/917574927364" target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-gray-400 text-xs font-black">
                  WA
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="text-white font-bold text-xs uppercase tracking-widest mb-4">Quick Links</p>
              <ul className="space-y-3 text-sm">
                {[['Shop', '/shop'], ['About Us', '/about'], ['Contact', '/contact'], ['Terms', '/terms'], ['Refund Policy', '/refund']].map(([label, to]) => (
                  <li key={label}>
                    <NavLink to={to} className="hover:text-emerald-400 transition-colors font-medium">{label}</NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white font-bold text-xs uppercase tracking-widest mb-4">Contact</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Phone size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">+91 7574927364</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium break-all">Sandhyafashion39@gmail.com</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Shop B/5083, Global Textile Market, Surat 395010</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600 font-medium">
            <p>© 2026 Sandhya Fashion. All rights reserved.</p>
            <div className="flex gap-5">
              <NavLink to="/terms" className="hover:text-gray-300 transition-colors">Terms</NavLink>
              <NavLink to="/refund" className="hover:text-gray-300 transition-colors">Refund</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
