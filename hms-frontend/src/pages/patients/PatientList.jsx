import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { formatDate } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search);
  const navigate = useNavigate();

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ role: 'patient', page, limit: 10 });
        if (debouncedSearch) params.append('search', debouncedSearch);
        const data = await api.get(`/users?${params}`);
        setPatients(data.data || []);
        setTotal(data.total || 0);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [page, debouncedSearch]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-text-secondary text-sm mt-1">{total} total patients</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent w-72"
        />
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface-alt">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">DOB</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-bg-surface-hover rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-text-muted">No patients found</td></tr>
              ) : (
                patients.map(p => (
                  <tr key={p._id} className="border-b border-border hover:bg-bg-surface-hover cursor-pointer transition-colors" onClick={() => navigate(`/patients/${p._id}`)}>
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-text-secondary">{p.email}</td>
                    <td className="px-6 py-3 text-text-secondary">{p.phone || '—'}</td>
                    <td className="px-6 py-3 text-text-secondary">{formatDate(p.dob)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
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
