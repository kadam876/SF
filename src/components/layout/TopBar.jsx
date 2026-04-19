import { Search, Bell, ChevronDown, Store } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_TITLES = {
  '/admin/dashboard':           'Dashboard',
  '/admin/orders':              'Orders',
  '/admin/inventory-dashboard': 'Inventory',
  '/admin/customers':           'Customers',
};

const TopBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropOpen, setDropOpen]       = useState(false);
  const dropRef  = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';
  const initials  = (user?.name || user?.email || 'A')[0].toUpperCase();

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/admin/inventory-dashboard', { state: { search: searchQuery.trim() } });
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 h-[60px] flex items-center justify-between flex-shrink-0">
      {/* Left: page title */}
      <div>
        <h1 className="text-lg font-extrabold text-gray-900">{pageTitle}</h1>
      </div>

      {/* Right: search + profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-9 pr-4 py-2 w-52 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </form>

        {/* View store */}
        <button
          onClick={() => window.open('/', '_blank')}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Store size={16} />
          <span className="hidden sm:block">View Store</span>
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen(o => !o)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-black">
              {initials}
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-[100px] truncate">
              {user?.name?.split(' ')[0] || 'Admin'}
            </span>
            <ChevronDown size={13} className={`text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
