import { TrendingUp, Package, ShoppingCart, Users, ArrowRight, ArrowUpRight, ArrowDownRight, Star, X, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

const StatCard = ({ icon: Icon, label, value, growth, color, onClick }) => {
  const up = growth >= 0;
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(growth || 0)}%
        </span>
      </div>
      <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </button>
  );
};

const ChartCard = ({ title, badge, children, action }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
        {badge && <span className="text-[10px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider">{badge}</span>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [salesRange, setSalesRange]         = useState('month');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesData, setSalesData]           = useState(null);
  const [categoryData, setCategoryData]     = useState(null);
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [topProducts, setTopProducts]       = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [topLimit, setTopLimit]             = useState(10);
  const [topLoading, setTopLoading]         = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  useEffect(() => { fetchAll(); }, [salesRange]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const h = { headers: getAuthHeaders() };
      const res = await fetch(`${API_ENDPOINTS.ANALYTICS_DASHBOARD_FULL}?period=${salesRange}`, h);
      if (res.ok) {
        const d = await res.json();
        setDashboardStats(d.stats);
        setSalesData(d.sales);
        setCategoryData(d.categories);
        setOrderStatusData(d.orderStatus);
        setTopProducts(d.topProducts);
        setPredictionData(d.predictions);
      }
      setError(null);
    } catch (e) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async (limit) => {
    setTopLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.ADMIN_TOP_PRODUCTS}?limit=${limit}`, { headers: getAuthHeaders() });
      if (res.ok) setTopProducts(await res.json());
    } finally { setTopLoading(false); }
  };

  const handleProductClick = async (productId) => {
    setProductLoading(true);
    setSelectedProduct(null);
    try {
      const res = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(productId), { headers: getAuthHeaders() });
      if (res.ok) setSelectedProduct(await res.json());
      else navigate(`/product/${productId}`);
    } finally { setProductLoading(false); }
  };

  if (loading) return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-80 bg-gray-100 rounded-2xl" />
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between">
        <p className="text-red-600 font-medium text-sm">{error}</p>
        <button onClick={fetchAll} className="text-sm font-bold text-red-600 bg-red-100 px-4 py-2 rounded-xl hover:bg-red-200 transition-colors">Retry</button>
      </div>
    </div>
  );

  const stats = dashboardStats || {};

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Overview</p>
          <h2 className="text-2xl font-black text-gray-900">Analytics Dashboard</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">
            <ShoppingCart size={15} /> Orders
          </button>
          <button onClick={() => navigate('/admin/customers')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
            <Users size={15} /> Customers
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package}     label="Total Products"  value={stats.totalProducts || 0}          growth={stats.productGrowth}  color="bg-blue-500"    onClick={() => navigate('/admin/inventory-dashboard')} />
        <StatCard icon={TrendingUp}  label="Low Stock Items" value={stats.lowStockItems || 0}           growth={-(stats.lowStockGrowth || 0)} color="bg-amber-500" onClick={() => navigate('/admin/inventory-dashboard', { state: { filter: 'low-stock' } })} />
        <StatCard icon={ShoppingCart} label="Total Orders"   value={stats.totalOrders || 0}             growth={stats.orderGrowth}    color="bg-emerald-500" onClick={() => navigate('/admin/orders')} />
        <StatCard icon={Users}       label="Total Revenue"   value={fmt(stats.totalRevenue || 0)}       growth={stats.revenueGrowth}  color="bg-purple-500"  onClick={() => {}} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Sales Overview"
          action={
            <select value={salesRange} onChange={e => setSalesRange(e.target.value)}
              className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={salesData?.salesByDate || []}>
              <defs>
                <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis yAxisId="l" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis yAxisId="r" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={(v, n) => [n === 'sales' ? fmt(v) : v, n === 'sales' ? 'Revenue' : 'Orders']} />
              <Bar yAxisId="r" dataKey="orders" fill="#3b82f6" barSize={20} radius={[4, 4, 0, 0]} opacity={0.5} />
              <Area yAxisId="l" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fill="url(#gSales)" />
              <Line yAxisId="l" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sales Forecast" badge="AI">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={predictionData || []}>
              <defs>
                <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={v => fmt(v)} />
              <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gPred)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bestsellers */}
        <ChartCard
          title="Bestselling Products"
          action={
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-1">
              <input type="number" value={topLimit} onChange={e => setTopLimit(e.target.value)}
                className="w-12 text-center text-sm font-bold bg-transparent outline-none" />
              <button onClick={() => fetchTopProducts(parseInt(topLimit) || 10)} disabled={topLoading}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {topLoading ? '…' : 'Apply'}
              </button>
            </div>
          }
        >
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {topProducts?.length > 0 ? topProducts.map((p, i) => (
              <div key={p.productId} onClick={() => handleProductClick(p.productId)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-colors">
                <div className="relative flex-shrink-0">
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" onError={e => { e.target.src = 'https://placehold.co/48x48/e5e7eb/9ca3af?text=?'; }} />
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-white border border-gray-200 rounded-lg text-[9px] font-black text-emerald-600 flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(p.quantity / (topProducts[0]?.quantity || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-500 flex-shrink-0">{p.quantity} sold</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <Package size={40} className="mb-2" />
                <p className="text-sm font-medium text-gray-400">No sales data yet</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Category distribution */}
        <ChartCard title="Category Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData?.categories || []} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                paddingAngle={4} dataKey="count" nameKey="category">
                {(categoryData?.categories || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Order status */}
      <ChartCard title="Order Status Distribution">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={orderStatusData?.statusDistribution || []} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
              paddingAngle={4} dataKey="count" nameKey="status">
              {(orderStatusData?.statusDistribution || []).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Product detail modal */}
      {(productLoading || selectedProduct) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {productLoading ? (
              <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-emerald-500" size={36} />
              </div>
            ) : selectedProduct && (
              <>
                <div className="relative">
                  <img src={selectedProduct.imageUrl || 'https://placehold.co/600/e5e7eb/9ca3af?text=Product'}
                    alt={selectedProduct.name} className="w-full h-52 object-cover rounded-t-3xl"
                    onError={e => { e.target.src = 'https://placehold.co/600/e5e7eb/9ca3af?text=Product'; }} />
                  <button onClick={() => setSelectedProduct(null)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-md">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">{selectedProduct.category}</p>
                  </div>
                  {selectedProduct.ratings != null && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="text-amber-400" fill={i < Math.floor(Number(selectedProduct.ratings)) ? 'currentColor' : 'none'} />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">({Number(selectedProduct.ratings).toFixed(1)})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-emerald-600">₹{Math.round(selectedProduct.price || 0)}</span>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${selectedProduct.stockQuantity < 20 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {selectedProduct.stockQuantity} in stock
                    </span>
                  </div>
                  {selectedProduct.sizes?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map(s => (
                        <span key={s} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">{s}</span>
                      ))}
                    </div>
                  )}
                  {selectedProduct.description && (
                    <p className="text-sm text-gray-500 leading-relaxed">{selectedProduct.description}</p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setSelectedProduct(null); navigate('/admin/inventory-dashboard', { state: { search: selectedProduct.name } }); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">
                      <Package size={15} /> Inventory
                    </button>
                    <button onClick={() => { setSelectedProduct(null); navigate(`/product/${selectedProduct.id}`); }}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                      <ExternalLink size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
