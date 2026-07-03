import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  
  // Emergency Contact
  const [ecName, setEcName] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecRelation, setEcRelation] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Name, Email, and Password are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        phone: phone || undefined,
        dob: dob || undefined,
      };

      if (ecName && ecPhone && ecRelation) {
        payload.emergencyContact = {
          name: ecName,
          phone: ecPhone,
          relation: ecRelation,
        };
      }

      await api.post('/auth/register', payload);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen w-full font-body-md text-on-background bg-background">
      {/* Left Branding Panel: Suppression of Shell for Transactional Context */}
      <section className="relative w-full md:w-5/12 lg:w-4/12 bg-primary p-6 flex flex-col justify-between overflow-hidden select-none">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-container rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-tertiary-container rounded-full blur-[80px]" />
        </div>
        
        {/* Brand Identity */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
              <span className="text-white font-bold text-xl font-headline-lg">H</span>
            </div>
            <span className="font-headline-lg text-lg text-white tracking-tight">Aura Health Everywhere</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold font-display-lg text-white leading-tight">
              Precision Care,<br />
              <span className="text-secondary-fixed">Simplified.</span>
            </h1>
            <p className="text-xs text-primary-fixed/80 max-w-sm font-body-lg">
              Join the next generation of healthcare management. Secure, integrated, and designed for medical excellence.
            </p>
          </div>
        </div>
        
        {/* Stats Bento-ish Grid */}
        <div className="relative z-10 grid grid-cols-1 gap-3 my-4">
          <div className="glass-surface p-3.5 rounded-xl flex items-center gap-3 animate-float" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-sm">verified</span>
            </div>
            <div>
              <div className="font-title-md text-sm text-white">500+ Hospitals</div>
              <div className="font-label-md text-[10px] text-primary-fixed-dim uppercase">Trusted Globally</div>
            </div>
          </div>
          
          <div className="glass-surface p-3.5 rounded-xl flex items-center gap-3 animate-float" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', animationDelay: '1s' }}>
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-sm">security</span>
            </div>
            <div>
              <div className="font-title-md text-sm text-white">HIPAA Compliant</div>
              <div className="font-label-md text-[10px] text-primary-fixed-dim uppercase">Secure Medical Records</div>
            </div>
          </div>
          
          <div className="glass-surface p-3.5 rounded-xl flex items-center gap-3 animate-float" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', animationDelay: '2s' }}>
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-sm">query_stats</span>
            </div>
            <div>
              <div className="font-title-md text-sm text-white">Real-time Analytics</div>
              <div className="font-label-md text-[10px] text-primary-fixed-dim uppercase">Precision Insights</div>
            </div>
          </div>
        </div>
        
        {/* Footer Branding */}
        <div className="relative z-10 text-primary-fixed-dim/40 text-[10px] font-label-md">
          © 2024 AURAHEALTH SYSTEMS. ALL RIGHTS RESERVED.
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="w-full md:w-7/12 lg:w-8/12 flex items-center justify-center p-4 md:p-6 bg-surface-bright overflow-y-auto max-h-screen">
        <div className="w-full max-w-xl">
          {/* Mobile Logo (Visible only on mobile) */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">H</span>
            </div>
            <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Aura Health Everywhere</span>
          </div>
          
          <div className="mb-4 text-center md:text-left">
            <h2 className="font-headline-lg text-2xl text-primary mb-0.5">Patient Registration</h2>
            <p className="text-xs text-on-surface-variant font-body-lg">Create your hospital portal account to manage appointments and records.</p>
          </div>
          
          {/* Glassmorphic Form Card */}
          <div className="glass-surface p-5 md:p-6 rounded-2xl shadow-[0_15px_40px_rgba(30,41,59,0.04)] border border-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Details Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-4 bg-secondary rounded-full" />
                  <h3 className="font-label-md text-xs text-secondary uppercase tracking-widest">Account Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className="space-y-1 group">
                    <label className="font-label-md text-xs text-on-surface-variant ml-1 group-focus-within:text-secondary transition-colors duration-200">Full Name *</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-white transition-all duration-200" 
                      placeholder="John Doe" 
                      required
                    />
                  </div>
                  
                  {/* Email Address */}
                  <div className="space-y-1 group">
                    <label className="font-label-md text-xs text-on-surface-variant ml-1 group-focus-within:text-secondary transition-colors duration-200">Email Address *</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-white transition-all duration-200" 
                      placeholder="john.doe@example.com" 
                      required
                    />
                  </div>
                  
                  {/* Password */}
                  <div className="space-y-1 group relative">
                    <label className="font-label-md text-xs text-on-surface-variant ml-1 group-focus-within:text-secondary transition-colors duration-200">Password *</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-surface-container-low border-transparent rounded-xl px-3.5 py-2.5 pr-10 text-sm text-on-surface placeholder:text-outline-variant focus:bg-white transition-all duration-200" 
                        placeholder="Min 6 characters" 
                        required
                      />
                      <span 
                        onClick={() => setShowPassword(!showPassword)}
                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline cursor-pointer text-[18px] select-none"
                      >
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Phone Number */}
                  <div className="space-y-1 group">
                    <label className="font-label-md text-xs text-on-surface-variant ml-1 group-focus-within:text-secondary transition-colors duration-200">Phone Number</label>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-white transition-all duration-200" 
                      placeholder="e.g. 9876543210" 
                    />
                  </div>
                  
                  {/* Date of Birth */}
                  <div className="space-y-1 md:col-span-2 group">
                    <label className="font-label-md text-xs text-on-surface-variant ml-1 group-focus-within:text-secondary transition-colors duration-200">Date of Birth</label>
                    <div className="relative">
                      <input 
                        type="date"
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-surface-container-low border-transparent rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-white transition-all duration-200 appearance-none" 
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">calendar_today</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <hr className="border-surface-container" />
              
              {/* Emergency Contact Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-4 bg-secondary rounded-full" />
                  <h3 className="font-label-md text-xs text-secondary uppercase tracking-widest">Emergency Contact (Optional)</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="space-y-1 group">
                    <label className="font-label-md text-xs text-on-surface-variant ml-1 group-focus-within:text-secondary transition-colors duration-200">Contact Name</label>
                    <input 
                      type="text"
                      value={ecName}
                      onChange={e => setEcName(e.target.value)}
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-white transition-all duration-200" 
                      placeholder="Jane Doe" 
                    />
                  </div>
                  
                  <div className="space-y-1 group">
                    <label className="font-label-md text-xs text-on-surface-variant ml-1 group-focus-within:text-secondary transition-colors duration-200">Phone</label>
                    <input 
                      type="tel"
                      value={ecPhone}
                      onChange={e => setEcPhone(e.target.value)}
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-white transition-all duration-200" 
                      placeholder="Emergency Phone" 
                    />
                  </div>
                  
                  <div className="space-y-1 group">
                    <label className="font-label-md text-xs text-on-surface-variant ml-1 group-focus-within:text-secondary transition-colors duration-200">Relation</label>
                    <select 
                      value={ecRelation}
                      onChange={e => setEcRelation(e.target.value)}
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-white transition-all duration-200 appearance-none font-body-md"
                    >
                      <option value="">Select Relation</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* CTA Section */}
              <div className="pt-2 flex flex-col gap-3.5 items-center">
                <button 
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-secondary to-secondary-container text-white font-semibold text-sm rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 font-title-md" 
                  type="submit"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Creating Account...' : 'Create Portal Account'}
                </button>
                
                <div className="text-xs text-on-surface-variant font-body-md">
                  Already have an account?{' '}
                  <Link className="text-secondary font-semibold hover:underline decoration-2 underline-offset-4" to="/login">Sign In</Link>
                </div>
              </div>
            </form>
          </div>
          
          {/* Compliance Footer */}
          <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-1 text-outline text-[10px] uppercase tracking-wider font-semibold">
            <a className="hover:text-secondary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-secondary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-secondary transition-colors" href="#">Patient Rights</a>
          </div>
        </div>
      </section>
    </main>
  );
}
