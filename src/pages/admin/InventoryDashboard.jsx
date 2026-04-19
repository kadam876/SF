import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Package, AlertTriangle, TrendingUp, Plus, Search, X,
  Link2, ImageIcon, Pencil, Trash2, BarChart2, CheckCircle, Sparkles,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import { CLOTH_CATEGORIES } from '../../data/clothCategories';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PLACEHOLDER = 'https://placehold.co/100x100/e5e7eb/6b7280?text=No+image';
const COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899','#6366f1','#14b8a6','#f43f5e','#84cc16'];

const INPUT = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all';
const LABEL = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5';

function mapProduct(p) {
  return { id: p.id, name: p.name || '—', category: p.category || '—', price: p.price ?? 0, stock: p.stockQuantity ?? 0, image: p.imageUrl || PLACEHOLDER };
}

function parseSizes(text) {
  return text.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ title, subtitle, onClose, children, footer }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">{footer}</div>}
    </div>
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, active, onClick, sub }) => (
  <button onClick={onClick}
    className={`bg-white rounded-2xl border p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full ${active ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100'}`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      {active && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />}
    </div>
    <p className="text-2xl font-black text-gray-900 mb-0.5">{value}</p>
    <p className="text-sm font-semibold text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 font-medium mt-0.5">{sub}</p>}
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────
const InventoryDashboard = () => {
  const location = useLocation();

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState(location.state?.filter || 'all');
  const [inventory, setInventory]     = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError]     = useState(null);

  // Add product
  const [showAdd, setShowAdd]         = useState(false);
  const [addCategory, setAddCategory] = useState('');
  const [addSizes, setAddSizes]       = useState('S, M, L, XL, XXL');
  const [imageMode, setImageMode]     = useState('url');
  const [newProduct, setNewProduct]   = useState({ name: '', price: '', stock: '', imageUrl: '', description: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving]           = useState(false);

  // Edit product
  const [showEdit, setShowEdit]       = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm]       = useState({ name: '', price: '', stock: '', description: '', isActive: true, category: '', imageUrl: '', sizes: [] });

  // Distribution modal
  const [showDist, setShowDist]       = useState(false);

  // Success overlay after adding product
  const [addedProduct, setAddedProduct] = useState(null);

  // ── Load inventory ─────────────────────────────────────────────────────────
  const loadInventory = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_INVENTORY, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load inventory');
      const data = await res.json();
      setInventory((Array.isArray(data) ? data : []).map(mapProduct));
    } catch (e) {
      setListError(e.message || 'Could not load products');
      setInventory([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  useEffect(() => {
    if (location.state?.filter) setFilterType(location.state.filter);
    if (location.state?.search) setSearch(location.state.search);
  }, [location.state]);

  // ── Image handlers ─────────────────────────────────────────────────────────
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) { setImagePreview(''); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  const handlePaste = (e, isEdit = false) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const reader = new FileReader();
        reader.onload = ev => {
          const url = ev.target.result;
          if (isEdit) setEditForm(f => ({ ...f, imageUrl: url }));
          else { setImageMode('file'); setImagePreview(url); }
        };
        reader.readAsDataURL(items[i].getAsFile());
        break;
      }
    }
  };

  // ── Add product ────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !addCategory) { alert('Enter a product name and select a category.'); return; }
    const sizes = parseSizes(addSizes);
    if (!sizes.length) { alert('Enter at least one size.'); return; }
    const price = Number(newProduct.price), stock = Number(newProduct.stock);
    if (isNaN(price) || price < 0 || isNaN(stock) || stock < 0) return;
    const imageUrl = (imageMode === 'url' ? newProduct.imageUrl.trim() : imagePreview) || PLACEHOLDER;
    setSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_CREATE_PRODUCT, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ name: newProduct.name.trim(), description: newProduct.description.trim(), category: addCategory, price, wholesalePrice: price, stockQuantity: Math.floor(stock), imageUrl, sizes, ratings: 0, badge: '', badgeColor: '', isActive: true }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setShowAdd(false);
      setNewProduct({ name: '', price: '', stock: '', imageUrl: '', description: '' });
      setAddCategory(''); setAddSizes('S, M, L, XL, XXL'); setImageMode('url'); setImagePreview('');
      await loadInventory();
      // Show success overlay
      setAddedProduct({
        name: newProduct.name.trim(),
        category: addCategory,
        price,
        stock: Math.floor(stock),
        imageUrl,
      });
    } catch { alert('Could not create product. Try again.'); }
    finally { setSaving(false); }
  };

  // ── Edit product ───────────────────────────────────────────────────────────
  const handleEdit = async (item) => {
    try {
      setListLoading(true);
      const res = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(item.id), { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      const p = await res.json();
      setEditingProduct(p);
      setEditForm({ name: p.name || '', price: p.price || '', stock: p.stockQuantity || '', description: p.description || '', isActive: p.isActive ?? true, category: p.category || '', imageUrl: p.imageUrl || '', sizes: p.sizes || [] });
      setShowEdit(true);
    } catch { alert('Could not fetch product details.'); }
    finally { setListLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_UPDATE_PRODUCT(editingProduct.id), {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({ ...editingProduct, name: editForm.name.trim(), price: Number(editForm.price), stockQuantity: Math.floor(Number(editForm.stock)), description: editForm.description.trim(), isActive: editForm.isActive, category: editForm.category, imageUrl: editForm.imageUrl, sizes: editForm.sizes }),
      });
      if (!res.ok) throw new Error();
      setShowEdit(false); setEditingProduct(null);
      await loadInventory();
    } catch { alert('Could not update product. Try again.'); }
    finally { setSaving(false); }
  };

  // ── Delete product ─────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_DELETE_PRODUCT(item.id), { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      setInventory(prev => prev.filter(i => i.id !== item.id));
    } catch { alert('Could not delete product.'); }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalItems    = inventory.length;
  const lowStock      = inventory.filter(i => i.stock < 20).length;
  const totalValue    = inventory.reduce((s, i) => s + i.price * i.stock, 0);

  const filtered = inventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterType === 'all' || (filterType === 'low-stock' && item.stock < 20);
    return matchSearch && matchFilter;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Management</p>
          <h2 className="text-2xl font-black text-gray-900">Inventory</h2>
          {!listLoading && <p className="text-sm text-gray-400 font-medium mt-0.5">{totalItems} products</p>}
        </div>
        <button
          onClick={() => { setShowAdd(true); setImageMode('url'); setImagePreview(''); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Package}       label="Total Products"  value={totalItems}  color="bg-blue-500"    active={filterType === 'all'}        onClick={() => setFilterType('all')} />
        <StatCard icon={AlertTriangle} label="Low Stock"       value={lowStock}    color="bg-red-500"     active={filterType === 'low-stock'}  onClick={() => setFilterType('low-stock')} sub="Below 20 units" />
        <StatCard icon={BarChart2}     label="Inventory Value" value={`₹${totalValue.toLocaleString('en-IN')}`} color="bg-emerald-500" active={false} onClick={() => setShowDist(true)} sub="Click to view breakdown" />
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {[['all', 'All'], ['low-stock', 'Low Stock']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterType(val)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${filterType === val ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {listError && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-red-600 text-sm font-medium">{listError}</p>
          <button onClick={loadInventory} className="text-sm font-bold text-red-600 bg-red-100 px-4 py-2 rounded-xl hover:bg-red-200 transition-colors">Retry</button>
        </div>
      )}

      {/* Product table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {listLoading ? (
          <div className="animate-pulse divide-y divide-gray-50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-16" />
                <div className="h-6 bg-gray-100 rounded-full w-20" />
                <div className="h-8 bg-gray-100 rounded-xl w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-700 mb-1">No products found</p>
            <p className="text-sm text-gray-400">{search ? `No results for "${search}"` : 'Add your first product to get started.'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(item => {
                    const lowStockItem = item.stock < 20;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0 border border-gray-100"
                              onError={e => { e.target.src = PLACEHOLDER; }} />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate max-w-[160px]">{item.name}</p>
                              <p className="text-xs text-gray-400 font-medium truncate max-w-[160px]">ID: {item.id?.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{item.category}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-black text-gray-900">₹{item.price.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${lowStockItem ? 'text-red-600' : 'text-gray-900'}`}>{item.stock}</span>
                            {lowStockItem && (
                              <span className="text-[9px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Low</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${lowStockItem ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                            {lowStockItem ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(item)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(item)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
              <p className="text-xs text-gray-400 font-medium">Showing {filtered.length} of {inventory.length} products</p>
            </div>
          </>
        )}
      </div>

      {/* ── Add Product Modal ── */}
      {showAdd && (
        <Modal title="Add New Product" subtitle="Fill in the details to add a product to your catalogue"
          onClose={() => setShowAdd(false)}
          footer={
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
              <button form="add-form" type="submit" disabled={saving || !addCategory}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : 'Add Product'}
              </button>
            </div>
          }
        >
          <form id="add-form" onSubmit={handleAdd} onPaste={e => handlePaste(e, false)} className="space-y-4">
            <div>
              <label className={LABEL}>Product Name *</label>
              <input type="text" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Cotton Kurti Set" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Category *</label>
              <select required value={addCategory} onChange={e => setAddCategory(e.target.value)} className={INPUT}>
                <option value="">Select a category…</option>
                {CLOTH_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Sizes (comma separated) *</label>
              <input type="text" required value={addSizes} onChange={e => setAddSizes(e.target.value)} placeholder="S, M, L, XL, XXL" className={INPUT} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Price (₹) *</label>
                <input type="number" required min="0" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Stock *</label>
                <input type="number" required min="0" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" className={INPUT} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Image</label>
              <div className="flex bg-gray-100 rounded-xl p-1 mb-3 gap-1">
                {[['url', Link2, 'Image URL'], ['file', ImageIcon, 'Upload']].map(([mode, Icon, label]) => (
                  <button key={mode} type="button" onClick={() => setImageMode(mode)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${imageMode === mode ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
              {imageMode === 'url' ? (
                <input type="url" placeholder="https://example.com/image.jpg" value={newProduct.imageUrl} onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })} className={INPUT} />
              ) : (
                <div className="space-y-2">
                  <input type="file" accept="image/*" onChange={handleImageFile}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-bold file:text-xs hover:file:bg-emerald-700 transition-all" />
                  <p className="text-xs text-blue-500 font-medium">💡 You can also paste (Ctrl+V) an image directly</p>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-gray-200 shadow-sm" />}
                </div>
              )}
            </div>
            <div>
              <label className={LABEL}>Description</label>
              <textarea rows={3} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Optional product description…" className={`${INPUT} resize-none`} />
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit Product Modal ── */}
      {showEdit && (
        <Modal title="Edit Product" subtitle={editingProduct?.name}
          onClose={() => { setShowEdit(false); setEditingProduct(null); }}
          footer={
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowEdit(false); setEditingProduct(null); }} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
              <button form="edit-form" type="submit" disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          }
        >
          <form id="edit-form" onSubmit={handleUpdate} onPaste={e => handlePaste(e, true)} className="space-y-4">
            {/* Active toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-bold text-gray-900">Active Status</p>
                <p className="text-xs text-gray-400 font-medium">{editForm.isActive ? 'Visible in store' : 'Hidden from store'}</p>
              </div>
              <button type="button" onClick={() => setEditForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${editForm.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className={LABEL}>Product Name *</label>
              <input type="text" required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={INPUT} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Price (₹) *</label>
                <input type="number" required min="0" step="0.01" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Stock *</label>
                <input type="number" required min="0" value={editForm.stock} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} className={INPUT} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Product Image</label>
              <div className="flex gap-3 items-start">
                <input type="text" placeholder="Image URL or paste image (Ctrl+V)" value={editForm.imageUrl} onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))} className={`${INPUT} flex-1`} />
                {editForm.imageUrl && (
                  <img src={editForm.imageUrl} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                    onError={e => { e.target.src = PLACEHOLDER; }} />
                )}
              </div>
              <p className="text-xs text-blue-500 font-medium mt-1.5">💡 Press Ctrl+V anywhere in this form to paste an image</p>
            </div>
            <div>
              <label className={LABEL}>Description</label>
              <textarea rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className={`${INPUT} resize-none`} />
            </div>
          </form>
        </Modal>
      )}

      {/* ── Value Distribution Modal ── */}
      {showDist && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDist(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Inventory Value Distribution</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Stock value breakdown across all products</p>
              </div>
              <button onClick={() => setShowDist(false)} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventory.map(i => ({ name: i.name, value: i.price * i.stock })).filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 10)}
                        cx="50%" cy="50%" outerRadius={100} dataKey="value" labelLine={false}
                      >
                        {inventory.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Top 5 by Value</p>
                  {inventory.map(i => ({ name: i.name, value: i.price * i.stock, stock: i.stock }))
                    .filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 5)
                    .map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background: COLORS[idx] }}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{p.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{p.stock} units</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-gray-900 flex-shrink-0">₹{p.value.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowDist(false)} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Product Added Success Overlay ── */}
      {addedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setAddedProduct(null)}>
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Green header */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-10 text-white text-center relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center ring-4 ring-white/30">
                  {addedProduct.imageUrl && addedProduct.imageUrl !== PLACEHOLDER ? (
                    <img src={addedProduct.imageUrl} alt={addedProduct.name}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <Package size={36} className="text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle size={18} className="text-emerald-600" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-1">Product Added! 🎉</h2>
              <p className="text-emerald-100 text-sm font-medium">Successfully added to your catalogue</p>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Product</span>
                  <span className="font-black text-gray-900 text-right max-w-[180px] truncate">{addedProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Category</span>
                  <span className="font-bold text-gray-700">{addedProduct.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Price</span>
                  <span className="font-black text-emerald-600">₹{addedProduct.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Stock</span>
                  <span className="font-bold text-gray-700">{addedProduct.stock} units</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setAddedProduct(null); setShowAdd(true); setImageMode('url'); setImagePreview(''); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Add Another
                </button>
                <button
                  onClick={() => setAddedProduct(null)}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default InventoryDashboard;
