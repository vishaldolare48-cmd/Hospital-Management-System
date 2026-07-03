import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { formatDate } from '../../utils/formatters';

export default function PrescriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [prescription, setPrescription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/prescriptions/${id}`);
        setPrescription(data);

        // Fetch audit history
        const audit = await api.get(`/prescriptions/appointment/${data.appointmentId._id || data.appointmentId}/history`);
        setHistory(audit || []);
      } catch {
        toast.error('Failed to load prescription details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!prescription) return <p className="text-text-muted text-center py-20">Prescription not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>

      <div className="bg-bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-bold">Medical Prescription</h1>
            <p className="text-text-secondary text-xs mt-1">Generated: {formatDate(prescription.createdAt)}</p>
          </div>
          <span className="px-3 py-1 rounded bg-bg-surface-hover text-xs font-semibold text-accent border border-accent/20">
            Version {prescription.version} (Active)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div><span className="text-text-muted">Patient:</span> <span className="text-text-primary font-bold ml-1">{prescription.patientId?.name}</span></div>
          <div><span className="text-text-muted">Doctor:</span> <span className="text-text-primary font-bold ml-1">{prescription.doctorId?.name} ({prescription.doctorId?.specialization})</span></div>
        </div>

        <div className="space-y-4">
          <div className="bg-bg-surface-alt border border-border rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-accent">Patient Symptoms</h3>
            <p className="text-sm text-text-primary">{prescription.symptoms}</p>
          </div>

          <div className="bg-bg-surface-alt border border-border rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-accent-secondary">Clinical Diagnosis</h3>
            <p className="text-sm text-text-primary">{prescription.diagnosis}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-text-primary">Prescribed Medicines</h3>
          <div className="border border-border rounded-xl overflow-hidden bg-bg-surface-alt">
            <table className="w-full text-xs text-left">
              <thead className="bg-bg-surface/50">
                <tr>
                  <th className="px-4 py-2 text-text-secondary">Medicine Name</th>
                  <th className="px-4 py-2 text-text-secondary">Dosage</th>
                  <th className="px-4 py-2 text-text-secondary">Duration</th>
                  <th className="px-4 py-2 text-text-secondary">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines.map((m, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-4 py-3 font-medium text-text-primary">{m.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{m.dosage}</td>
                    <td className="px-4 py-3 text-text-secondary">{m.duration}</td>
                    <td className="px-4 py-3 text-text-secondary">{m.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail versions */}
        {history.length > 1 && (
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-text-primary mb-3">Prescription Version History (Audit Trail)</h3>
            <div className="space-y-2">
              {history.map(v => (
                <div key={v._id} className="flex items-center justify-between text-xs p-3 bg-bg-surface-alt border border-border/60 rounded-xl">
                  <span className="text-text-primary">Version {v.version} {v.isActive && <span className="text-[10px] text-accent ml-2 font-bold">(Active)</span>}</span>
                  <span className="text-text-muted">{formatDate(v.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
