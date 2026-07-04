import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

export default function BillDetail() {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/billing/${id}`);
        setBill(data);
        // default remaining amount
        setPaymentAmount((data.total - data.paidAmount).toString());
      } catch {
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleRecordPayment = async () => {
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid positive number');
      return;
    }
    setPayLoading(true);
    try {
      await api.patch(`/billing/${id}/payment`, { amountPaid: amt });
      toast.success('Payment recorded successfully');
      setShowPayModal(false);
      // reload
      const data = await api.get(`/billing/${id}`);
      setBill(data);
    } catch (err) {
      toast.error(err.message || 'Payment recording failed');
    } finally {
      setPayLoading(false);
    }
  };

  const handleCancelBill = async () => {
    if (!confirm('Cancel this invoice? (Refunds will be auto-processed if paid)')) return;
    try {
      await api.patch(`/billing/${id}/cancel`);
      toast.success('Bill status modified successfully');
      const data = await api.get(`/billing/${id}`);
      setBill(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!bill) return <p className="text-text-muted text-center py-20">Invoice not found</p>;

  const remainingBalance = bill.total - bill.paidAmount;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>

      <div className="bg-bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-bold">Tax Invoice</h1>
            <p className="text-text-secondary text-xs mt-1">Invoice ID: #{bill._id.slice(-6).toUpperCase()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[bill.paymentStatus] || ''}`}>
            {bill.paymentStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div><span className="text-text-muted">Issued to:</span> <p className="text-text-primary font-bold mt-0.5">{bill.patientId?.name}</p></div>
          <div><span className="text-text-muted">Issued Date:</span> <p className="text-text-primary font-bold mt-0.5">{formatDate(bill.createdAt)}</p></div>
        </div>

        {/* Line Items Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-bg-surface-alt">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-surface/50">
              <tr>
                <th className="px-4 py-2 text-text-secondary">Line Item Description</th>
                <th className="px-4 py-2 text-right text-text-secondary">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.lineItems.map((item, idx) => (
                <tr key={idx} className="border-t border-border/40">
                  <td className="px-4 py-3 text-text-primary">{item.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-text-primary">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="bg-bg-surface-alt border border-border rounded-xl p-4 text-xs space-y-2 max-w-sm ml-auto">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal:</span>
            <span className="text-text-primary">{formatCurrency(bill.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Tax Rate ({bill.taxRate}%):</span>
            <span className="text-text-primary">+{formatCurrency((bill.subtotal * bill.taxRate) / 100)}</span>
          </div>
          <div className="flex justify-between text-danger">
            <span>Discount Applied:</span>
            <span>-{formatCurrency(bill.discount)}</span>
          </div>
          <div className="flex justify-between border-t border-border/40 pt-2 text-sm font-bold">
            <span className="text-text-primary">Total:</span>
            <span className="text-accent">{formatCurrency(bill.total)}</span>
          </div>
          <div className="flex justify-between text-success">
            <span>Amount Paid:</span>
            <span>{formatCurrency(bill.paidAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-border/40 pt-2 font-bold text-accent-secondary">
            <span>Remaining Due:</span>
            <span>{formatCurrency(remainingBalance)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          {role !== 'patient' && bill.paymentStatus !== 'Cancelled' && bill.paymentStatus !== 'Refunded' && (
            <>
              {role === 'admin' && (
                <button
                  onClick={handleCancelBill}
                  className="px-4 py-2 bg-danger text-white rounded-xl text-xs font-semibold hover:bg-danger/80 transition-colors"
                >
                  {bill.paidAmount > 0 ? 'Refund & Cancel' : 'Cancel Bill'}
                </button>
              )}

              {remainingBalance > 0 && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-5 py-2 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl text-xs shadow-lg ml-auto"
                >
                  Record Payment
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scale-in">
            <h3 className="text-md font-bold text-text-primary">Record Payment</h3>
            <p className="text-text-secondary text-xs">Enter amount received (Max due: {formatCurrency(remainingBalance)}):</p>
            <input
              type="number"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              className="w-full px-4 py-2 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
              placeholder="Amount (₹)"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPayModal(false)}
                className="px-3 py-1.5 bg-bg-surface-hover text-text-secondary rounded-xl hover:text-text-primary transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={payLoading}
                className="px-4 py-1.5 bg-accent text-text-inverse font-semibold rounded-xl hover:bg-accent-hover transition-colors text-xs flex items-center gap-2"
              >
                {payLoading && <span className="w-3 h-3 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />}
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
