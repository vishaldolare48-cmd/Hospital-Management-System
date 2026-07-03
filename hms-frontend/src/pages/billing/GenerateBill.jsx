import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { formatDate } from '../../utils/formatters';

export default function GenerateBill() {
  const navigate = useNavigate();
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [customLineItems, setCustomLineItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Custom line item dynamic additions
  const [customDesc, setCustomDesc] = useState('');
  const [customAmt, setCustomAmt] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/appointments?status=Completed&limit=100');
        setAppointments(res.data || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  const addCustomItem = () => {
    if (!customDesc.trim() || !customAmt) {
      toast.error('Enter a valid description and charge amount');
      return;
    }
    setCustomLineItems([...customLineItems, { description: customDesc, amount: parseFloat(customAmt) }]);
    setCustomDesc('');
    setCustomAmt('');
  };

  const removeCustomItem = (idx) => {
    setCustomLineItems(customLineItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) {
      toast.error('Select an appointment to bill');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/billing', {
        appointmentId: selectedAppointment,
        taxRate: parseFloat(taxRate) || 0,
        discount: parseFloat(discount) || 0,
        customLineItems,
      });
      toast.success('Bill generated successfully!');
      navigate('/billing');
    } catch (err) {
      toast.error(err.message || 'Failed to generate bill');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>
        <h1 className="text-2xl font-bold mt-2">Generate Bill</h1>
        <p className="text-text-secondary text-sm mt-1">Create invoice for a completed appointment</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-surface border border-border rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Select Completed Appointment *</label>
          <select
            value={selectedAppointment}
            onChange={e => setSelectedAppointment(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            required
          >
            <option value="">Choose Appointment</option>
            {appointments.map(a => (
              <option key={a._id} value={a._id}>
                {a.patientId?.name} with {a.doctorId?.name} ({formatDate(a.date)})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={e => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
              min={0}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Discount (₹)</label>
            <input
              type="number"
              value={discount}
              onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              min={0}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <h3 className="text-sm font-bold text-text-primary">Additional Charges (e.g. Lab Tests)</h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Description"
              value={customDesc}
              onChange={e => setCustomDesc(e.target.value)}
              className="flex-1 px-3 py-2 bg-bg-input border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              placeholder="Amount (₹)"
              value={customAmt}
              onChange={e => setCustomAmt(e.target.value)}
              className="w-24 px-3 py-2 bg-bg-input border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={addCustomItem}
              className="px-3 py-2 bg-bg-surface-hover text-accent font-semibold border border-border rounded-xl text-xs hover:bg-border transition-colors"
            >
              Add
            </button>
          </div>

          {customLineItems.length > 0 && (
            <div className="space-y-1">
              {customLineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs bg-bg-surface-alt border border-border/40 p-2 rounded-lg">
                  <span>{item.description}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">₹{item.amount}</span>
                    <button type="button" onClick={() => removeCustomItem(idx)} className="text-danger">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl shadow-lg shadow-accent/10 hover:shadow-accent/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <span className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />}
          {submitting ? 'Generating...' : 'Generate Invoice'}
        </button>
      </form>
    </div>
  );
}
