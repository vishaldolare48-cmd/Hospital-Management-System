import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getPageLabel = (segment) => {
  const labels = {
    dashboard: 'Overview',
    patients: 'Patients',
    doctors: 'Doctors',
    appointments: 'Appointments',
    prescriptions: 'Prescriptions',
    medicines: 'Medicines',
    billing: 'Billing',
    reports: 'Reports',
    staff: 'Staff',
    create: 'Create',
    book: 'Book Appointment',
    generate: 'Generate Bill'
  };
  return labels[segment.toLowerCase()] || segment.charAt(0).toUpperCase() + segment.slice(1);
};

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getCTA = () => {
    if (user?.role === 'doctor') {
      return (
        <Link to="/prescriptions/create" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-label-md text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Write Prescription
        </Link>
      );
    }
    // Default CTA for admin, receptionist, patient, or general
    return (
      <Link to="/appointments/book" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-label-md text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200">
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        {user?.role === 'patient' ? 'Book Appointment' : 'Create Appointment'}
      </Link>
    );
  };

  return (
    <header className="sticky top-4 z-40 w-full glass-panel rounded-2xl px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(30,41,59,0.08)] mb-8 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-on-surface-variant select-none">
        <span className="material-symbols-outlined text-[18px]">home</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant/80">HMS Console</span>
        {pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'dashboard') ? (
          <>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-title-md text-xs text-primary font-semibold">Overview</span>
          </>
        ) : (
          pathSegments.map((segment, index) => (
            <React.Fragment key={segment}>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className={`font-title-md text-xs ${index === pathSegments.length - 1 ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                {getPageLabel(segment)}
              </span>
            </React.Fragment>
          ))
        )}
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors text-[20px]">search</span>
          <input 
            type="text"
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-md text-xs transition-all text-on-surface" 
            placeholder="Search patients, records, or staff..." 
          />
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors notification-pulse">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        <button className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>
        <div className="w-[1px] h-6 bg-outline-variant mx-1"></div>
        {getCTA()}
      </div>
    </header>
  );
}
