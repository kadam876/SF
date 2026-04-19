import { Search, Download, Package, Truck, CheckCircle, Clock, Loader2, X, Ban, Bell } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';

const STATUS_TO_API = {
  awaiting: 'PENDING_CONFIRMATION',
  confirmed: 'CONFIRMED',
  pending: 'PENDING',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
};

function mapOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const first = items[0];
  const totalQty = items.reduce((s, i) => s + (Number(i?.quantity) || 0), 0);
  const product = items.length === 0 ? '—' : items.length === 1 ? first?.productName || 'Item' : `${items.length} items`;
  const status = (order.status || 'PENDING').toString();
  return {
    id: order.id,
    customer: order.userId || '—',
    product,
    quantity: totalQty || Number(first?.quantity) || 0,
    totalAmount: order.totalAmount != null ? Number(order.totalAmount) : 0,
    status,
    statusLower: status.toLowerCase(),
    paymentStatus: order.paymentMethod ? String(order.paymentMethod).toLowerCase() : 'pending',
    date: order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
    orderDate: order.orderDate,
  };
}

function isToday(d) {
  if (!d) return false;
  const dt = new Date(d);
  if (isNaN(dt)) return false;
  const n = new Date();
  return dt.getFullYear() === n.getFullYear() && dt.getMonth() === n.getMonth() && dt.getDate() === n.getDate();
}

const STATUS_STYLE = {
  DELIVERED:            { label: 'Delivered',          cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  SHIPPED:              { label: 'Shipped',             cls: 'bg-blue-50 text-blue-700',      icon: Truck },
  PENDING:              { label: 'Pending Shipment',    cls: 'bg-amber-50 text-amber-700',    icon: Clock },
  CONFIRMED:            { label: 'Confirmed',           cls: 'bg-indigo-50 text-indigo-700',  icon: CheckCircle },
  PENDING_CONFIRMATION: { label: 'Awaiting Acceptance', cls: 'bg-orange-50 text-orange-700', icon: Clock },
  CANCELLED:            { label: 'Cancelled',           cls: 'bg-red-50 text-red-600',        icon: Ban },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_STYLE[status?.toUpperCase()] || { label: status, cls: 'bg-gray-100 text-gray-600', icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const Orders = () => {
  const location = useLocation();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [todayOnly, setTodayOnly]     = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actionId, setActionId]       = useState(null);

  const fetchPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const res = await fetch(API_ENDPOINTS.ORDERS_BY_STATUS('PENDING_CONFIRMATION'), { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPendingQueue((Array.isArray(data) ? data : []).map(mapOrder));
    } catch { setPendingQueue([]); }
    finally { setLoadingPending(false); }
  }, []);

  useEffect(() => { if (modalOpen) fetchPending(); }, [modalOpen, fetchPending]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('newOrder') === 'true') setModalOpen(true);
  }, [location.search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_ORDERS, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders((Array.isArray(data) ? data : []).map(mapOrder));
      setError(null);
    } catch { setError('Failed to load orders.'); setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, nextStatus) => {
    setActionId(orderId);
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_UPDATE_ORDER_STATUS(orderId), {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      await fetchPending();
      await fetchOrders();
    } catch { alert('Could not update order. Please try again.'); }
    finally { setActionId(null); }
  };

  const handleExport = () => {
    if (!filtered.length) { alert('No orders to export.'); return; }
    const headers = ['Order ID', 'Customer', 'Product', 'Qty', 'Total (INR)', 'Status', 'Payment', 'Date'];
    const rows = filtered.map(o => [`"${o.id}"`, `"${o.customer}"`, `"${o.product}"`, o.quantity, o.totalAmount, `"${o.status}"`, `"${o.paymentStatus}"`, `"${o.date}"`]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const visible  = todayOnly ? orders.filter(o => isToday(o.orderDate)) : orders;
  const filtered = visible.filter(o => {
    if (statusFilter !== 'all') {
      const target = STATUS_TO_API[statusFilter] || statusFilter.toUpperCase();
      if (o.status.toUpperCase() !== target) return false;
    }
    const q = search.toLowerCase();
    return (o.id || '').toLowerCase().includes(q) || (o.customer || '').toLowerCase().includes(q) || (o.product || '').toLowerCase().includes(q);
  });

  const pendingCount   = visible.filter(o => ['PENDING', 'PENDING_CONFIRMATION'].includes(o.status.toUpperCase())).length;
  const shippedCount   = visible.filter(o => o.status.toUpperCase() === 'SHIPPED').length;
  const deliveredCount = visible.filter(o => o.status.toUpperCase() === 'DELIVERED').length;

  if (loading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="h-96 bg-gray-100 rounded-2xl" />
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between">
        <p className="text-red-600 font-medium text-sm">{error}</p>
        <button onClick={fetchOrders} className="text-sm font-bold text-red-600 bg-red-100 px-4 py-2 rounded-xl hover:bg-red-200 transition-colors">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Management</p>
          <h2 className="text-2xl font-black text-gray-900">Orders</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">
            {todayOnly ? `${visible.length} orders today` : `${orders.length} total orders`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:border-gray-300 transition-colors">
            <input type="checkbox" checked={todayOnly} onChange={e => setTodayOnly(e.target.checked)}
              className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
            Today only
          </label>
          <button onClick={() => setModalOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20">
            <Bell size={15} />
            New Orders
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {pendingCount}
              </span>
            )}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: visible.length,   icon: Package,      color: 'bg-blue-500',    filter: 'all' },
          { label: 'Pending', value: pendingCount,   icon: Clock,        color: 'bg-amber-500',   filter: 'pending' },
          { label: 'Shipped', value: shippedCount,   icon: Truck,        color: 'bg-indigo-500',  filter: 'shipped' },
          { label: 'Delivered', value: deliveredCount, icon: CheckCircle, color: 'bg-emerald-500', filter: 'delivered' },
        ].map(({ label, value, icon: Icon, color, filter }) => (
          <button key={label} onClick={() => setStatusFilter(statusFilter === filter ? 'all' : filter)}
            className={`bg-white rounded-2xl border p-4 text-left hover:shadow-md transition-all ${statusFilter === filter ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={16} className="text-white" />
              </div>
              {statusFilter === filter && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
            </div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by order ID, customer, product…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
          <option value="all">All Status</option>
          <option value="awaiting">Awaiting Acceptance</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending Shipment</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Today-only empty hint */}
      {todayOnly && visible.length === 0 && orders.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 text-sm font-medium text-amber-800">
          No orders placed today. Uncheck "Today only" to see all orders.
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order ID', 'Customer', 'Product', 'Qty', 'Amount', 'Status', 'Payment', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <Package size={32} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium text-sm">{orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}</p>
                  </td>
                </tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="text-xs font-black text-gray-500 font-mono">#{order.id?.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                        {(order.customer || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 truncate max-w-[100px]">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-[140px]">
                    <span className="text-sm text-gray-600 truncate block">{order.product}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-gray-700">{order.quantity}</span>
                    <span className="text-xs text-gray-400 ml-1">pcs</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-black text-gray-900">₹{(order.totalAmount ?? 0).toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      ['paid', 'cod'].includes(order.paymentStatus) ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{order.date}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {order.status.toUpperCase() === 'CONFIRMED' && (
                        <button onClick={() => updateStatus(order.id, 'PENDING')} disabled={actionId === order.id}
                          className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors whitespace-nowrap">
                          {actionId === order.id ? <Loader2 size={12} className="animate-spin" /> : 'Confirm Pay'}
                        </button>
                      )}
                      {order.status.toUpperCase() === 'PENDING' && (
                        <button onClick={() => updateStatus(order.id, 'SHIPPED')} disabled={actionId === order.id}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                          {actionId === order.id ? <Loader2 size={12} className="animate-spin" /> : 'Ship'}
                        </button>
                      )}
                      {order.status.toUpperCase() === 'SHIPPED' && (
                        <button onClick={() => updateStatus(order.id, 'DELIVERED')} disabled={actionId === order.id}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap">
                          {actionId === order.id ? <Loader2 size={12} className="animate-spin" /> : 'Delivered'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
            <p className="text-xs text-gray-400 font-medium">Showing {filtered.length} of {visible.length} orders</p>
          </div>
        )}
      </div>

      {/* Pending orders modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Pending Acceptance</h3>
                <p className="text-sm text-gray-400 font-medium mt-0.5">Review and accept or reject new orders</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingPending ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Loader2 className="animate-spin mb-3 text-emerald-500" size={32} />
                  <p className="text-sm font-medium">Loading pending orders…</p>
                </div>
              ) : pendingQueue.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package size={24} className="text-gray-300" />
                  </div>
                  <p className="font-bold text-gray-700 mb-1">No pending orders</p>
                  <p className="text-sm text-gray-400">New customer orders will appear here.</p>
                </div>
              ) : pendingQueue.map(order => (
                <div key={order.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Order #{order.id?.slice(-8).toUpperCase()}</p>
                      <p className="text-sm font-bold text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.product} · {order.quantity} pcs</p>
                      <p className="text-sm font-black text-gray-900">₹{(order.totalAmount ?? 0).toLocaleString('en-IN')} <span className="text-xs font-medium text-gray-400">· {order.date}</span></p>
                    </div>
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <button disabled={actionId === order.id} onClick={() => updateStatus(order.id, 'CONFIRMED')}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                        {actionId === order.id ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Accept'}
                      </button>
                      <button disabled={actionId === order.id}
                        onClick={() => { if (window.confirm('Reject this order?')) updateStatus(order.id, 'CANCELLED'); }}
                        className="flex-1 sm:flex-none px-5 py-2.5 border-2 border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button onClick={fetchPending} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                Refresh
              </button>
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
