import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Database, Users, ChevronLeft, ChevronRight, LogOut, Store } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',       path: '/admin/dashboard' },
  { icon: ShoppingCart,    label: "Orders",           path: '/admin/orders' },
  { icon: Database,        label: 'Inventory',        path: '/admin/inventory-dashboard' },
  { icon: Users,           label: 'Customers',        path: '/admin/customers' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`relative flex flex-col bg-gray-950 border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-60'}`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
          <span className="text-white font-black text-base leading-none">S</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-black text-sm leading-tight truncate">Sandhya Fashion</p>
            <p className="text-gray-500 text-[10px] font-medium">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                active
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon size={18} className={`flex-shrink-0 ${active ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-200'}`} />
              {!collapsed && <span className="text-sm font-semibold truncate">{label}</span>}
              {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-semibold">Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};

export default Sidebar;
