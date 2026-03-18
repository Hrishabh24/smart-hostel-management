import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./Login";
import AdminLogin from "./pages/admin/AdminLogin";
import Signup from "./Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Complaints from "./pages/Complaints";
import Room from "./pages/Room";
import Leave from "./pages/Leave";
import Notifications from "./pages/Notifications";
import QRDisplay from "./pages/QRDisplay";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ContactSupport from "./pages/ContactSupport";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminFees from "./pages/admin/AdminFees";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminWardens from "./pages/admin/AdminWardens";
import AdminParents from "./pages/admin/AdminParents";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import WardenLayout from "./pages/warden/WardenLayout";
import WardenDashboard from "./pages/warden/WardenDashboard";
import WardenStudents from "./pages/warden/WardenStudents";
import WardenAttendance from "./pages/warden/WardenAttendance";
import WardenComplaints from "./pages/warden/WardenComplaints";
import WardenLeaveApproval from "./pages/warden/WardenLeaveApproval";
import WardenReports from "./pages/warden/WardenReports";
import WardenRooms from "./pages/warden/WardenRooms";
import ParentLayout from "./pages/parent/ParentLayout";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentFees from "./pages/parent/ParentFees";
import ParentLeave from "./pages/parent/ParentLeave";
import ParentNotifications from "./pages/parent/ParentNotifications";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/qr-display" element={<QRDisplay />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute allowedRole="student">
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRole="student">
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fees"
          element={
            <ProtectedRoute allowedRole="student">
              <Fees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaints"
          element={
            <ProtectedRoute allowedRole="student">
              <Complaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room"
          element={
            <ProtectedRoute allowedRole="student">
              <Room />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave"
          element={
            <ProtectedRoute allowedRole="student">
              <Leave />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRole="student">
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/support"
          element={
            <ProtectedRoute allowedRole="student">
              <ContactSupport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="fees" element={<AdminFees />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="wardens" element={<AdminWardens />} />
          <Route path="parents" element={<AdminParents />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} />
        </Route>

        <Route
          path="/warden-dashboard"
          element={
            <ProtectedRoute allowedRole="warden">
              <WardenLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WardenDashboard />} />
          <Route path="students" element={<WardenStudents />} />
          <Route path="attendance" element={<WardenAttendance />} />
          <Route path="complaints" element={<WardenComplaints />} />
          <Route path="leave-approval" element={<WardenLeaveApproval />} />
          <Route path="reports" element={<WardenReports />} />
          <Route path="rooms" element={<WardenRooms />} />
          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} />
        </Route>

        <Route
          path="/parent-dashboard"
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ParentDashboard />} />
          <Route path="attendance" element={<ParentAttendance />} />
          <Route path="fees" element={<ParentFees />} />
          <Route path="leave" element={<ParentLeave />} />
          <Route path="notifications" element={<ParentNotifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
