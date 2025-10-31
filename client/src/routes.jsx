import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AuthCallback from "./components/auth/AuthCallback";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import Dashboard from "./components/common/Dashboard";
import PatientList from "./components/patients/PatientList";
import AddPatient from "./components/patients/AddPatient";
import EditPatient from "./components/patients/EditPatient";
import PatientDetails from "./components/patients/PatientDetails";
import AppointmentList from "./components/appointments/AppointmentList";
import AddAppointment from "./components/appointments/AddAppointment";
import EditAppointment from "./components/appointments/EditAppointment";
import UserList from "./components/users/UserList";
import AddUser from "./components/users/AddUser";
import EditUser from "./components/users/EditUser";
import ViewMedicalRecord from "./components/medical-records/ViewMedicalRecord";
import EditMedicalRecord from "./components/medical-records/EditMedicalRecord";
import ActivityLogsList from "./components/activity-logs/ActivityLogsList";
import BillList from "./components/bills/BillList";
import ViewBill from "./components/bills/ViewBill";
import Profile from "./components/common/Profile";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Patient Routes */}
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/add" element={<AddPatient />} />
          <Route path="/patients/:id/edit" element={<EditPatient />} />
          <Route path="/patients/:id" element={<PatientDetails />} />

          {/* Appointment Routes */}
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/appointments/add" element={<AddAppointment />} />
          <Route path="/appointments/:id/edit" element={<EditAppointment />} />

          {/* Medical Records Routes */}
          <Route path="/medical-records/appointment/:appointmentId" element={<ViewMedicalRecord />} />
          <Route path="/medical-records/appointment/:appointmentId/edit" element={<EditMedicalRecord />} />

          {/* Bill Routes */}
          <Route path="/bills" element={<BillList />} />
          <Route path="/bills/:id" element={<ViewBill />} />

          {/* Activity Logs Route */}
          <Route path="/activity-logs" element={<ActivityLogsList />} />

          {/* User/Staff Routes */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/users/:id/edit" element={<EditUser />} />

          {/* Profile Route */}
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
