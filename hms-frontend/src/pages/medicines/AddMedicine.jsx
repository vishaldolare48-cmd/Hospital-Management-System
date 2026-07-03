import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function AddMedicine() {
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !unitPrice || !stockQty || !expiryDate) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/medicines', {
        name,
        unitPrice: parseFloat(unitPrice),
        stockQty: parseInt(stockQty),
        expiryDate: new Date(expiryDate).toISOString(),
      });
      toast.success('Medicine catalogued successfully');
      navigate('/medicines');
    } catch (err) {
      toast.error(err.message || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>
        <h1 className="text-2xl font-bold mt-2">Add Medicine</h1>
        <p className="text-text-secondary text-sm mt-1">Add a new pharmaceutical item to pharmacy stock</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-surface border border-border rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Medicine Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            placeholder="e.g. Paracetamol 500mg"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Unit Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={e => setUnitPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
              placeholder="e.g. 5.50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Initial Stock Quantity *</label>
            <input
              type="number"
              value={stockQty}
              onChange={e => setStockQty(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
              placeholder="e.g. 100"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Expiry Date *</label>
          <input
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl shadow-lg shadow-accent/10 hover:shadow-accent/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Adding...' : 'Add Stock Item'}
        </button>
      </form>
    </div>
  );
}
