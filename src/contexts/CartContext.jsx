import { createContext, useContext, useState, useEffect } from 'react';
import { load as loadCashfree } from '@cashfreepayments/cashfree-js';
import { API_ENDPOINTS, getAuthHeaders, STORAGE_KEYS } from '../config';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  const [cartItems, setCartItems] = useState(() => {
    // For initial synchronous boot, check local storage (will be [] if logged in usually)
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.CART);
      }
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Checkout
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronization with Backend / Auth Changes
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated) {
        // Authenticated: merge any lingering local cart, then pull authoritative cart from server
        try {
          const localCart = localStorage.getItem(STORAGE_KEYS.CART);
          let payload = [];
          if (localCart) {
            payload = JSON.parse(localCart).map(item => ({
              ...item,
              productId: item.productId || item.id,
              id: undefined // Remove legacy browser string ID to prevent Mongo cast errors
            }));
          }
          
          const response = await fetch(API_ENDPOINTS.CART + '/merge', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
          });
          
          if (response.ok) {
            const serverCart = await response.json();
            setCartItems(serverCart);
            // Wipe local storage now that backend tracks it
            localStorage.removeItem(STORAGE_KEYS.CART);
          }
        } catch (error) {
          console.error('Failed to sync DB cart', error);
        }
      } else {
         // Logged out: wipe active memory cart, but leave whatever is implicitly in localStorage (usually empty).
         // Actually, standard behavior on logout is empty cart.
         setCartItems([]);
         localStorage.removeItem(STORAGE_KEYS.CART);
      }
    };
    
    syncCart();
  }, [isAuthenticated]);

  // Save cart to localStorage whenever it changes IF NOT AUTHENTICATED
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = async (product, selectedSize, quantity = 1) => {
    const { image, ...cleanProduct } = product; // Strip heavy base64
    const itemData = {
      ...cleanProduct,
      productId: cleanProduct.id,
      selectedSize,
      quantity,
    };

    if (isAuthenticated) {
      try {
        const res = await fetch(API_ENDPOINTS.CART, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(itemData)
        });
        if (res.ok) {
          const updatedCart = await res.json();
          setCartItems(updatedCart);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Local fallback logic
      const isWholesale = cleanProduct.isWholesale;
      const matchCriteria = isWholesale 
        ? (i => i.id === cleanProduct.id && i.isWholesale) 
        : (i => i.id === cleanProduct.id && i.selectedSize === selectedSize);
        
      const existing = cartItems.find(matchCriteria);
      if (existing) {
        setCartItems(cartItems.map(item => 
          matchCriteria(item) ? { ...item, quantity: item.quantity + quantity } : item
        ));
      } else {
        setCartItems([...cartItems, itemData]);
      }
    }
  };

  // Match a cart item by productId (handles both authenticated and guest carts)
  const findCartItem = (cartItems, productId, selectedSize) =>
    cartItems.find(item =>
      (item.productId === productId || item.id === productId) &&
      (item.isWholesale || item.selectedSize === selectedSize)
    );

  const removeFromCart = async (productId, selectedSize) => {
    if (isAuthenticated) {
      const targetItem = findCartItem(cartItems, productId, selectedSize);
      if (targetItem?.id) {
        try {
          const res = await fetch(`${API_ENDPOINTS.CART}/${targetItem.id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          if (res.ok) setCartItems(await res.json());
        } catch(e) {}
      }
    } else {
      setCartItems(prev => prev.filter(item =>
        !((item.productId === productId || item.id === productId) &&
          (item.isWholesale || item.selectedSize === selectedSize))
      ));
    }
  };

  const updateQuantity = async (productId, selectedSize, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }

    if (isAuthenticated) {
      const targetItem = findCartItem(cartItems, productId, selectedSize);
      if (targetItem?.id) {
        try {
          const res = await fetch(`${API_ENDPOINTS.CART}/${targetItem.id}/quantity?quantity=${newQuantity}`, {
            method: 'PUT',
            headers: getAuthHeaders()
          });
          if (res.ok) setCartItems(await res.json());
        } catch(e) {}
      }
    } else {
      setCartItems(prev => prev.map(item =>
        (item.productId === productId || item.id === productId) && item.selectedSize === selectedSize
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await fetch(`${API_ENDPOINTS.CART}/clear`, { method: 'DELETE', headers: getAuthHeaders() });
      } catch(e) {}
    }
    setCartItems([]);
  };

  const GST_RATE = 0.05;        // 5%
  const PLATFORM_RATE = 0.02;   // 2%

  // For wholesale: price is per set; 1 set = piecesPerSet pieces (default 4)
  // So item subtotal = wholesalePrice * quantity (sets) — price already covers all sizes in a set
  const getItemPrice = (item) => item.isWholesale ? (item.wholesalePrice || item.specialPrice || item.price || 0) : (item.specialPrice || item.price || 0);
  const getItemOriginalPrice = (item) => item.factoryPrice || item.originalPrice || getItemPrice(item);
  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  // Subtotal: for retail items, price × quantity × number of sizes selected (pieces per set)
  // For wholesale items, price is already per set (covers all sizes), so just price × quantity
  const getItemSubtotal = (item) => {
    const price = getItemPrice(item);
    if (item.isWholesale) {
      return price * item.quantity;
    }
    // Retail: price is per single piece; multiply by number of sizes in the set
    const sizesCount = item.piecesPerSet || (item.sizes?.length) || 4;
    return price * sizesCount * item.quantity;
  };

  const getSubtotal = () => cartItems.reduce((total, item) => total + getItemSubtotal(item), 0);
  const getGST = () => getSubtotal() * GST_RATE;
  const getPlatformCharge = () => getSubtotal() * PLATFORM_RATE;
  const getTotalPrice = () => getSubtotal() + getGST() + getPlatformCharge();

  const getTotalSavings = () => cartItems.reduce((total, item) => {
    const savings = (getItemOriginalPrice(item) - getItemPrice(item)) * item.quantity;
    return total + (savings > 0 ? savings : 0);
  }, 0);

  const openCart = (step = 1) => {
    setCheckoutStep(step);
    setIsCartOpen(true);
  };
  const closeCart = () => setIsCartOpen(false);

  const checkout = async (shippingAddress, paymentMethod = 'COD', phoneOverride = null) => {
    setLoading(true);
    setError(null);
    try {
      const subtotal = getSubtotal();
      const gst = getGST();
      const platformCharge = getPlatformCharge();
      const grandTotal = getTotalPrice();

      const orderItems = cartItems.map(item => ({
        productId: item.productId || item.id,
        productName: item.name,
        productImage: item.imageUrl || item.image,
        quantity: item.quantity,
        unitPrice: getItemPrice(item),
        totalPrice: getItemSubtotal(item),
        selectedSize: item.selectedSize,
        sizesCount: item.isWholesale ? (item.piecesPerSet || 4) : (item.piecesPerSet || item.sizes?.length || 4)
      }));

      // ── Guard: Cashfree requires a real phone number ──────────────────────
      if (paymentMethod === 'CASHFREE') {
        const phone = (phoneOverride || user?.phone || '').replace(/\D/g, '');
        if (!phone || phone.length < 10) {
          throw new Error(
            'Your profile is missing a phone number. Please enter your 10-digit mobile number to pay online.'
          );
        }
      }

      const orderRequest = {
        items: orderItems,
        orderType: cartItems.some(item => item.isWholesale) ? 'WHOLESALE' : 'RETAIL',
        shippingAddress,
        paymentMethod,
        subtotal,
        gstAmount: gst,
        platformCharge,
        totalAmount: grandTotal,
        customerPhone: (phoneOverride || user?.phone || '').replace(/\D/g, '').slice(-10),
        customerEmail: user?.email || '',
        customerName:  user?.name  || '',
      };

      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        let errMsg = 'Failed to create order';
        try {
          const errData = await response.json();
          errMsg = errData.error || errData.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const orderData = await response.json();

      // ── Cashfree online payment flow ──────────────────────────────────────
      if (paymentMethod === 'CASHFREE') {
        const { paymentSessionId, cashfreeOrderId } = orderData;
        if (!paymentSessionId) throw new Error('Payment session could not be created.');

        const cashfree = await loadCashfree({
          mode: import.meta.env.VITE_CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox',
        });

        // Await the modal result — keep loading=true until fully done
        let checkoutResult;
        try {
          checkoutResult = await cashfree.checkout({
            paymentSessionId,
            redirectTarget: '_modal',
          });
        } catch (err) {
          throw new Error(err?.message || 'Payment modal failed to open');
        }

        if (checkoutResult?.error) {
          throw new Error(checkoutResult.error.message || 'Payment cancelled or failed');
        }

        // Verify server-side
        const verifyRes = await fetch(API_ENDPOINTS.VERIFY_PAYMENT, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ cashfreeOrderId })
        });

        if (!verifyRes.ok) {
          const errData = await verifyRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Payment verification failed');
        }

        const verifyData = await verifyRes.json();
        await clearCart();
        return { success: true, order: verifyData.order };
      }

      // ── COD or any other method ───────────────────────────────────────────
      await clearCart();
      return { success: true, order: orderData };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = async (order) => {
    setLoading(true);
    setError(null);
    try {
      const { cashfreeOrderId } = order;
      if (!cashfreeOrderId) throw new Error('No Cashfree order ID found for this order.');

      const sessionRes = await fetch(API_ENDPOINTS.RETRY_SESSION, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cashfreeOrderId })
      });

      if (!sessionRes.ok) throw new Error('Could not retrieve payment session.');
      const { paymentSessionId, cashfreeOrderId: newCfOrderId } = await sessionRes.json();

      const cashfree = await loadCashfree({
        mode: import.meta.env.VITE_CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox',
      });

      let checkoutResult;
      try {
        checkoutResult = await cashfree.checkout({
          paymentSessionId,
          redirectTarget: '_modal',
        });
      } catch (err) {
        throw new Error(err?.message || 'Payment modal failed to open');
      }

      if (checkoutResult?.error) {
        throw new Error(checkoutResult.error.message || 'Payment cancelled or failed');
      }

      // Use the new cashfreeOrderId returned by retrySession (backend may have rotated it)
      const verifyId = newCfOrderId || cashfreeOrderId;
      const verifyRes = await fetch(API_ENDPOINTS.VERIFY_PAYMENT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cashfreeOrderId: verifyId })
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Payment verification failed');
      }

      const verifyData = await verifyRes.json();
      return { success: true, order: verifyData.order };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems, isCartOpen, checkoutStep, setCheckoutStep, loading, error,
    addToCart, removeFromCart, updateQuantity, clearCart, checkout, retryPayment,
    getTotalItems, getTotalPrice, getTotalSavings,
    getSubtotal, getGST, getPlatformCharge, getItemSubtotal,
    openCart, closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
