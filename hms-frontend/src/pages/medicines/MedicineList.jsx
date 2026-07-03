import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

export default function MedicineList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search);

  useEffect(() => { setPage(1); }, [debouncedSearch, lowStock]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 10 });
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (lowStock) params.append('lowStock', 'true');
        const data = await api.get(`/medicines?${params}`);
        setMedicines(data.data || []);
        setTotal(data.total || 0);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [page, debouncedSearch, lowStock]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Medicines & Pharmacy</h1>
          <p className="text-text-secondary text-sm mt-1">{total} catalogued items</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={e => setLowStock(e.target.checked)}
              className="accent-accent"
            />
            Low Stock Only (&lt;10)
          </label>
          
          <input
            type="text"
            placeholder="Search medicine name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent w-56"
          />

          {role === 'admin' && (
            <button
              onClick={() => navigate('/medicines/add')}
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl text-sm shadow-lg shadow-accent/10"
            >
              + Add Medicine
            </button>
          )}
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface-alt">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Stock Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-bg-surface-hover rounded animate-pulse" style={{ width: '70%' }} /></td>
                    ))}
                  </tr>
                ))
              ) : medicines.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-text-muted">No medicines found</td></tr>
              ) : (
                medicines.map(m => (
                  <tr
                    key={m._id}
                    className={`border-b border-border hover:bg-bg-surface-hover cursor-pointer transition-colors ${role === 'admin' ? '' : 'pointer-events-none'}`}
                    onClick={() => role === 'admin' && navigate(`/medicines/${m._id}`)}
                  >
                    <td className="px-6 py-3 font-medium">{m.name}</td>
                    <td className="px-6 py-3 text-text-secondary">{formatCurrency(m.unitPrice)}</td>
                    <td className="px-6 py-3 font-mono">
                      <span className={`font-semibold ${m.stockQty < 10 ? 'text-danger' : 'text-text-primary'}`}>
                        {m.stockQty} {m.stockQty < 10 && '⚠️'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-text-secondary">{formatDate(m.expiryDate)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.isActive ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                        {m.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 10 && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-muted">Page {page} of {Math.ceil(total / 10)}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm rounded-lg bg-bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)} className="px-3 py-1.5 text-sm rounded-lg bg-bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
