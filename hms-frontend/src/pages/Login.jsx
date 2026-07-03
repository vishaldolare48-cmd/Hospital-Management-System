import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const benefits = [
  {
    title: "Advanced Patient Analytics",
    description: "Harness the power of AI-driven diagnostics and real-time patient monitoring for superior care outcomes."
  },
  {
    title: "Secure Health Records",
    description: "Zero-trust architecture ensuring the highest standards of HIPAA compliance and data integrity."
  },
  {
    title: "Optimized Surgery Scheduling",
    description: "Smart algorithmic scheduling that maximizes theater efficiency while minimizing staff fatigue."
  }
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState(0);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Benefit slider logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBenefit(prev => (prev + 1) % benefits.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full overflow-hidden bg-background text-on-surface font-body-md">
      {/* Left Side: Branded Visual Panel */}
      <section className="hidden lg:flex w-1/2 vibrant-gradient relative overflow-hidden items-center justify-center p-16 select-none">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-tertiary-container blur-[120px]" />
        </div>
        
        <div className="relative z-10 w-full max-w-xl">
          <div className="mb-12">
            <h1 className="font-display-lg text-4xl text-white mb-2 tracking-tight">AuraHealth HMS</h1>
            <p className="font-body-lg text-base text-blue-100/80">The next generation of clinical intelligence.</p>
          </div>
          
          {/* Glassmorphic Stats Grid */}
          <div className="grid grid-cols-2 gap-6 mb-16">
            <div className="glass-card p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300">
              <span className="material-symbols-outlined text-blue-300 mb-3 text-[32px]">verified_user</span>
              <h3 className="font-headline-lg text-2xl font-bold text-white mb-1">99.9%</h3>
              <p className="font-label-md text-[10px] text-slate-300 uppercase tracking-wider">Uptime Guaranteed</p>
            </div>
            <div className="glass-card p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300">
              <span className="material-symbols-outlined text-blue-300 mb-3 text-[32px]">medical_services</span>
              <h3 className="font-headline-lg text-2xl font-bold text-white mb-1">15k+</h3>
              <p className="font-label-md text-[10px] text-slate-300 uppercase tracking-wider">Consultations</p>
            </div>
          </div>
          
          {/* Rotating Benefits */}
          <div className="h-32 relative">
            <div className="absolute inset-0 transition-opacity duration-500">
              <h2 className="font-title-md text-lg text-white mb-1">{benefits[currentBenefit].title}</h2>
              <p className="font-body-md text-xs text-blue-100/70 max-w-md leading-relaxed">{benefits[currentBenefit].description}</p>
            </div>
          </div>
        </div>
        
        {/* Abstract Medical Visualization */}
        <div className="absolute bottom-12 right-12 w-64 h-64 opacity-30 pointer-events-none">
          <div className="w-full h-full bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBk9GaeKLupccj372BU2urPtwI1jsKO9hwJBpcsOicA4JGEYJcDPCkm6_qTUJ7klTJKsypczy7ICoMeBFjNsVhA9pxFPzS8x5H6ifnB57IS2PtgrHwLpYyDxENHzK7ih9RtWzDIEKj8tWu_q1vXnHPdzfgLvAH95OJKc9BrTuH2ukJLYy0IIYUNCettxFbj3KXrRXd4MHN0FSLY-PFD7-unu8A50qSvWyCboISXzHA4X-q7ElgsrI3uVk79Oo5jyV4Mwt0-JhDCaBc')" }} />
        </div>
      </section>

      {/* Right Side: Login Form Panel */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-margin-desktop bg-surface-bright">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="font-headline-lg-mobile text-2xl text-primary tracking-tight font-bold">AuraHealth HMS</h1>
          </div>

          {/* Main Login Card */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-outline-variant/30">
            <div className="mb-8">
              <h2 className="font-headline-lg text-2xl font-bold text-primary mb-1.5" id="welcome-title">Welcome back</h2>
              <p className="font-body-md text-xs text-on-surface-variant" id="role-helper-text">Log in to check appointments, billing logs, and clinical records.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" id="login-form">
              {/* Email Input */}
              <div className="space-y-2 group">
                <label className="font-label-md text-xs text-on-surface-variant block ml-1 uppercase group-focus-within:text-secondary transition-colors duration-200" htmlFor="login-email" id="id-label">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant transition-colors text-[20px]">person</span>
                  <input 
                    type="email"
                    id="login-email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-transparent rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-white transition-all duration-200 outline-none font-body-md text-sm text-on-surface" 
                    placeholder="admin@aurahealth.com" 
                    required 
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2 group">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase group-focus-within:text-secondary transition-colors duration-200" htmlFor="login-password">Password</label>
                  <a className="font-label-md text-xs text-secondary hover:underline" href="#">Forgot?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant transition-colors text-[20px]">lock</span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    id="login-password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-surface-container-low border-transparent rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-white transition-all duration-200 outline-none font-body-md text-sm text-on-surface" 
                    placeholder="••••••••" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined select-none text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>


              {/* Submit Button */}
              <button 
                type="submit" 
                id="login-submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-secondary to-secondary-container text-white font-semibold text-base rounded-xl shadow-lg shadow-secondary/20 hover:shadow-secondary/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant/20 text-center flex flex-col gap-2">
              <p className="font-body-md text-xs text-on-surface-variant">
                New patient? <Link to="/register" className="text-secondary font-medium hover:underline decoration-2 underline-offset-2">Register Account</Link>
              </p>
              <p className="font-body-md text-xs text-on-surface-variant">
                Need assistance? <a className="text-secondary font-medium hover:underline" href="#">Contact HMS Support</a>
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex justify-center space-x-6">
            <a className="font-label-md text-[10px] uppercase text-outline hover:text-on-surface-variant transition-colors" href="#">Terms of Service</a>
            <a className="font-label-md text-[10px] uppercase text-outline hover:text-on-surface-variant transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-md text-[10px] uppercase text-outline hover:text-on-surface-variant transition-colors" href="#">v2.4.0</a>
          </div>
        </div>
      </section>
    </div>
  );
}
