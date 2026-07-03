import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

export default function BillingList() {
  const { role } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 10 });
        if (statusFilter) params.append('paymentStatus', statusFilter);
        const data = await api.get(`/billing?${params}`);
        setBills(data.data || []);
        setTotal(data.total || 0);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Billing & Payments</h1>
          <p className="text-text-secondary text-sm mt-1">{total} generated invoices</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
            <option value="Refunded">Refunded</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {role !== 'patient' && (
            <button
              onClick={() => navigate('/billing/generate')}
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl text-sm shadow-lg shadow-accent/10"
            >
              + Generate Bill
            </button>
          )}
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface-alt">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Paid Amount</th>
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
              ) : bills.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-text-muted">No invoices found</td></tr>
              ) : (
                bills.map(b => (
                  <tr key={b._id} className="border-b border-border hover:bg-bg-surface-hover cursor-pointer transition-colors" onClick={() => navigate(`/billing/${b._id}`)}>
                    <td className="px-6 py-3 font-medium">{formatDate(b.createdAt)}</td>
                    <td className="px-6 py-3">{b.patientId?.name || '—'}</td>
                    <td className="px-6 py-3 font-semibold text-text-primary">{formatCurrency(b.total)}</td>
                    <td className="px-6 py-3 text-text-secondary">{formatCurrency(b.paidAmount)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[b.paymentStatus] || ''}`}>
                        {b.paymentStatus}
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
