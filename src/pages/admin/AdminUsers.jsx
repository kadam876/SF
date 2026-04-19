import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Search, UserCheck, UserMinus, ExternalLink } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_USERS, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      setUsers(await res.json());
      setError(null);
    } catch {
      setError('Could not load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) ||
           (u.email || '').toLowerCase().includes(q) ||
           String(u.phone || '').includes(search);
  });

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Management</p>
          <h2 className="text-2xl font-black text-gray-900">Customers</h2>
          {!loading && !error && (
            <p className="text-sm text-gray-400 font-medium mt-0.5">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-72 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-100 rounded-full w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between">
          <p className="text-red-600 font-medium text-sm">{error}</p>
          <button onClick={fetchUsers} className="text-sm font-bold text-red-600 bg-red-100 px-4 py-2 rounded-xl hover:bg-red-200 transition-colors">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No customers found</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            {search ? `No results for "${search}"` : 'Customers who register will appear here.'}
          </p>
          {!search && (
            <div className="mt-6 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
              <p className="text-emerald-700 text-xs font-bold">Your Store ID:</p>
              <code className="text-emerald-600 font-black text-sm select-all">{currentUser?.id || '…'}</code>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Orders</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => {
                  const name    = u.name || u.email || 'Customer';
                  const active  = u.active !== false;
                  const idShort = typeof u.id === 'string' && u.id.length > 8 ? `${u.id.slice(0, 8)}…` : u.id || '—';
                  return (
                    <tr key={u.id || u.email} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-base flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                            {name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{name}</p>
                            <p className="text-xs text-gray-400 font-medium">ID: {idShort}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={13} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone size={13} className="text-gray-400 flex-shrink-0" />
                            {u.phone || <span className="text-gray-300 italic">No phone</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{u.orderCount != null ? Number(u.orderCount) : 0}</span>
                        <span className="text-xs text-gray-400 ml-1">orders</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                          {active ? <UserCheck size={11} /> : <UserMinus size={11} />}
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                          <ExternalLink size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50">
            <p className="text-xs text-gray-400 font-medium">Showing {filtered.length} of {users.length} customers</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
