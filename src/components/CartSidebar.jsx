import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, Phone, CheckCircle, Sparkles, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// ── Order Success Overlay ─────────────────────────────────────────────────────
const OrderSuccessOverlay = ({ order, onClose, onViewOrders }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

    {/* Card */}
    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-[popIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
      {/* Green top band */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-10 text-white text-center relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />

        {/* Animated checkmark */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center ring-4 ring-white/30">
            <CheckCircle size={40} className="text-white" />
          </div>
          <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Order Placed! 🎊</h2>
        <p className="text-emerald-100 text-sm font-medium">Payment confirmed successfully</p>
      </div>

      {/* Details */}
      <div className="px-6 py-5 space-y-4">
        {order && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Order ID</span>
              <span className="font-black text-gray-900">#{order.id?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Total Paid</span>
              <span className="font-black text-emerald-600 text-base">₹{order.totalAmount?.toFixed(2)}</span>
            </div>
            {order.items?.length > 0 && (
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Items</span>
                <span className="font-bold text-gray-900">{order.items.length} item(s)</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Payment</span>
              <span className="font-bold text-gray-900">{order.paymentMethod || '—'}</span>
            </div>
          </div>
        )}

        {/* Progress steps */}
        <div className="flex items-center justify-between px-2">
          {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i === 0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}>
                  {i === 0 ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-[9px] font-semibold mt-1 ${i === 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
              {i < 3 && <div className="w-6 h-0.5 bg-gray-200 mx-1 mb-4" />}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={onViewOrders}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <Package size={16} />
            My Orders
          </button>
        </div>
      </div>
    </div>

    <style>{`
      @keyframes popIn {
        from { opacity: 0; transform: scale(0.85) translateY(20px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
    `}</style>
  </div>
);

// ── CartSidebar ───────────────────────────────────────────────────────────────
const CartSidebar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateProfile } = useAuth();
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('CASHFREE');
  const [phoneInput, setPhoneInput] = useState('');
  const [successOrder, setSuccessOrder] = useState(null); // triggers overlay

  const {
    cartItems,
    isCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalSavings,
    getSubtotal,
    getGST,
    getPlatformCharge,
    closeCart,
    checkout,
    loading,
    error: checkoutError,
    checkoutStep,
    setCheckoutStep,
  } = useCart();

  useEffect(() => {
    if (user?.address) setShippingAddress(user.address);
  }, [user?.address]);

  // ── Cart item helpers — always use productId for lookups ──────────────────
  const getProductId = (item) => item.productId || item.id;

  const handleQuantityChange = (item, change) => {
    const newQty = item.quantity + change;
    updateQuantity(getProductId(item), item.selectedSize, newQty);
  };

  const handleRemove = (item) => {
    removeFromCart(getProductId(item), item.selectedSize);
  };

  if (!isCartOpen && !successOrder) return null;

  return (
    <>
      {/* ── Order Success Overlay ── */}
      {successOrder && (
        <OrderSuccessOverlay
          order={successOrder}
          onClose={() => setSuccessOrder(null)}
          onViewOrders={() => {
            setSuccessOrder(null);
            navigate('/my-orders');
          }}
        />
      )}

      {/* ── Cart Sidebar ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeCart}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col z-10">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <ShoppingBag size={24} className="text-[#00B67A]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {checkoutStep === 1
                    ? cartItems.some(i => i.isWholesale) ? 'Wholesale Cart' : 'Shopping Cart'
                    : 'Checkout Details'}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                {checkoutStep === 2 && (
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="px-3 py-1 text-xs font-bold text-[#00B67A] hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                  >
                    ← Edit Cart
                  </button>
                )}
                <button onClick={closeCart} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* ── Step 1: Cart Items ── */}
            {checkoutStep === 1 && (
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-gray-200">
                      <ShoppingBag size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Your cart is empty</h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-[200px]">Add some products to get started</p>
                    <button
                      onClick={() => { closeCart(); navigate('/shop'); }}
                      className="px-6 py-3 bg-[#00B67A] text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      Browse Shop
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <div
                        key={`${getProductId(item)}-${item.selectedSize}-${index}`}
                        className="bg-gray-50 rounded-2xl p-3 flex items-start gap-3"
                      >
                        {/* Image */}
                        <img
                          src={item.imageUrl || item.image || 'https://picsum.photos/seed/product/80/80'}
                          alt={item.name || 'Product'}
                          className="w-18 h-18 w-[72px] h-[72px] object-cover rounded-xl flex-shrink-0"
                          onError={(e) => { e.target.src = 'https://picsum.photos/seed/product/80/80'; }}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
                            {item.name}
                          </h3>

                          {item.isWholesale ? (
                            <p className="text-xs text-gray-500 mb-1">
                              {item.piecesPerSet || 4} pcs/set · ₹{item.wholesalePrice || item.specialPrice || 0}/set
                            </p>
                          ) : (
                            <div className="flex items-center gap-2 mb-1">
                              {item.selectedSize && (
                                <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                  {item.selectedSize}
                                </span>
                              )}
                              <span className="text-sm font-bold text-[#00B67A]">
                                ₹{item.specialPrice || item.price || 0}
                              </span>
                              {((item.factoryPrice || item.originalPrice) > (item.specialPrice || item.price)) && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{item.factoryPrice || item.originalPrice}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Qty controls + delete */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden">
                              <button
                                onClick={() => handleQuantityChange(item, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 text-sm font-bold text-gray-900 min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemove(item)}
                              className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Checkout Details ── */}
            {checkoutStep === 2 && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">

                {/* Delivery Address */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-gray-900 font-bold">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">1</div>
                    <span>Delivery Address</span>
                  </div>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    placeholder="Enter your complete delivery address..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00B67A] focus:border-transparent outline-none resize-none bg-gray-50/50"
                  />
                </div>

                {/* Payment Method */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 text-gray-900 font-bold">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">2</div>
                    <span>Payment Method</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('CASHFREE')}
                      className={`py-4 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${
                        paymentMethod === 'CASHFREE'
                          ? 'bg-[#00B67A] text-white border-[#00B67A] shadow-lg shadow-emerald-500/20'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Online Payment
                    </button>
                    <button
                      onClick={() => setPaymentMethod('COD')}
                      className={`py-4 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${
                        paymentMethod === 'COD'
                          ? 'bg-[#00B67A] text-white border-[#00B67A] shadow-lg shadow-emerald-500/20'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Cash on Delivery
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-tighter">
                    {paymentMethod === 'CASHFREE' ? 'Secure payment via Cashfree' : 'Pay with cash upon delivery'}
                  </p>
                  <div className="flex justify-center items-center gap-4 py-2 border-t border-gray-50">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-2.5 opacity-50 grayscale" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 opacity-50 grayscale" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo.png/640px-UPI-Logo.png" alt="UPI" className="h-3 opacity-50 grayscale" />
                    <div className="h-3 w-[1px] bg-gray-200 mx-1" />
                    <img src="https://cashfreelogo.cashfree.com/cashfreepayments/logos/Color/Color@3x.png" alt="Cashfree" className="h-4 opacity-80" />
                  </div>

                  {/* Phone field: only when CASHFREE + user has no phone */}
                  {paymentMethod === 'CASHFREE' && !user?.phone && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone size={14} className="text-amber-600" />
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Mobile Number Required</span>
                      </div>
                      <p className="text-[11px] text-amber-600 mb-2">Cashfree needs your number to process the payment.</p>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="w-full px-4 py-2.5 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-white font-medium tracking-widest"
                      />
                    </div>
                  )}
                </div>

                {/* Bill Summary */}
                <div className="bg-white rounded-2xl p-4 space-y-2 text-sm border border-gray-100 shadow-sm">
                  <p className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-2">Bill Summary</p>
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{getSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GST (5%)</span>
                    <span>₹{getGST().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Platform Charges (2%)</span>
                    <span>₹{getPlatformCharge().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between text-emerald-600 text-xs font-semibold">
                      <span>You Save</span>
                      <span>-₹{getTotalSavings().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-gray-900 border-t border-gray-100 pt-2 mt-1 text-base">
                    <span>Total Payable</span>
                    <span className="text-[#00B67A]">₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="flex-shrink-0 border-t border-gray-100 p-4 space-y-3 bg-white">
              {cartItems.length > 0 ? (
                <>
                  {/* Mini total in step 1 */}
                  {checkoutStep === 1 && (
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm text-gray-500 font-medium">
                        {cartItems.reduce((s, i) => s + i.quantity, 0)} item(s)
                      </span>
                      <span className="text-base font-black text-gray-900">
                        ₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {checkoutError && (
                    <p className="text-xs text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">{checkoutError}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={checkoutStep === 1 ? clearCart : () => setCheckoutStep(1)}
                      className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm"
                    >
                      {checkoutStep === 1 ? 'Clear Cart' : 'Back'}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={async () => {
                        if (!isAuthenticated) {
                          navigate('/login');
                          closeCart();
                          return;
                        }

                        if (checkoutStep === 1) {
                          setCheckoutStep(2);
                          return;
                        }

                        const addr = shippingAddress.trim() || user?.address || '';
                        if (!addr) {
                          alert('Please provide a shipping address.');
                          return;
                        }

                        let effectivePhone = user?.phone || phoneInput;
                        const cleanPhone = effectivePhone?.replace(/\D/g, '') || '';

                        if (paymentMethod === 'CASHFREE' && !user?.phone) {
                          if (!cleanPhone || cleanPhone.length < 10) {
                            alert('Please enter your 10-digit mobile number to continue with online payment.');
                            return;
                          }
                          await updateProfile({ phone: cleanPhone });
                          effectivePhone = cleanPhone;
                        }

                        const result = await checkout(addr, paymentMethod, effectivePhone || null);
                        if (result?.success) {
                          setShippingAddress('');
                          setPhoneInput('');
                          setCheckoutStep(1);
                          closeCart();
                          setSuccessOrder(result.order);
                        }
                      }}
                      className="flex-[2] py-3 bg-[#00B67A] text-white rounded-xl hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-black text-sm disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {loading ? 'Processing…' : checkoutStep === 1 ? 'Proceed to Checkout' : 'Place Order'}
                    </button>
                  </div>
                </>
              ) : (
                /* Empty cart footer — just a close button */
                <button
                  onClick={closeCart}
                  className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartSidebar;
