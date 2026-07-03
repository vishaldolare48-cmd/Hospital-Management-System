import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { formatCurrency } from '../../utils/formatters';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.get('/users/doctors');
        // If nested data array, extract it
        setDoctors(data.data || data || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Doctors</h1>
        <p className="text-text-secondary text-sm mt-1">Our medical practitioners</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-bg-surface border border-border rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-bg-surface-hover" />
              <div className="h-6 bg-bg-surface-hover rounded w-3/4" />
              <div className="h-4 bg-bg-surface-hover rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <p className="text-text-muted text-center py-12">No doctors available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(d => (
            <div key={d._id} className="bg-bg-surface border border-border rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-lg font-bold text-text-inverse">
                    🩺
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-lg">{d.name}</h3>
                    <p className="text-accent text-xs font-semibold">{d.specialization || 'General Physician'}</p>
                  </div>
                </div>
                
                <div className="text-sm space-y-1.5 text-text-secondary">
                  <p>📧 {d.email}</p>
                  <p>📞 {d.phone || '—'}</p>
                  <p>💰 Fee: {formatCurrency(d.consultationFee)}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-text-muted">Working Hours</span>
                <span className="text-xs font-mono text-text-secondary font-medium">
                  {d.workingHours?.length || 0} slots
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
