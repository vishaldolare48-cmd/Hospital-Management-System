import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { formatDate } from '../../utils/formatters';

export default function PatientDetail() {
  const { id } = useParams();
  const { role } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`).then(data => { setPatient(data); setForm({ name: data.name, phone: data.phone || '' }); }).catch(() => toast.error('Failed to load patient')).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const updated = await api.patch(`/users/${id}`, form);
      setPatient(updated);
      setEditing(false);
      toast.success('Patient updated');
    } catch (err) { toast.error(err.message); }
  };

  const handleDeactivate = async () => {
    if (!confirm('Deactivate this patient?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Patient deactivated');
      navigate('/patients');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!patient) return <p className="text-text-muted text-center py-20">Patient not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>

      <div className="bg-bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-xl font-bold text-text-inverse">
              {patient.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              {editing ? (
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="text-xl font-bold bg-bg-input border border-border rounded-lg px-3 py-1 text-text-primary" />
              ) : (
                <h1 className="text-xl font-bold">{patient.name}</h1>
              )}
              <p className="text-text-secondary text-sm">{patient.email}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.isActive ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
            {patient.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-text-muted">Phone</label>
            {editing ? (
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 bg-bg-input border border-border rounded-lg px-3 py-2 text-text-primary" />
            ) : (
              <p className="text-text-primary mt-1">{patient.phone || '—'}</p>
            )}
          </div>
          <div>
            <label className="text-text-muted">Date of Birth</label>
            <p className="text-text-primary mt-1">{formatDate(patient.dob)}</p>
          </div>
        </div>

        {patient.emergencyContact && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Emergency Contact</h3>
            <div className="bg-bg-surface-alt rounded-xl p-4 text-sm grid grid-cols-3 gap-4">
              <div><span className="text-text-muted">Name:</span> <span className="text-text-primary ml-1">{patient.emergencyContact.name}</span></div>
              <div><span className="text-text-muted">Phone:</span> <span className="text-text-primary ml-1">{patient.emergencyContact.phone}</span></div>
              <div><span className="text-text-muted">Relation:</span> <span className="text-text-primary ml-1">{patient.emergencyContact.relation}</span></div>
            </div>
          </div>
        )}

        {patient.medicalHistory?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Medical History</h3>
            <div className="flex flex-wrap gap-2">
              {patient.medicalHistory.map((h, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-warning-light text-warning text-xs font-medium">{h}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {role === 'admin' && (
          <div className="flex gap-3 pt-4 border-t border-border">
            {editing ? (
              <>
                <button onClick={handleSave} className="px-5 py-2 bg-accent text-text-inverse font-semibold rounded-xl hover:bg-accent-hover transition-colors">Save</button>
                <button onClick={() => setEditing(false)} className="px-5 py-2 bg-bg-surface-hover text-text-secondary rounded-xl hover:text-text-primary transition-colors">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="px-5 py-2 bg-bg-surface-hover text-text-primary rounded-xl hover:bg-border transition-colors">Edit</button>
                {patient.isActive && <button onClick={handleDeactivate} className="px-5 py-2 bg-danger text-white rounded-xl hover:bg-danger/80 transition-colors">Deactivate</button>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
