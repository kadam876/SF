import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, Phone } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartSidebar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateProfile } = useAuth();
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('CASHFREE');
  const [phoneInput, setPhoneInput] = useState('');

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

  const handleQuantityChange = (item, change) => {
    updateQuantity(item.id, item.selectedSize, item.quantity + change);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Sidebar */}
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
              <div className="text-center py-8">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.selectedSize}-${index}`} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.imageUrl || item.image || 'https://picsum.photos/seed/product/80/80'}
                        alt={item.name || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => { e.target.src = 'https://picsum.photos/seed/product/80/80'; }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                        {item.isWholesale ? (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">
                              {item.quantity} {item.quantity === 1 ? 'Set' : 'Sets'} ({item.piecesPerSet || 4} pieces each)
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-[#00B67A]">
                                ₹{item.wholesalePrice || item.specialPrice || 0}
                              </span>
                              <span className="text-xs text-gray-500">per set</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {item.selectedSize && <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>}
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-[#00B67A]">
                                ₹{item.specialPrice || item.price || 0}
                              </span>
                              {((item.factoryPrice || item.originalPrice) > (item.specialPrice || item.price)) && (
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{item.factoryPrice || item.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200">
                          <button onClick={() => handleQuantityChange(item, -1)} className="p-1 hover:bg-gray-100 transition-colors">
                            <Minus size={16} className="text-gray-600" />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
                            {item.isWholesale ? `${item.quantity} ${item.quantity === 1 ? 'Set' : 'Sets'}` : item.quantity}
                          </span>
                          <button onClick={() => handleQuantityChange(item, 1)} className="p-1 hover:bg-gray-100 transition-colors">
                            <Plus size={16} className="text-gray-600" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {/* Delivery Address */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-gray-900 font-bold">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">1</div>
                <span>Delivery Address</span>
              </div>
              <textarea
                id="cart-shipping"
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
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">2</div>
                <span>Payment Method</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('CASHFREE')}
                  className={`px-3 py-4 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${
                    paymentMethod === 'CASHFREE'
                      ? 'bg-[#00B67A] text-white border-[#00B67A] shadow-lg shadow-emerald-500/20'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Online Payment
                </button>
                <button
                  onClick={() => setPaymentMethod('COD')}
                  className={`px-3 py-4 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${
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
            <div className="bg-white rounded-xl p-4 space-y-2 text-sm border border-gray-100 shadow-sm">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Bill Summary</p>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{getSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (5%)</span>
                <span>₹{getGST().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Charges (2%)</span>
                <span>₹{getPlatformCharge().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {getTotalSavings() > 0 && (
                <div className="flex justify-between text-green-600 text-xs font-semibold">
                  <span>You Save</span>
                  <span>-₹{getTotalSavings().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                <span>Total Payable</span>
                <span className="text-[#00B67A] text-base">₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer: action buttons ── */}
        {cartItems.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4 space-y-3 bg-white">
            {checkoutError && (
              <p className="text-sm text-red-600 font-medium">{checkoutError}</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={checkoutStep === 1 ? clearCart : () => setCheckoutStep(1)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm"
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
                    closeCart();
                    navigate('/my-orders');
                  }
                }}
                className="flex-1 px-4 py-3 bg-[#00B67A] text-white rounded-xl hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? 'Processing…' : checkoutStep === 1 ? 'Proceed' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
