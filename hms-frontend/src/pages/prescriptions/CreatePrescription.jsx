import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function CreatePrescription() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  const navigate = useNavigate();
  const toast = useToast();

  const [appointment, setAppointment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState([{ medicineId: '', dosage: '', duration: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!appointmentId) {
        toast.error('No appointment specified');
        navigate('/appointments');
        return;
      }
      try {
        const [appt, meds] = await Promise.all([
          api.get(`/appointments/${appointmentId}`),
          api.get('/medicines?limit=100'),
        ]);
        setAppointment(appt);
        setMedicines(meds.data || meds || []);
      } catch (err) {
        toast.error('Failed to load required prescription resources');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appointmentId]);

  const addMedicineRow = () => {
    setPrescribedMeds([...prescribedMeds, { medicineId: '', dosage: '', duration: '', quantity: 1 }]);
  };

  const removeMedicineRow = (index) => {
    setPrescribedMeds(prescribedMeds.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...prescribedMeds];
    updated[index][field] = value;
    setPrescribedMeds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim() || !diagnosis.trim()) {
      toast.error('Symptoms and Diagnosis are required');
      return;
    }

    // Filter out invalid rows
    const finalMeds = prescribedMeds.filter(m => m.medicineId);
    if (finalMeds.length === 0) {
      toast.error('At least one medicine must be prescribed');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/prescriptions', {
        appointmentId,
        symptoms,
        diagnosis,
        medicines: finalMeds,
      });
      toast.success('Prescription created & Appointment completed!');
      navigate('/prescriptions');
    } catch (err) {
      toast.error(err.message || 'Failed to submit prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!appointment) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>
        <h1 className="text-2xl font-bold mt-2">Write Prescription</h1>
        <p className="text-text-secondary text-sm mt-1">Add diagnosis and prescribe medications for {appointment.patientId?.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 text-xs bg-bg-surface-alt border border-border p-4 rounded-xl">
          <div><span className="text-text-muted">Patient:</span> <span className="text-text-primary font-bold ml-1">{appointment.patientId?.name}</span></div>
          <div><span className="text-text-muted">Doctor:</span> <span className="text-text-primary font-bold ml-1">{appointment.doctorId?.name}</span></div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Symptoms *</label>
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            rows={3}
            placeholder="Describe the patient's symptoms..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Diagnosis *</label>
          <textarea
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            rows={3}
            placeholder="Provide clinical diagnosis..."
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Prescribed Medicines</h3>
            <button
              type="button"
              onClick={addMedicineRow}
              className="text-xs text-accent hover:text-accent-hover font-semibold"
            >
              + Add Medicine
            </button>
          </div>

          <div className="space-y-3">
            {prescribedMeds.map((medRow, index) => {
              const selectedMed = medicines.find(m => m._id === medRow.medicineId);
              return (
                <div key={index} className="flex gap-3 flex-wrap md:flex-nowrap items-end bg-bg-surface-alt border border-border p-4 rounded-xl relative">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Medicine *</label>
                    <select
                      value={medRow.medicineId}
                      onChange={e => handleMedChange(index, 'medicineId', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
                      required
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map(m => (
                        <option key={m._id} value={m._id} disabled={!m.isActive || m.stockQty <= 0}>
                          {m.name} (Qty: {m.stockQty})
                        </option>
                      ))}
                    </select>
                    {selectedMed && (
                      <p className="text-[10px] text-text-muted mt-1">
                        Stock: {selectedMed.stockQty} units remaining
                      </p>
                    )}
                  </div>

                  <div className="w-32">
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Dosage *</label>
                    <input
                      type="text"
                      value={medRow.dosage}
                      onChange={e => handleMedChange(index, 'dosage', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
                      placeholder="e.g. 1-0-1 after food"
                      required
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Duration *</label>
                    <input
                      type="text"
                      value={medRow.duration}
                      onChange={e => handleMedChange(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
                      placeholder="e.g. 5 days"
                      required
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Qty *</label>
                    <input
                      type="number"
                      value={medRow.quantity}
                      onChange={e => handleMedChange(index, 'quantity', +e.target.value)}
                      min={1}
                      className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
                      required
                    />
                  </div>

                  {prescribedMeds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicineRow(index)}
                      className="text-danger hover:text-red-400 p-2 text-sm"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl shadow-lg shadow-accent/10 hover:shadow-accent/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <span className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />}
          {submitting ? 'Submitting...' : 'Save & Complete Appointment'}
        </button>
      </form>
    </div>
  );
}
