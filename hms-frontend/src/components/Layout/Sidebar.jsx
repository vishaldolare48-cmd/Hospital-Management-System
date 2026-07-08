import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';
import logo from '../../assets/logo.png';

const NAV_ITEMS = {
  [ROLES.ADMIN]: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/patients', icon: 'group', label: 'Patients' },
    { to: '/doctors', icon: 'medical_services', label: 'Doctors' },
    { to: '/appointments', icon: 'calendar_month', label: 'Appointments' },
    { to: '/prescriptions', icon: 'description', label: 'Prescriptions' },
    { to: '/medicines', icon: 'vaccines', label: 'Medicines' },
    { to: '/billing', icon: 'payments', label: 'Billing' },
    { to: '/reports', icon: 'monitoring', label: 'Reports' },
    { to: '/staff/create', icon: 'person_add', label: 'Add Staff' },
  ],
  [ROLES.RECEPTIONIST]: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/patients', icon: 'group', label: 'Patients' },
    { to: '/appointments', icon: 'calendar_month', label: 'Appointments' },
    { to: '/billing', icon: 'payments', label: 'Billing' },
  ],
  [ROLES.DOCTOR]: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/appointments', icon: 'calendar_month', label: 'My Appointments' },
    { to: '/prescriptions', icon: 'description', label: 'Prescriptions' },
  ],
  [ROLES.PATIENT]: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/appointments', icon: 'calendar_month', label: 'My Appointments' },
    { to: '/prescriptions', icon: 'description', label: 'My Prescriptions' },
    { to: '/billing', icon: 'payments', label: 'My Bills' },
  ],
};

const getRoleBadgeClass = (role) => {
  switch (role) {
    case ROLES.ADMIN: return 'bg-purple-600/30 text-purple-200';
    case ROLES.DOCTOR: return 'bg-indigo-600/30 text-indigo-200';
    case ROLES.RECEPTIONIST: return 'bg-cyan-600/30 text-cyan-200';
    case ROLES.PATIENT: return 'bg-emerald-600/30 text-emerald-200';
    default: return 'bg-white/10 text-white';
  }
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS[user?.role] || [];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Dark backdrop overlay for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-45 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed top-4 bottom-4 glass-sidebar rounded-xl z-50 transition-all duration-300 flex flex-col p-5 shadow-[20px_0_40px_rgba(30,41,59,0.05)] select-none
        lg:left-4 ${collapsed ? 'lg:w-20' : 'lg:w-72'}
        max-lg:left-0 max-lg:top-0 max-lg:bottom-0 max-lg:rounded-none max-lg:w-72
        ${mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'}`}>
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-8 px-1">
          <img src={logo} alt="AuraHealth Logo" className="w-12 h-12 object-contain rounded-lg flex-shrink-0" />
          <span className={`font-headline-lg text-xl text-white font-bold tracking-tight ${collapsed ? 'lg:hidden' : 'lg:inline'}`}>
            AuraHealth
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
          <div>
            <p className={`text-slate-400 font-label-md text-[10px] px-3 mb-3 uppercase tracking-widest ${collapsed ? 'lg:hidden' : 'lg:block'}`}>
              Console Navigation
            </p>
            <ul className="space-y-1.5">
              {items.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all duration-200 relative whitespace-nowrap group
                      ${isActive
                        ? 'bg-gradient-to-r from-secondary/80 to-secondary-container text-white active-glow'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`
                    }
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className={`font-title-md text-xs font-medium ${collapsed ? 'lg:hidden' : 'lg:inline'}`}>
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Profile and Logout Section */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 p-2 bg-white/5 rounded-2xl">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-white border-2 border-secondary-container">
                {getInitials(user?.name)}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-primary rounded-full"></div>
            </div>
            <div className={`flex-1 overflow-hidden ${collapsed ? 'lg:hidden' : 'lg:block'}`}>
              <p className="text-white font-semibold text-xs truncate leading-snug">{user?.name}</p>
              <p className="text-slate-400 text-[10px] truncate capitalize">{user?.role}</p>
            </div>
            <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter shrink-0 ${getRoleBadgeClass(user?.role)} ${collapsed ? 'lg:hidden' : 'lg:block'}`}>
              {user?.role}
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="mt-3 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors py-1.5 w-full text-xs font-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className={collapsed ? 'lg:hidden' : 'lg:inline'}>Sign Out</span>
          </button>
        </div>

        {/* Collapse/Expand Toggle floating control */}
        <button
          onClick={onToggle}
          className="absolute top-5 -right-3 w-6 h-6 bg-secondary-container border border-white/10 rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all text-xs z-50 shadow-md cursor-pointer max-lg:hidden"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? '→' : '←'}
        </button>
      </aside>
    </>
  );
}
