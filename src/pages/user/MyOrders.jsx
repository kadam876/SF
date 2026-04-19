import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Package, Printer, ChevronDown, Clock,
  CheckCircle, Truck, XCircle, CreditCard, RefreshCcw,
  ShoppingBag, Sparkles, BadgeCheck,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import { useCart } from '../../contexts/CartContext';

// ── Status config for every status the backend can emit ──────────────────────
const STATUS_CONFIG = {
  PENDING_CONFIRMATION: {
    label: 'Awaiting Confirmation',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-500',
    icon: Clock,
  },
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-500',
    icon: Clock,
  },
  PAID: {
    label: 'Payment Confirmed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    icon: BadgeCheck,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-500',
    icon: CheckCircle,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-500',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border-red-200',
    iconBg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
    icon: XCircle,
  },
  PAYMENT_FAILED: {
    label: 'Payment Failed',
    color: 'bg-red-50 text-red-700 border-red-200',
    iconBg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
    icon: XCircle,
  },
  REFUND_INITIATED: {
    label: 'Refund Initiated',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-500',
    icon: RefreshCcw,
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
    icon: RefreshCcw,
  },
};

// Whether an order still needs payment completion
const needsPayment = (order) =>
  order.paymentMethod === 'CASHFREE' &&
  ['PENDING_CONFIRMATION', 'PENDING', 'PAYMENT_FAILED'].includes(order.status);

const MyOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { retryPayment } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);

  // The order_id from Cashfree return URL    e.g. /my-orders?order_id=SF_xxx
  const returnedCfOrderId = searchParams.get('order_id');
  const [justPaidOrder, setJustPaidOrder] = useState(null);   // the verified order object
  const [verifying, setVerifying] = useState(!!returnedCfOrderId);

  // ── Fetch orders ────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.MY_ORDERS, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      setError('Could not load your orders. Please try again.');
      return null;
    }
  }, []);

  // ── On mount: if Cashfree redirected back with order_id, verify it ──────
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      if (returnedCfOrderId) {
        // 1. Server-side verification — only trust this, never the redirect params
        try {
          const verifyRes = await fetch(API_ENDPOINTS.VERIFY_PAYMENT, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ cashfreeOrderId: returnedCfOrderId }),
          });
          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            setJustPaidOrder(verifyData.order);
          }
          // If not ok, payment wasn't successful — we still show orders normally
        } catch {
          // ignore, just show orders
        } finally {
          setVerifying(false);
        }

        // Clean the query string so refresh doesn't re-trigger
        setSearchParams({}, { replace: true });
      }

      // 2. Always load order list
      const data = await fetchOrders();
      if (data) setOrders(data);
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Print invoice ───────────────────────────────────────────────────────────
  const handlePrint = (order) => {
    const sub = order.subtotal ?? order.totalAmount ?? 0;
    const gst = order.gstAmount ?? sub * 0.05;
    const plat = order.platformCharge ?? sub * 0.02;
    const grand = order.totalAmount ?? sub + gst + plat;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice #${order.id?.slice(-8).toUpperCase()}</title>
      <style>
        body{font-family:'Inter',Arial,sans-serif;padding:32px;color:#111;max-width:800px;margin:0 auto}
        h2{color:#059669;margin-bottom:24px;font-weight:800;font-size:28px}
        table{width:100%;border-collapse:collapse;margin-top:24px}
        th,td{border-bottom:1px solid #e5e7eb;padding:12px 16px;text-align:left}
        th{background:#f9fafb;color:#374151;font-weight:600;text-transform:uppercase;font-size:12px;letter-spacing:.05em}
        .meta{margin-bottom:8px;color:#4b5563}.meta strong{color:#111827}
        .bill-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6}
        .bill-total{display:flex;justify-content:space-between;padding:10px 0;font-weight:800;font-size:1.1em;border-top:2px solid #111;margin-top:4px}
      </style></head><body>
      <h2>Sandhya Fashion — Invoice</h2>
      <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:32px">
        <p class="meta"><strong>Order ID:</strong> #${order.id?.slice(-8).toUpperCase()}</p>
        <p class="meta"><strong>Date:</strong> ${order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : '—'}</p>
        <p class="meta"><strong>Status:</strong> ${STATUS_CONFIG[order.status]?.label ?? order.status}</p>
        <p class="meta"><strong>Payment:</strong> ${order.paymentMethod || '—'}</p>
        <p class="meta"><strong>Shipping Address:</strong> ${order.shippingAddress || '—'}</p>
        ${order.trackingNumber ? `<p class="meta"><strong>Tracking #:</strong> ${order.trackingNumber}</p>` : ''}
      </div>
      <table>
        <thead><tr><th>Product</th><th>Size</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
        <tbody>${(order.items || []).map(item => `
          <tr>
            <td style="font-weight:500">${item.productName || item.productId}</td>
            <td>${item.selectedSize || '—'}</td><td>${item.quantity}</td>
            <td>₹${item.unitPrice?.toFixed(2) ?? '—'}</td>
            <td style="font-weight:600">₹${item.totalPrice?.toFixed(2) ?? '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:32px;text-align:right">
        <div class="bill-row"><span>Subtotal</span><span>₹${sub.toFixed(2)}</span></div>
        <div class="bill-row"><span>GST (5%)</span><span>₹${gst.toFixed(2)}</span></div>
        <div class="bill-row"><span>Platform Charges (2%)</span><span>₹${plat.toFixed(2)}</span></div>
        <div class="bill-total"><span>Total Paid</span><span style="color:#059669">₹${grand.toFixed(2)}</span></div>
      </div>
      </body></html>`);
    win.document.close();
    win.print();
  };

  // ── Retry payment ───────────────────────────────────────────────────────────
  const handleRetry = async (order) => {
    setPayingOrderId(order.id);
    try {
      const res = await retryPayment(order);
      if (res?.success) {
        // Payment done — set the success banner
        setJustPaidOrder(res.order);
        const data = await fetchOrders();
        if (data) setOrders(data);
      }
    } catch {
      alert('Payment failed or was cancelled. Please try again.');
    } finally {
      setPayingOrderId(null);
    }
  };

  // ── Loading / verifying state ───────────────────────────────────────────────
  if (loading || verifying) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      {verifying && <p className="text-gray-500 font-medium animate-pulse">Verifying your payment…</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 md:top-[72px] z-40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 md:py-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order History</h1>
            {!error && orders.length > 0 && (
              <p className="text-sm font-medium text-gray-500 mt-1">
                Review and track your orders
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">

        {/* ── 🎉 Order Placed Success Banner ──────────────────────────────────── */}
        {justPaidOrder && (
          <div
            className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-200/60 animate-[fadeSlideIn_0.5s_ease-out]"
            style={{ animation: 'fadeSlideIn 0.5s ease-out' }}
          >
            {/* Background sparkle circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Icon */}
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
                <Sparkles size={36} className="text-white" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BadgeCheck size={18} className="text-emerald-200" />
                  <span className="text-emerald-100 text-sm font-semibold uppercase tracking-widest">
                    Payment Successful
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight">
                  Order Placed! 🎊
                </h2>
                <p className="text-emerald-100 font-medium text-sm sm:text-base">
                  Thank you for your purchase. Your order{' '}
                  <span className="font-black text-white">
                    #{justPaidOrder.id?.slice(-8).toUpperCase()}
                  </span>{' '}
                  is confirmed and being processed.
                </p>
              </div>

              {/* Order summary pill */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center flex-shrink-0 min-w-[120px]">
                <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">Total Paid</p>
                <p className="text-2xl font-black">₹{justPaidOrder.totalAmount?.toFixed(2)}</p>
                <p className="text-emerald-200 text-xs mt-1">{justPaidOrder.items?.length} item(s)</p>
              </div>
            </div>

            {/* Progress steps */}
            <div className="relative mt-8 flex items-center gap-0">
              {['Order Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i === 0 ? 'bg-white text-emerald-600 border-white' : 'bg-white/20 text-white/70 border-white/30'}`}>
                      {i === 0 ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap ${i === 0 ? 'text-white' : 'text-white/60'}`}>
                      {step}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 rounded ${i === 0 ? 'bg-white/60' : 'bg-white/20'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setJustPaidOrder(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-6 py-4 font-medium shadow-sm">
            {error}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────────── */}
        {!error && orders.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 font-medium mb-8">Start shopping and your orders will appear here.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-md transition-colors"
            >
              Explore Catalog
            </button>
          </div>
        )}

        {/* ── Orders list ──────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {orders.map(order => {
            const isExpanded  = expandedOrder === order.id;
            const cfg         = STATUS_CONFIG[order.status] ?? {
              label: order.status,
              color: 'bg-gray-100 text-gray-700 border-gray-200',
              iconBg: 'bg-gray-100 border-gray-200',
              iconColor: 'text-gray-500',
              icon: Package,
            };
            const StatusIcon  = cfg.icon;
            const orderId     = order.id?.slice(-8).toUpperCase();
            const orderDate   = order.orderDate
              ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—';

            // Highlight the just-paid order
            const isJustPaid = justPaidOrder?.id === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isJustPaid
                    ? 'border-emerald-300 shadow-lg shadow-emerald-100/60 ring-2 ring-emerald-200'
                    : 'border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]'
                }`}
              >
                {/* ── Order summary row ─────────────────────────────────────── */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${cfg.iconBg}`}>
                      <StatusIcon size={24} className={cfg.iconColor} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-lg tracking-tight">
                          Order #{orderId}
                        </span>
                        {isJustPaid && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        {orderDate} · {order.items?.length ?? 0} item(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t border-gray-100 sm:border-0 pt-4 sm:pt-0">
                    <div className="flex flex-col sm:items-end">
                      <span className={`text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${cfg.color} mb-1 w-max block`}>
                        {cfg.label}
                      </span>
                      <span className="font-black text-gray-900 text-lg">
                        ₹{order.totalAmount?.toFixed(2) ?? '—'}
                      </span>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-emerald-50 text-emerald-600' : ''}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* ── Expanded details ─────────────────────────────────────── */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 bg-gray-50/30">

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Payment</p>
                        <p className="font-bold text-gray-900">{order.paymentMethod || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Order Type</p>
                        <p className="font-bold text-gray-900">{order.orderType || '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Shipping Address</p>
                        <p className="font-medium text-gray-700 line-clamp-2">{order.shippingAddress || '—'}</p>
                      </div>
                      {order.trackingNumber && (
                        <div className="col-span-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tracking Number</p>
                          <p className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg inline-block">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}
                      {order.refundStatus && (
                        <div className="col-span-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Refund Status</p>
                          <p className="font-bold text-purple-600 bg-purple-50 px-2 py-1.5 rounded-lg inline-block">
                            {order.refundStatus}
                            {order.refundAmount ? ` · ₹${order.refundAmount.toFixed(2)}` : ''}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="mb-6">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</p>
                      <div className="space-y-3">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-4">
                            <div className="mb-2 sm:mb-0">
                              <p className="font-extrabold text-gray-900 text-base mb-1">{item.productName || item.productId}</p>
                              <div className="flex gap-3 text-xs font-medium text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded-md">Size: {item.selectedSize || '—'}</span>
                                <span className="bg-gray-100 px-2 py-1 rounded-md">Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 font-medium mb-0.5">Subtotal</p>
                              <p className="font-black text-emerald-600 text-lg">₹{item.totalPrice?.toFixed(2) ?? '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals + Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-gray-200/60 mt-4 gap-4">
                      {/* Bill summary */}
                      <div className="bg-white rounded-xl p-4 space-y-1.5 text-sm min-w-[260px] border border-gray-100 shadow-sm">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill Summary</p>
                        {(() => {
                          const sub   = order.subtotal ?? order.totalAmount ?? 0;
                          const gst   = order.gstAmount ?? sub * 0.05;
                          const plat  = order.platformCharge ?? sub * 0.02;
                          const grand = order.totalAmount ?? sub + gst + plat;
                          return (
                            <>
                              <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span><span>₹{sub.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                <span>GST (5%)</span><span>₹{gst.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                <span>Platform Charges (2%)</span><span>₹{plat.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-black text-gray-900 border-t border-gray-200 pt-2 mt-1 text-base">
                                <span>{['PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'Total Paid' : 'Total Amount'}</span>
                                <span className="text-emerald-600">₹{grand.toFixed(2)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {/* Complete Payment — only for unpaid Cashfree orders */}
                        {needsPayment(order) && (
                          <button
                            onClick={() => handleRetry(order)}
                            disabled={payingOrderId === order.id}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            <CreditCard size={18} />
                            {payingOrderId === order.id ? 'Processing…' : 'Complete Payment'}
                          </button>
                        )}

                        {/* Shop more */}
                        <button
                          onClick={() => navigate('/shop')}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                          <ShoppingBag size={18} />
                          Shop More
                        </button>

                        {/* Invoice — only for paid or delivered */}
                        {['PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                          <button
                            onClick={() => handlePrint(order)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all"
                          >
                            <Printer size={18} />
                            Invoice
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS for entry animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
