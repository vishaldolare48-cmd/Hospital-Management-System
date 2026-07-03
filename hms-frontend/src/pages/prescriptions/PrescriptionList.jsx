import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { formatDate } from '../../utils/formatters';

export default function PrescriptionList() {
  const { role } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.get(`/prescriptions?page=${page}&limit=10`);
        setPrescriptions(data.data || []);
        setTotal(data.total || 0);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-text-secondary text-sm mt-1">{total} active prescriptions</p>
        </div>
        
        {role === 'doctor' && (
          <button
            onClick={() => navigate('/appointments')}
            className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl text-sm shadow-lg shadow-accent/10"
          >
            + Create Prescription
          </button>
        )}
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface-alt">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Date</th>
                {role !== 'patient' && <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Patient</th>}
                {role !== 'doctor' && <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Doctor</th>}
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Diagnosis</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Version</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-bg-surface-hover rounded animate-pulse" style={{ width: '75%' }} /></td>
                    ))}
                  </tr>
                ))
              ) : prescriptions.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-text-muted">No prescriptions found</td></tr>
              ) : (
                prescriptions.map(p => (
                  <tr key={p._id} className="border-b border-border hover:bg-bg-surface-hover cursor-pointer transition-colors" onClick={() => navigate(`/prescriptions/${p._id}`)}>
                    <td className="px-6 py-3 font-medium">{formatDate(p.createdAt)}</td>
                    {role !== 'patient' && <td className="px-6 py-3">{p.patientId?.name || '—'}</td>}
                    {role !== 'doctor' && <td className="px-6 py-3">{p.doctorId?.name || '—'}</td>}
                    <td className="px-6 py-3 text-text-secondary truncate max-w-xs">{p.diagnosis}</td>
                    <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-bg-surface-hover text-xs">v{p.version}</span></td>
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
