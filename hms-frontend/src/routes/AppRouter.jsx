import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import PatientList from '../pages/patients/PatientList';
import PatientDetail from '../pages/patients/PatientDetail';
import DoctorList from '../pages/doctors/DoctorList';
import DoctorDetail from '../pages/doctors/DoctorDetail';
import AppointmentList from '../pages/appointments/AppointmentList';
import BookAppointment from '../pages/appointments/BookAppointment';
import AppointmentDetail from '../pages/appointments/AppointmentDetail';
import PrescriptionList from '../pages/prescriptions/PrescriptionList';
import CreatePrescription from '../pages/prescriptions/CreatePrescription';
import PrescriptionDetail from '../pages/prescriptions/PrescriptionDetail';
import BillingList from '../pages/billing/BillingList';
import GenerateBill from '../pages/billing/GenerateBill';
import BillDetail from '../pages/billing/BillDetail';
import MedicineList from '../pages/medicines/MedicineList';
import AddMedicine from '../pages/medicines/AddMedicine';
import MedicineDetail from '../pages/medicines/MedicineDetail';
import ReportsPage from '../pages/reports/ReportsPage';
import CreateStaff from '../pages/staff/CreateStaff';
import Register from '../pages/Register';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="patients" element={
            <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
              <PatientList />
            </ProtectedRoute>
          } />
          <Route path="patients/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'receptionist', 'patient']}>
              <PatientDetail />
            </ProtectedRoute>
          } />

          <Route path="doctors" element={<DoctorList />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />

          <Route path="appointments" element={<AppointmentList />} />
          <Route path="appointments/book" element={
            <ProtectedRoute allowedRoles={['admin', 'receptionist', 'patient']}>
              <BookAppointment />
            </ProtectedRoute>
          } />
          <Route path="appointments/:id" element={<AppointmentDetail />} />

          <Route path="prescriptions" element={<PrescriptionList />} />
          <Route path="prescriptions/create" element={
            <ProtectedRoute allowedRoles={['admin', 'doctor']}>
              <CreatePrescription />
            </ProtectedRoute>
          } />
          <Route path="prescriptions/:id" element={<PrescriptionDetail />} />

          <Route path="billing" element={<BillingList />} />
          <Route path="billing/generate" element={
            <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
              <GenerateBill />
            </ProtectedRoute>
          } />
          <Route path="billing/:id" element={<BillDetail />} />

          <Route path="medicines" element={<MedicineList />} />
          <Route path="medicines/add" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddMedicine />
            </ProtectedRoute>
          } />
          <Route path="medicines/:id" element={<MedicineDetail />} />

          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
            </ProtectedRoute>
          } />

          <Route path="staff/create" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateStaff />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
