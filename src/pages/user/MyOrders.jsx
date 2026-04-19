import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Package, Printer, ChevronDown, Clock,
  CheckCircle, Truck, XCircle, CreditCard, RefreshCcw,
  ShoppingBag, BadgeCheck, MapPin, Calendar, ChevronRight,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import { useCart } from '../../contexts/CartContext';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING_CONFIRMATION: { label: 'Awaiting Confirmation', short: 'Pending',    color: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-400',   icon: Clock,        step: 0 },
  PENDING:              { label: 'Pending',               short: 'Pending',    color: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-400',   icon: Clock,        step: 0 },
  PAID:                 { label: 'Payment Confirmed',     short: 'Confirmed',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: BadgeCheck,   step: 1 },
  CONFIRMED:            { label: 'Order Confirmed',       short: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500',    icon: CheckCircle,  step: 1 },
  SHIPPED:              { label: 'Out for Delivery',      short: 'Shipped',    color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500',  icon: Truck,        step: 2 },
  DELIVERED:            { label: 'Delivered',             short: 'Delivered',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle, step: 3 },
  CANCELLED:            { label: 'Cancelled',             short: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200',         dot: 'bg-red-400',     icon: XCircle,      step: -1 },
  PAYMENT_FAILED:       { label: 'Payment Failed',        short: 'Failed',     color: 'bg-red-50 text-red-700 border-red-200',         dot: 'bg-red-400',     icon: XCircle,      step: -1 },
  REFUND_INITIATED:     { label: 'Refund Initiated',      short: 'Refunding',  color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400',  icon: RefreshCcw,   step: -1 },
  REFUNDED:             { label: 'Refunded',              short: 'Refunded',   color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500',  icon: RefreshCcw,   step: -1 },
};

const STEPS = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered'];

const needsPayment = (o) =>
  o.paymentMethod === 'CASHFREE' &&
  ['PENDING_CONFIRMATION', 'PENDING', 'PAYMENT_FAILED'].includes(o.status);

// ── Skeleton card ─────────────────────────────────────────────────────────────
const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-gray-100 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="w-20 h-6 bg-gray-100 rounded-full" />
    </div>
    <div className="h-2 bg-gray-100 rounded-full" />
    <div className="flex justify-between">
      <div className="h-3 bg-gray-100 rounded w-1/4" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
  </div>
);

// ── Order progress bar ────────────────────────────────────────────────────────
const OrderProgress = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  const currentStep = cfg?.step ?? 0;
  const isCancelled = currentStep === -1;

  if (isCancelled) return null;

  return (
    <div className="flex items-center gap-0 mt-3 px-1">
      {STEPS.map((step, i) => {
        const done    = i <= currentStep;
        const active  = i === currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                done
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'bg-white border-gray-200'
              } ${active ? 'ring-2 ring-emerald-200 ring-offset-1' : ''}`}>
                {done
                  ? <CheckCircle size={12} className="text-white" />
                  : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
              </div>
              <span className={`text-[9px] font-semibold mt-1 whitespace-nowrap ${done ? 'text-emerald-600' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-0.5 mb-4 rounded-full transition-all ${i < currentStep ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const MyOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { retryPayment, clearCart } = useCart();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [justPaidOrder, setJustPaidOrder] = useState(null);
  const [verifying, setVerifying]     = useState(false);

  const returnedCfOrderId = searchParams.get('order_id');

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

  useEffect(() => {
    // Start fetching orders immediately — don't wait for verification
    fetchOrders().then(data => {
      if (data) setOrders(data);
      setLoading(false);
    });

    // Verify payment in parallel if redirected from Cashfree
    if (returnedCfOrderId) {
      setVerifying(true);
      setSearchParams({}, { replace: true });
      fetch(API_ENDPOINTS.VERIFY_PAYMENT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cashfreeOrderId: returnedCfOrderId }),
      })
        .then(r => r.json())
        .then(data => {
          if (data?.success) {
            setJustPaidOrder(data.order);
            clearCart();
            // Refresh orders list to show updated status
            fetchOrders().then(d => { if (d) setOrders(d); });
          }
        })
        .catch(() => {})
        .finally(() => setVerifying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = (order) => {
    const sub   = order.subtotal ?? order.totalAmount ?? 0;
    const gst   = order.gstAmount ?? sub * 0.05;
    const plat  = order.platformCharge ?? sub * 0.02;
    const grand = order.totalAmount ?? sub + gst + plat;
    const orderId   = order.id?.slice(-8).toUpperCase();
    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"/>
<title>Invoice #${orderId} — Sandhya Fashion</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:780px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.08)}

  /* Header */
  .header{background:linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%);padding:40px 48px;display:flex;justify-content:space-between;align-items:flex-start}
  .brand-name{font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px}
  .brand-sub{font-size:12px;color:#6ee7b7;font-weight:600;margin-top:4px;letter-spacing:0.05em;text-transform:uppercase}
  .invoice-label{text-align:right}
  .invoice-title{font-size:32px;font-weight:900;color:#fff;letter-spacing:-1px}
  .invoice-num{font-size:13px;color:#6ee7b7;font-weight:700;margin-top:6px;letter-spacing:0.08em}

  /* Meta strip */
  .meta-strip{background:#f0fdf4;border-bottom:1px solid #d1fae5;padding:20px 48px;display:flex;gap:40px;flex-wrap:wrap}
  .meta-item label{display:block;font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px}
  .meta-item span{font-size:14px;font-weight:700;color:#111827}
  .status-badge{display:inline-block;background:#d1fae5;color:#065f46;font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.08em}

  /* Body */
  .body{padding:40px 48px}

  /* Addresses */
  .addresses{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:36px}
  .addr-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px}
  .addr-box h4{font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px}
  .addr-box p{font-size:13px;color:#374151;font-weight:500;line-height:1.6}
  .addr-box .name{font-size:15px;font-weight:800;color:#111827;margin-bottom:4px}

  /* Items table */
  .table-wrap{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px}
  table{width:100%;border-collapse:collapse}
  thead tr{background:#f8fafc}
  th{padding:12px 16px;text-align:left;font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #e2e8f0}
  th:last-child,td:last-child{text-align:right}
  td{padding:14px 16px;font-size:13px;color:#374151;border-bottom:1px solid #f1f5f9;font-weight:500}
  tbody tr:last-child td{border-bottom:none}
  tbody tr:hover{background:#fafafa}
  .product-name{font-weight:700;color:#111827}
  .amount{font-weight:800;color:#111827}

  /* Totals */
  .totals{display:flex;justify-content:flex-end;margin-bottom:36px}
  .totals-box{width:300px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
  .total-row{display:flex;justify-content:space-between;padding:10px 18px;font-size:13px;border-bottom:1px solid #f1f5f9}
  .total-row:last-child{border-bottom:none}
  .total-row span:first-child{color:#6b7280;font-weight:500}
  .total-row span:last-child{font-weight:700;color:#111827}
  .total-row.grand{background:#064e3b;padding:14px 18px}
  .total-row.grand span{color:#fff!important;font-size:15px;font-weight:900}

  /* Footer */
  .footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 48px;display:flex;justify-content:space-between;align-items:center}
  .footer-left p{font-size:12px;color:#6b7280;font-weight:500;line-height:1.6}
  .footer-right{text-align:right}
  .footer-right p{font-size:11px;color:#9ca3af;font-weight:500}
  .thank-you{font-size:14px;font-weight:800;color:#065f46;margin-bottom:4px}

  /* Watermark for paid */
  .paid-stamp{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;font-weight:900;color:rgba(16,185,129,0.06);letter-spacing:8px;pointer-events:none;white-space:nowrap}

  @media print{
    body{background:#fff}
    .page{margin:0;border-radius:0;box-shadow:none}
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-name">Sandhya Fashion</div>
      <div class="brand-sub">Wholesale · Surat, Gujarat</div>
    </div>
    <div class="invoice-label">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-num">#${orderId}</div>
    </div>
  </div>

  <!-- Meta strip -->
  <div class="meta-strip">
    <div class="meta-item">
      <label>Invoice Date</label>
      <span>${orderDate}</span>
    </div>
    <div class="meta-item">
      <label>Order ID</label>
      <span>#${orderId}</span>
    </div>
    <div class="meta-item">
      <label>Payment Method</label>
      <span>${order.paymentMethod || '—'}</span>
    </div>
    <div class="meta-item">
      <label>Status</label>
      <span class="status-badge">${STATUS_CONFIG[order.status]?.label ?? order.status}</span>
    </div>
    ${order.trackingNumber ? `<div class="meta-item"><label>Tracking No.</label><span>${order.trackingNumber}</span></div>` : ''}
  </div>

  <!-- Body -->
  <div class="body">

    <!-- Addresses -->
    <div class="addresses">
      <div class="addr-box">
        <h4>From</h4>
        <p class="name">Sandhya Fashion</p>
        <p>Shop No. B/5083, Upper Ground Floor<br/>Global Textile Market<br/>Surat 395010, Gujarat</p>
        <p style="margin-top:8px;font-size:12px;color:#6b7280">+91 7574927364</p>
      </div>
      <div class="addr-box">
        <h4>Ship To</h4>
        <p class="name">${order.userId || 'Customer'}</p>
        <p>${order.shippingAddress || '—'}</p>
      </div>
    </div>

    <!-- Items table -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:40%">Product</th>
            <th>Size</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || []).map((item, idx) => `
          <tr>
            <td><span class="product-name">${item.productName || item.productId || '—'}</span></td>
            <td>${item.selectedSize || '—'}</td>
            <td>${item.quantity}</td>
            <td>₹${item.unitPrice?.toFixed(2) ?? '—'}</td>
            <td class="amount">₹${item.totalPrice?.toFixed(2) ?? '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-box">
        <div class="total-row"><span>Subtotal</span><span>₹${sub.toFixed(2)}</span></div>
        <div class="total-row"><span>GST (5%)</span><span>₹${gst.toFixed(2)}</span></div>
        <div class="total-row"><span>Platform Charges (2%)</span><span>₹${plat.toFixed(2)}</span></div>
        <div class="total-row grand"><span>Total Paid</span><span>₹${grand.toFixed(2)}</span></div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      <p class="thank-you">Thank you for your business!</p>
      <p>For queries: Sandhyafashion39@gmail.com · +91 7574927364</p>
    </div>
    <div class="footer-right">
      <p>This is a computer-generated invoice.</p>
      <p>No signature required.</p>
    </div>
  </div>

</div>
<script>window.onload=()=>window.print();</script>
</body></html>`);
    win.document.close();
  };

  const handleRetry = async (order) => {
    setPayingOrderId(order.id);
    try {
      const res = await retryPayment(order);
      if (res?.success) {
        setJustPaidOrder(res.order);
        fetchOrders().then(d => { if (d) setOrders(d); });
      }
    } catch {
      alert('Payment failed or was cancelled. Please try again.');
    } finally {
      setPayingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Header ── */}
      <div className="relative bg-gray-950 overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-teal-600/15 rounded-full blur-[80px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-2xl mx-auto px-4 pt-8 pb-16">
          {/* Back + verifying */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold group">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back
            </button>
            {verifying && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                Verifying payment…
              </div>
            )}
          </div>

          {/* Title row */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Package size={22} className="text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">My Orders</h1>
              </div>
              <p className="text-gray-400 font-medium text-sm ml-1">
                {!loading && orders.length > 0
                  ? `${orders.length} order${orders.length !== 1 ? 's' : ''} · Track & manage your purchases`
                  : 'Track and manage your purchases'}
              </p>
            </div>
            {!loading && orders.length > 0 && (
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-2xl font-black text-white">{orders.length}</span>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Orders</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 pb-12 space-y-4 relative z-10">

        {/* ── Just paid banner ── */}
        {justPaidOrder && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Payment Successful</p>
                <p className="font-extrabold text-lg">Order Placed! 🎊</p>
                <p className="text-emerald-100 text-sm truncate">
                  #{justPaidOrder.id?.slice(-8).toUpperCase()} · ₹{justPaidOrder.totalAmount?.toFixed(2)}
                </p>
              </div>
              <button onClick={() => setJustPaidOrder(null)} className="text-white/70 hover:text-white text-xl font-bold flex-shrink-0">×</button>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── Skeleton loading ── */}
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <OrderSkeleton key={i} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={36} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">No orders yet</h2>
            <p className="text-gray-400 text-sm mb-6">Your orders will appear here once you shop.</p>
            <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors">
              Start Shopping
            </button>
          </div>
        )}

        {/* ── Orders list ── */}
        {!loading && orders.map(order => {
          const cfg        = STATUS_CONFIG[order.status] ?? { label: order.status, short: order.status, color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400', icon: Package, step: 0 };
          const StatusIcon = cfg.icon;
          const isExpanded = expandedOrder === order.id;
          const isJustPaid = justPaidOrder?.id === order.id;
          const orderId    = order.id?.slice(-8).toUpperCase();
          const orderDate  = order.orderDate
            ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—';
          const firstItem  = order.items?.[0];
          const extraItems = (order.items?.length ?? 0) - 1;
          const sub        = order.subtotal ?? order.totalAmount ?? 0;
          const gst        = order.gstAmount ?? sub * 0.05;
          const plat       = order.platformCharge ?? sub * 0.02;
          const grand      = order.totalAmount ?? sub + gst + plat;

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-shadow ${
                isJustPaid ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100'
              } shadow-sm hover:shadow-md`}
            >
              {/* ── Card top: always visible ── */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                {/* Row 1: order id + status badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 text-sm">#{orderId}</span>
                    {isJustPaid && <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                      {cfg.short}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Row 2: product image + name + amount */}
                <div className="flex items-center gap-3">
                  {/* Product thumbnail */}
                  {firstItem?.productImage ? (
                    <img
                      src={firstItem.productImage}
                      alt={firstItem.productName}
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={22} className="text-gray-300" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                      {firstItem?.productName || 'Order'}
                    </p>
                    {extraItems > 0 && (
                      <p className="text-xs text-gray-400 font-medium">+{extraItems} more item{extraItems > 1 ? 's' : ''}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {orderDate}
                      </span>
                      {order.paymentMethod && (
                        <span className="text-xs text-gray-400">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-gray-900 text-base">₹{grand.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Row 3: progress tracker */}
                <OrderProgress status={order.status} />

                {/* Needs payment CTA */}
                {needsPayment(order) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRetry(order); }}
                    disabled={payingOrderId === order.id}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <CreditCard size={15} />
                    {payingOrderId === order.id ? 'Processing…' : 'Complete Payment'}
                  </button>
                )}
              </div>

              {/* ── Expanded details ── */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[900px]' : 'max-h-0'}`}>
                <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-4">

                  {/* Delivery info */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600 font-medium leading-snug">{order.shippingAddress || '—'}</p>
                  </div>

                  {order.trackingNumber && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Tracking Number</p>
                        <p className="font-black text-indigo-700 text-sm">{order.trackingNumber}</p>
                      </div>
                      <Truck size={20} className="text-indigo-400" />
                    </div>
                  )}

                  {/* Items list */}
                  <div className="space-y-2">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={18} className="text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{item.productName || item.productId}</p>
                          <div className="flex gap-2 mt-0.5">
                            {item.selectedSize && <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Size: {item.selectedSize}</span>}
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <p className="font-black text-emerald-600 text-sm flex-shrink-0">₹{item.totalPrice?.toFixed(2) ?? '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bill summary */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span><span>₹{sub.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>GST (5%)</span><span>₹{gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Platform Charges (2%)</span><span>₹{plat.toFixed(2)}</span>
                    </div>
                    {order.refundStatus && (
                      <div className="flex justify-between text-purple-600 font-semibold">
                        <span>Refund {order.refundStatus}</span>
                        <span>{order.refundAmount ? `-₹${order.refundAmount.toFixed(2)}` : ''}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-gray-900 border-t border-gray-100 pt-2 text-base">
                      <span>{['PAID','CONFIRMED','SHIPPED','DELIVERED'].includes(order.status) ? 'Total Paid' : 'Total'}</span>
                      <span className="text-emerald-600">₹{grand.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/shop')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                      <ShoppingBag size={15} />
                      Shop More
                    </button>
                    {['PAID','CONFIRMED','SHIPPED','DELIVERED'].includes(order.status) && (
                      <button
                        onClick={() => handlePrint(order)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
                      >
                        <Printer size={15} />
                        Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
