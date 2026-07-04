export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://hospital-management-system-backend-production-5f06.up.railway.app');

export const ROLES = {
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  PARTIAL: 'Partial',
  REFUNDED: 'Refunded',
  CANCELLED: 'Cancelled',
};

export const STATUS_COLORS = {
  Confirmed: 'text-accent-secondary bg-accent-secondary-light',
  Completed: 'text-success bg-success-light',
  Cancelled: 'text-danger bg-danger-light',
  Pending: 'text-warning bg-warning-light',
  Paid: 'text-success bg-success-light',
  Unpaid: 'text-danger bg-danger-light',
  Partial: 'text-warning bg-warning-light',
  Refunded: 'text-purple bg-purple-light',
};
