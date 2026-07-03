import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

export default function AppointmentDetail() {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/appointments/${id}`);
        setAppointment(data);
      } catch {
        toast.error('Failed to load appointment detail');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('Cancellation reason is required');
      return;
    }
    setCancelLoading(true);
    try {
      await api.patch(`/appointments/${id}/cancel`, { reason });
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      // reload
      const data = await api.get(`/appointments/${id}`);
      setAppointment(data);
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      if (role === 'doctor') {
        // Redirect to create prescription which will auto-complete the appointment on submission
        navigate(`/prescriptions/create?appointmentId=${id}`);
      } else {
        await api.patch(`/appointments/${id}/status`, { status: 'Completed' });
        toast.success('Appointment completed');
        const data = await api.get(`/appointments/${id}`);
        setAppointment(data);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!appointment) return <p className="text-text-muted text-center py-20">Appointment not found</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>

      <div className="bg-bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Appointment Details</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[appointment.status] || ''}`}>
            {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-bg-surface-alt border border-border rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-accent-secondary">Doctor Info</h3>
            <p className="font-bold text-text-primary">{appointment.doctorId?.name}</p>
            <p className="text-text-secondary">{appointment.doctorId?.specialization}</p>
            <p className="text-text-secondary">{appointment.doctorId?.email}</p>
            <p className="text-text-secondary">{appointment.doctorId?.phone}</p>
          </div>

          <div className="bg-bg-surface-alt border border-border rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-accent">Patient Info</h3>
            <p className="font-bold text-text-primary">{appointment.patientId?.name}</p>
            <p className="text-text-secondary">DOB: {formatDate(appointment.patientId?.dob)}</p>
            <p className="text-text-secondary">{appointment.patientId?.email}</p>
            <p className="text-text-secondary">{appointment.patientId?.phone}</p>
          </div>
        </div>

        <div className="bg-bg-surface-alt border border-border rounded-xl p-4 text-sm space-y-3">
          <h3 className="font-semibold text-text-primary">Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-text-muted">Date:</span> <span className="text-text-primary font-medium ml-1">{formatDate(appointment.date)}</span></div>
            <div><span className="text-text-muted">Time Slot:</span> <span className="text-text-primary font-mono ml-1">{appointment.timeSlot}</span></div>
          </div>
          {appointment.cancellationReason && (
            <div className="pt-2 border-t border-border/40">
              <span className="text-text-muted">Cancellation Reason:</span>
              <p className="text-danger mt-1 text-xs italic">{appointment.cancellationReason}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
            <>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-5 py-2.5 bg-danger text-white font-semibold rounded-xl text-sm hover:bg-danger/80 transition-colors"
              >
                Cancel Appointment
              </button>

              {role !== 'patient' && (
                <button
                  onClick={handleComplete}
                  className="px-5 py-2.5 bg-success text-white font-semibold rounded-xl text-sm hover:bg-success/80 transition-colors ml-auto"
                >
                  {role === 'doctor' ? 'Write Prescription & Complete' : 'Mark Completed'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            <h3 className="text-lg font-bold text-text-primary">Cancel Appointment</h3>
            <p className="text-text-secondary text-sm">Please state the reason for cancelling this appointment:</p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-4 py-2 bg-bg-input border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              rows={3}
              placeholder="E.g., Doctor unavailable, rescheduled, patient request..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-bg-surface-hover text-text-secondary rounded-xl hover:text-text-primary transition-colors text-sm"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="px-4 py-2 bg-danger text-white rounded-xl hover:bg-danger/80 transition-colors text-sm flex items-center gap-2"
              >
                {cancelLoading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
