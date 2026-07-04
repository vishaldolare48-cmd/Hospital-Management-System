import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function MedicineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', unitPrice: '', expiryDate: '' });
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Stock Adjustment
  const [qtyChange, setQtyChange] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/medicines/${id}`);
        setMedicine(data);
        setForm({
          name: data.name,
          unitPrice: data.unitPrice.toString(),
          expiryDate: data.expiryDate ? data.expiryDate.split('T')[0] : '',
        });
      } catch {
        toast.error('Failed to load medicine stock record');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const payload = {
        name: form.name,
        unitPrice: parseFloat(form.unitPrice),
        expiryDate: new Date(form.expiryDate).toISOString(),
      };
      const data = await api.patch(`/medicines/${id}`, payload);
      setMedicine(data);
      setEditing(false);
      toast.success('Medicine catalog record updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update record');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    const qty = parseInt(qtyChange);
    if (isNaN(qty) || qty === 0) {
      toast.error('Enter a valid non-zero integer');
      return;
    }
    setAdjustLoading(true);
    try {
      const data = await api.patch(`/medicines/${id}/adjust-stock`, { qtyChange: qty });
      setMedicine(data);
      setShowAdjustModal(false);
      setQtyChange('');
      toast.success('Stock adjusted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Soft-delete / Deactivate this medicine from prescription system?')) return;
    try {
      await api.delete(`/medicines/${id}`);
      toast.success('Medicine catalog record deactivated');
      navigate('/medicines');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!medicine) return <p className="text-text-muted text-center py-20">Medicine not found</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>

      <div className="bg-bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-bold">{medicine.name}</h1>
            <p className="text-text-secondary text-xs mt-1">Stock ID: #{medicine._id}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${medicine.isActive ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
            {medicine.isActive ? 'Active' : 'Deactivated'}
          </span>
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Unit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={e => setForm({ ...form, unitPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-4 py-2 bg-accent text-text-inverse font-semibold rounded-xl text-xs"
              >
                Save Updates
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-bg-surface-hover text-text-secondary rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="bg-bg-surface-alt border border-border rounded-xl p-4">
              <span className="text-text-muted">Unit Price</span>
              <p className="text-lg font-bold text-text-primary mt-1">{formatCurrency(medicine.unitPrice)}</p>
            </div>
            <div className="bg-bg-surface-alt border border-border rounded-xl p-4">
              <span className="text-text-muted">Stock Quantity</span>
              <p className={`text-lg font-bold mt-1 ${medicine.stockQty < 10 ? 'text-danger' : 'text-text-primary'}`}>
                {medicine.stockQty} units {medicine.stockQty < 10 && '⚠️'}
              </p>
            </div>
            <div className="col-span-1 sm:col-span-2 bg-bg-surface-alt border border-border rounded-xl p-4">
              <span className="text-text-muted">Expiry Date</span>
              <p className="text-sm font-semibold text-text-primary mt-1">{formatDate(medicine.expiryDate)}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-bg-surface-hover text-text-primary rounded-xl text-xs hover:bg-border transition-colors"
              >
                Edit Details
              </button>
              {medicine.isActive && (
                <button
                  onClick={handleDeactivate}
                  className="px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-xl text-xs hover:bg-danger/25 transition-colors"
                >
                  Deactivate Stock
                </button>
              )}
              <button
                onClick={() => setShowAdjustModal(true)}
                className="px-5 py-2 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl text-xs ml-auto shadow-lg"
              >
                Adjust Stock Qty
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stock Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scale-in">
            <h3 className="text-md font-bold text-text-primary">Adjust Pharmacy Inventory</h3>
            <p className="text-text-secondary text-xs">Enter value to add (positive) or deduct (negative):</p>
            <input
              type="number"
              value={qtyChange}
              onChange={e => setQtyChange(e.target.value)}
              className="w-full px-4 py-2 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
              placeholder="e.g. 50 or -20"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-3 py-1.5 bg-bg-surface-hover text-text-secondary rounded-xl hover:text-text-primary transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={adjustLoading}
                className="px-4 py-1.5 bg-accent text-text-inverse font-semibold rounded-xl hover:bg-accent-hover transition-colors text-xs flex items-center gap-2"
              >
                {adjustLoading && <span className="w-3 h-3 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />}
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
