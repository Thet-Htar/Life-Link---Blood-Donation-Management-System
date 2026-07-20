import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Auth Components
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import DonorRegister from "@/pages/auth/DonorRegister";

// Dashboard / Layout Components
import DonorDashboard from "@/pages/donor/DonorDashboard";
import HospitalDashboard from "@/pages/hospital/HospitalDashboard";

// Sub-page Components
import DonorEventsPage from "@/pages/donor/components/DonorEventPage";
import DonorProfileCard from "@/pages/donor/components/DonorProfileCard";
import HospitalEventDetailsPage from "@/pages/hospital/components/HospitalEventDetailsPage";
import CertificateDetailsPage from "@/pages/donor/components/CertificateDetailsPage";
import MyCertificatesPage from "@/pages/donor/components/MyCertificatePage";
import HospitalCertificateDetailsPage from "@/pages/hospital/components/HospitalCertificateDetailsPage";
import HospitalInventoryDetailsPage from "@/pages/hospital/components/HospitalInventoryDetailsPage";
import DonorPrivateBookingPage from "@/pages/donor/components/DonorPrivateBookingPage";
import HospitalPrivateBookingPage from "@/pages/hospital/components/HospitalPrivateBookingPage";
import AdminDashboardOverview from "@/pages/admin/AdminDashboardOverview";
import AdminHospitalApprovalsPage from "@/pages/admin/AdminHospitalApprovalsPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminHospitalsPage from "@/pages/admin/AdminHospitalsPage";
import AdminDonorsPage from "@/pages/admin/AdminDonorsPage";
import Home from "@/pages/homePage/Home";
import AboutUsPage from "@/pages/homePage/AboutUs";
import Logout from "./Logout";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donor-register" element={<DonorRegister />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/logout" element={<Logout />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboardOverview />} />

          <Route path="approvals" element={<AdminHospitalApprovalsPage />} />

          <Route path="hospitals" element={<AdminHospitalsPage />} />

          <Route path="donors" element={<AdminDonorsPage />} />
        </Route>

        {/* Donor routes */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute>
              <DonorDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="events" element={<DonorEventsPage />} />
          <Route
            path="private-bookings"
            element={<DonorPrivateBookingPage />}
          />

          <Route
            path="/donor/certificates"
            element={
              <ProtectedRoute>
                <MyCertificatesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donor/certificates/:certificateId"
            element={
              <ProtectedRoute>
                <CertificateDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route path="profile" element={<DonorProfileCard profile={null} />} />
        </Route>

        <Route
          path="/donor-dashboard"
          element={<Navigate to="/donor" replace />}
        />

        {/* Hospital routes */}
        <Route
          path="/hospital"
          element={
            <ProtectedRoute>
              <HospitalDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={null} />

          <Route path="events" element={null} />

          <Route
            path="events/:eventId"
            element={<HospitalEventDetailsPage />}
          />

          <Route path="bookings" element={null} />

          <Route path="certificates" element={null} />

          <Route
            path="certificates/:certificateId"
            element={<HospitalCertificateDetailsPage />}
          />

          <Route path="inventory" element={null} />

          <Route
            path="inventory/details"
            element={<HospitalInventoryDetailsPage />}
          />

          <Route path="/hospital/profile" element={<HospitalDashboard />} />
        </Route>

        {/* Unknown route fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
