import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import { formatDate, formatCurrency, getTodayISO } from '../utils/formatters';
import api from '../api/client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#0058be', '#2170e4', '#c0c1ff', '#adc6ff'];

const parseTime = (timeSlot) => {
  if (!timeSlot) return { hour: '12', period: 'PM' };
  const clean = timeSlot.trim();
  const parts = clean.split(' ');
  const timeParts = parts[0].split(':');
  return {
    hour: timeParts[0] || '12',
    period: parts[1] || 'PM'
  };
};

const getRoleGreeting = (role, apptCount, isLoading) => {
  if (isLoading) return 'Synchronizing dashboard consoles and schedules...';
  switch (role) {
    case ROLES.ADMIN:
      return 'Monitor operations, manage doctors & patients lists, track earnings, and run diagnostics logs.';
    case ROLES.DOCTOR:
      return `You have ${apptCount} appointments scheduled today. Click details to check diagnostic files.`;
    case ROLES.RECEPTIONIST:
      return `There are ${apptCount} patients on the registration queue for consultation today.`;
    case ROLES.PATIENT:
      return 'Check prescription sheets, confirm appointment queues, or contact the medical support console.';
    default:
      return 'Overview of the HMS portal console.';
  }
};

const getAlertText = (role, appointments, isLoading) => {
  if (isLoading) return 'Syncing...';
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  if (role === ROLES.DOCTOR) {
    return `${appointments.length} Consultations Active`;
  }
  if (role === ROLES.PATIENT) {
    return '1 Active Appointment';
  }
  return `${pendingCount} Pending Approvals`;
};

const statusBadgeColor = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'bg-secondary-fixed text-on-secondary-fixed-variant';
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800';
    case 'Pending':
      return 'bg-amber-100 text-amber-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-surface-container-high text-on-surface';
  }
};

function StatsCard({ icon, label, value, colorClass = 'bg-secondary-container text-white', footerIcon = 'group', footerText, loading }) {
  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${colorClass} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
          <span className="text-green-600 font-label-md text-[10px] bg-green-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Sync Active</span>
        </div>
        <h3 className="text-on-surface-variant font-label-md text-xs uppercase tracking-wider">{label}</h3>
        {loading ? (
          <div className="h-8 bg-slate-200/50 animate-pulse rounded-xl w-24 mt-2" />
        ) : (
          <p className="font-display-lg text-3xl text-primary font-bold mt-1">{value}</p>
        )}
      </div>
      {footerText && (
        <div className="mt-4 pt-4 border-t border-outline-variant flex items-center gap-2 text-on-surface-variant text-[11px] items-center">
          <span className="material-symbols-outlined text-[16px]">{footerIcon}</span>
          {loading ? (
            <div className="h-3.5 bg-slate-200/50 animate-pulse rounded w-32 ml-1" />
          ) : (
            <span>{footerText}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (role === ROLES.ADMIN) {
          const [rep, appts] = await Promise.all([
            api.get('/reports/summary'),
            api.get('/appointments?limit=5'),
          ]);
          setReport(rep);
          setAppointments(appts.data || []);
        } else if (role === ROLES.RECEPTIONIST) {
          const [appts, billData] = await Promise.all([
            api.get(`/appointments?date=${getTodayISO()}&limit=10`),
            api.get('/billing?paymentStatus=Unpaid&limit=5'),
          ]);
          setAppointments(appts.data || []);
          setBills(billData.data || []);
        } else if (role === ROLES.DOCTOR) {
          const appts = await api.get(`/appointments?date=${getTodayISO()}&limit=10`);
          setAppointments(appts.data || []);
        } else if (role === ROLES.PATIENT) {
          const [appts, billData] = await Promise.all([
            api.get('/appointments?limit=5'),
            api.get('/billing?limit=5'),
          ]);
          setAppointments(appts.data || []);
          setBills(billData.data || []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [role]);

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Bento Grid Layout Dashboard */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Welcome Card (Hero) */}
        <section className="col-span-12 glass-panel rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-center min-h-[160px]">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-secondary-container rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-tertiary-container rounded-full blur-[80px]"></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-display-lg text-2xl md:text-3xl text-primary font-bold mb-2">
                Good morning, {user?.name?.split(' ')[0]}.
              </h1>
              <p className="font-body-lg text-xs text-on-surface-variant max-w-2xl leading-relaxed">
                {getRoleGreeting(user?.role, appointments.length, loading)}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="bg-secondary/10 px-4 py-2 rounded-xl border border-secondary/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-label-md text-[11px] text-secondary font-semibold">
                  {getAlertText(user?.role, appointments, loading)}
                </span>
              </div>
              <div className="bg-tertiary/10 px-4 py-2 rounded-xl border border-tertiary/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-label-md text-[11px] text-tertiary font-semibold">System Integrity: 99.9%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Bento Stats Grid (5 Columns) */}
        {role === ROLES.ADMIN && (
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatsCard icon="payments" label="Total Earnings" value={report ? formatCurrency(report.overview.totalEarnings) : ''} colorClass="bg-secondary-container text-white" footerIcon="payments" footerText="Cleared & updated hourly" loading={loading} />
            <StatsCard icon="group" label="Total Patients" value={report ? report.overview.totalPatients : ''} colorClass="bg-secondary text-white" footerIcon="group" footerText="4 new patient entries" loading={loading} />
            <StatsCard icon="medical_services" label="Total Doctors" value={report ? report.overview.totalDoctors : ''} colorClass="bg-indigo-600 text-white" footerIcon="medical_services" footerText="All systems active" loading={loading} />
            <StatsCard icon="calendar_month" label="Total Appointments" value={report ? report.overview.totalAppointments : ''} colorClass="bg-purple-600 text-white" footerIcon="calendar_month" footerText="Weekly summaries" loading={loading} />
            <StatsCard icon="pending_actions" label="Pending Payments" value={report ? formatCurrency(report.overview.pendingPayments) : ''} colorClass="bg-amber-600 text-white" footerIcon="payments" footerText="Requires invoice sync" loading={loading} />
          </div>
        )}

        {role === ROLES.RECEPTIONIST && (
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatsCard icon="calendar_month" label="Today's Appointments" value={appointments.length} colorClass="bg-secondary text-white" footerIcon="calendar_month" footerText="Consultation schedule loaded" loading={loading} />
            <StatsCard icon="payments" label="Unpaid Bills" value={bills.length} colorClass="bg-amber-600 text-white" footerIcon="payments" footerText="Awaiting payments processing" loading={loading} />
            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
              <div>
                <h3 className="text-primary font-title-md text-sm font-bold mb-1.5">Intake Services</h3>
                <p className="text-[11px] text-on-surface-variant leading-normal">
                  Register new patient files or assign doctor slots.
                </p>
              </div>
              <button 
                onClick={() => navigate('/appointments/book')}
                className="w-full py-2.5 bg-secondary hover:bg-secondary-container text-white font-semibold text-xs rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                Book Appointment
              </button>
            </div>
          </div>
        )}

        {role === ROLES.DOCTOR && (
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatsCard icon="calendar_month" label="Today's Appointments" value={appointments.length} colorClass="bg-secondary text-white" footerIcon="calendar_month" footerText="Intake listings complete" loading={loading} />
            <StatsCard icon="check_circle" label="Completed Today" value={appointments.filter(a => a.status === 'Completed').length} colorClass="bg-secondary-container text-white" footerIcon="clinical_notes" footerText="Operations reports generated" loading={loading} />
            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
              <div>
                <h3 className="text-primary font-title-md text-sm font-bold mb-1.5">Prescriptions</h3>
                <p className="text-[11px] text-on-surface-variant leading-normal">
                  Write clinical prescriptions and medicine files.
                </p>
              </div>
              <button 
                onClick={() => navigate('/prescriptions/create')}
                className="w-full py-2.5 bg-secondary hover:bg-secondary-container text-white font-semibold text-xs rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                Create Prescription
              </button>
            </div>
          </div>
        )}

        {role === ROLES.PATIENT && (
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatsCard icon="calendar_month" label="My Appointments" value={appointments.length} colorClass="bg-secondary text-white" footerIcon="calendar_month" footerText="Check updates and times" loading={loading} />
            <StatsCard icon="payments" label="Total Bills" value={bills.length} colorClass="bg-amber-600 text-white" footerIcon="payments" footerText="Payment history dashboard" loading={loading} />
            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
              <div>
                <h3 className="text-primary font-title-md text-sm font-bold mb-1.5">Consultations</h3>
                <p className="text-[11px] text-on-surface-variant leading-normal">
                  Schedule appointments with our medical team.
                </p>
              </div>
              <button 
                onClick={() => navigate('/appointments/book')}
                className="w-full py-2.5 bg-secondary hover:bg-secondary-container text-white font-semibold text-xs rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                Book Time Slot
              </button>
            </div>
          </div>
        )}

        {/* Left Side: Recent Appointments/Schedule Queue List */}
        <section className="col-span-12 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="font-headline-lg text-lg text-primary font-bold">
                  {role === ROLES.DOCTOR ? "Today's Consultations" : 'Recent Appointments Queue'}
                </h2>
                <p className="text-xs text-on-surface-variant">High priority operations and consultation list</p>
              </div>
              <button 
                onClick={() => navigate('/appointments')} 
                className="text-secondary font-semibold text-xs hover:underline decoration-2 underline-offset-4"
              >
                View Full Queue
              </button>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-14 bg-slate-100/50 animate-pulse rounded-2xl w-full" />
                  <div className="h-14 bg-slate-100/50 animate-pulse rounded-2xl w-full" />
                  <div className="h-14 bg-slate-100/50 animate-pulse rounded-2xl w-full" />
                </div>
              ) : appointments.length > 0 ? (
                appointments.map(a => {
                  const { hour, period } = parseTime(a.timeSlot);
                  return (
                    <div 
                      key={a._id} 
                      onClick={() => navigate(`/appointments/${a._id}`)}
                      className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 border border-transparent hover:border-white/40 transition-all cursor-pointer duration-200"
                    >
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex flex-col items-center justify-center text-primary shrink-0 shadow-sm border border-outline-variant/10">
                        <span className="font-bold text-base leading-none">{hour}</span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">{period}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-primary truncate">
                          {role === ROLES.PATIENT ? `Dr. ${a.doctorId?.name}` : a.patientId?.name || 'Walk-in Patient'}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                          {a.doctorId?.specialization || 'Consultation Slot'} • {formatDate(a.date)}
                        </p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBadgeColor(a.status)}`}>
                        {a.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-text-muted text-center py-8 text-xs font-semibold">No appointments scheduled</p>
              )}
            </div>
          </div>
        </section>

        {/* Admin Recharts Section */}
        {role === ROLES.ADMIN && (
          <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pie Chart: Status breakdown */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-sm font-bold mb-4 text-primary">Appointment Breakdown</h3>
              {loading ? (
                <div className="h-[200px] bg-slate-100/50 animate-pulse rounded-3xl w-full flex items-center justify-center text-xs text-text-muted">Loading breakdown...</div>
              ) : report && Object.keys(report.appointmentsBreakdown || {}).length > 0 ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={Object.entries(report.appointmentsBreakdown).map(([name, value]) => ({ name, value }))}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        paddingAngle={4} dataKey="value"
                      >
                        {Object.keys(report.appointmentsBreakdown).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#091426', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} itemStyle={{ color: '#ffffff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-text-muted text-center py-8 text-xs font-semibold">No appointment records</p>}
              
              {!loading && report && (
                <div className="flex flex-wrap gap-4 mt-2 justify-center">
                  {Object.entries(report.appointmentsBreakdown || {}).map(([name, value], i) => (
                    <div key={name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-on-surface-variant font-semibold">{name}: <span className="text-primary font-bold">{value}</span></span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bar Chart: Doctor earnings breakdown */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-sm font-bold mb-4 text-primary">Doctor Earnings Distribution</h3>
              {loading ? (
                <div className="h-[230px] bg-slate-100/50 animate-pulse rounded-3xl w-full flex items-center justify-center text-xs text-text-muted">Loading distribution...</div>
              ) : report && (report.doctorEarningsBreakdown || []).length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={report.doctorEarningsBreakdown}>
                    <XAxis dataKey="doctorName" tick={{ fill: '#45474c', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#45474c', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#091426', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} itemStyle={{ color: '#ffffff' }} />
                    <Bar dataKey="earnings" fill="#0058be" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-text-muted text-center py-8 text-xs font-semibold">No earnings records</p>}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
