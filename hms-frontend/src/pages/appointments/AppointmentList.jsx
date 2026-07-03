import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

export default function AppointmentList() {
  const { role } = useAuth();
  const [appointments, setAppointments] = useState([]);
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
        if (statusFilter) params.append('status', statusFilter);
        const data = await api.get(`/appointments?${params}`);
        setAppointments(data.data || []);
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
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-text-secondary text-sm mt-1">{total} total bookings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {role !== 'doctor' && (
            <button
              onClick={() => navigate('/appointments/book')}
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl text-sm shadow-lg shadow-accent/10"
            >
              + Book Appointment
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Time Slot</th>
                {role !== 'patient' && <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Patient</th>}
                {role !== 'doctor' && <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">Doctor</th>}
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
              ) : appointments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-text-muted">No appointments found</td></tr>
              ) : (
                appointments.map(a => (
                  <tr key={a._id} className="border-b border-border hover:bg-bg-surface-hover cursor-pointer transition-colors" onClick={() => navigate(`/appointments/${a._id}`)}>
                    <td className="px-6 py-3 font-medium">{formatDate(a.date)}</td>
                    <td className="px-6 py-3 font-mono text-text-secondary">{a.timeSlot}</td>
                    {role !== 'patient' && <td className="px-6 py-3">{a.patientId?.name || '—'}</td>}
                    {role !== 'doctor' && <td className="px-6 py-3">{a.doctorId?.name || '—'}</td>}
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[a.status] || ''}`}>
                        {a.status}
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
