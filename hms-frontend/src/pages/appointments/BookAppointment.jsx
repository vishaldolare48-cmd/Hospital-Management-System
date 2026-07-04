import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function BookAppointment() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const docs = await api.get('/users/doctors');
        setDoctors(docs.data || docs || []);
        
        if (role !== 'patient') {
          const pats = await api.get('/users?role=patient&limit=100');
          setPatients(pats.data || pats || []);
        }
      } catch { /* ignore */ }
    }
    load();
  }, [role]);

  // Update slots when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      const doc = doctors.find(d => d._id === selectedDoctor);
      setAvailableSlots(doc?.workingHours || []);
    } else {
      setAvailableSlots([]);
    }
    setTimeSlot('');
  }, [selectedDoctor, doctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !timeSlot) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (role !== 'patient' && !selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        doctorId: selectedDoctor,
        date,
        timeSlot,
      };
      if (role !== 'patient') {
        payload.patientId = selectedPatient;
      }
      await api.post('/appointments', payload);
      toast.success('Appointment booked successfully!');
      navigate('/appointments');
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>
        <h1 className="text-2xl font-bold mt-2">Book Appointment</h1>
        <p className="text-text-secondary text-sm mt-1">Schedule a consultation with a specialist</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-surface border border-border rounded-2xl p-6 space-y-5">
        {role !== 'patient' && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Select Patient *</label>
            <select
              value={selectedPatient}
              onChange={e => setSelectedPatient(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Choose Patient</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Select Doctor *</label>
          <select
            value={selectedDoctor}
            onChange={e => setSelectedDoctor(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            required
          >
            <option value="">Choose Doctor</option>
            {doctors.map(d => (
              <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Select Date *</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            required
          />
        </div>

        {availableSlots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Available Time Slots *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                    timeSlot === slot
                      ? 'bg-accent/15 border-accent text-accent'
                      : 'bg-bg-input border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl shadow-lg shadow-accent/10 hover:shadow-accent/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );
}
