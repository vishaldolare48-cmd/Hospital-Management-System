import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function CreateStaff() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('doctor');
  
  // Doctor special fields
  const [specialization, setSpecialization] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [workingHoursStr, setWorkingHoursStr] = useState('09:00-10:00, 10:00-11:00, 11:00-12:00, 14:00-15:00, 15:00-16:00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !name || !role) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        password,
        name,
        phone,
        role,
      };

      if (role === 'doctor') {
        payload.specialization = specialization || 'General Physician';
        payload.consultationFee = parseFloat(consultationFee) || 100;
        payload.workingHours = workingHoursStr.split(',').map(s => s.trim()).filter(Boolean);
      }

      await api.post('/auth/staff', payload);
      toast.success('Staff account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Staff creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-accent transition-colors">← Back</button>
        <h1 className="text-2xl font-bold mt-2">Create Staff Account</h1>
        <p className="text-text-secondary text-sm mt-1">Register new administrative or practitioner accounts</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-surface border border-border rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Staff Role *</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            required
          >
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none"
              placeholder="Dr. Bruce Banner"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none"
              placeholder="e.g. 9876543210"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none"
              placeholder="user@hms.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {role === 'doctor' && (
          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Doctor Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-xs text-text-primary focus:outline-none"
                  placeholder="e.g. Cardiologist"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={e => setConsultationFee(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-xs text-text-primary focus:outline-none"
                  placeholder="e.g. 150"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">Working Hours slots (Comma-separated)</label>
              <input
                type="text"
                value={workingHoursStr}
                onChange={e => setWorkingHoursStr(e.target.value)}
                className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-xs text-text-primary focus:outline-none"
                placeholder="09:00-10:00, 10:00-11:00"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-accent to-accent-hover text-text-inverse font-semibold rounded-xl shadow-lg shadow-accent/10 hover:shadow-accent/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
