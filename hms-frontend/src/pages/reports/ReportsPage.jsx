import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { formatCurrency } from '../../utils/formatters';

export default function ReportsPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await api.get(`/reports/summary?${params}`);
      setData(res);
    } catch (err) {
      toast.error(err.message || 'Failed to load report summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const exportCSV = () => {
    if (!data || !data.doctorEarningsBreakdown) return;
    const headers = ['Doctor Name,Specialization,Appointments,Billed Amount,Earnings\n'];
    const rows = data.doctorEarningsBreakdown.map(d => 
      `"${d.doctorName}","${d.specialization}",${d.appointmentsCount},${d.billed},${d.earnings}\n`
    );
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `hms-doctor-earnings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report downloaded successfully');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-text-secondary text-sm mt-1">Earnings breakdown and statistics overview</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 bg-bg-input border border-border rounded-xl text-xs text-text-primary focus:outline-none"
          />
          <span className="text-text-muted text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 bg-bg-input border border-border rounded-xl text-xs text-text-primary focus:outline-none"
          />
          <button
            onClick={loadReports}
            className="px-4 py-2 bg-bg-surface-hover text-accent font-semibold border border-border rounded-xl text-xs hover:bg-border transition-colors"
          >
            Apply
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl text-xs shadow-lg shadow-accent/10"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border rounded-2xl p-5">
          <span className="text-xs text-text-secondary block mb-1">Total Patients</span>
          <p className="text-xl font-bold text-text-primary">{data.overview.totalPatients}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-2xl p-5">
          <span className="text-xs text-text-secondary block mb-1">Total Appointments</span>
          <p className="text-xl font-bold text-text-primary">{data.overview.totalAppointments}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-2xl p-5">
          <span className="text-xs text-text-secondary block mb-1">Total Hospital Earnings</span>
          <p className="text-xl font-bold text-success">{formatCurrency(data.overview.totalEarnings)}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded-2xl p-5">
          <span className="text-xs text-text-secondary block mb-1">Pending Invoices Balance</span>
          <p className="text-xl font-bold text-warning">{formatCurrency(data.overview.pendingPayments)}</p>
        </div>
      </div>

      {/* Doctor breakdown table */}
      <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Per-Doctor Revenue Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-surface-alt">
              <tr>
                <th className="px-6 py-3 text-text-secondary uppercase font-semibold">Doctor Name</th>
                <th className="px-6 py-3 text-text-secondary uppercase font-semibold">Specialization</th>
                <th className="px-6 py-3 text-text-secondary uppercase font-semibold">Appointments</th>
                <th className="px-6 py-3 text-text-secondary uppercase font-semibold">Total Invoiced</th>
                <th className="px-6 py-3 text-text-secondary uppercase font-semibold">Earnings Received</th>
              </tr>
            </thead>
            <tbody>
              {data.doctorEarningsBreakdown.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-text-muted">No records in selected date range</td></tr>
              ) : (
                data.doctorEarningsBreakdown.map(d => (
                  <tr key={d._id} className="border-t border-border/40 hover:bg-bg-surface-hover transition-colors">
                    <td className="px-6 py-3 font-semibold text-text-primary">{d.doctorName}</td>
                    <td className="px-6 py-3 text-text-secondary">{d.specialization}</td>
                    <td className="px-6 py-3 font-mono">{d.appointmentsCount}</td>
                    <td className="px-6 py-3 text-text-secondary font-medium">{formatCurrency(d.billed)}</td>
                    <td className="px-6 py-3 font-bold text-accent">{formatCurrency(d.earnings)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
