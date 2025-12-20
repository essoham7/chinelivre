import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LoginForm } from "./components/auth/LoginForm";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ClientDashboard } from "./components/client/ClientDashboard";

import { UserRole } from "./lib/supabase";
import { ProfileForm } from "./components/profile/ProfileForm";
import NotificationDashboard from "./components/admin/NotificationDashboard";
import NotificationForm from "./components/admin/NotificationForm";
import NotificationSend from "./components/admin/NotificationSend";
import ClientNotifications from "./components/notifications/ClientNotifications";
import { Layout } from "./components/layout/Layout";
import { Splash } from "./components/pwa/Splash";

function App() {
  const { user, role, loading, checkUser } = useAuthStore();

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getDashboardRoute = () => {
    if (!user) return "/login";
    return role === "admin" ? "/admin/dashboard" : "/client/dashboard";
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Splash />
        <Routes>
          <Route
            path="/"
            element={<Navigate to={getDashboardRoute()} replace />}
          />

          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={getDashboardRoute()} replace />
              ) : (
                <div className="min-h-screen flex items-center justify-center">
                  <LoginForm />
                </div>
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/client/dashboard" replace />
              ) : (
                <div className="min-h-screen flex items-center justify-center">
                  <LoginForm defaultRole="client" />
                </div>
              )
            }
          />

          {/* Authenticated Routes with Layout */}
          <Route element={<Layout />}>
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="profile" element={<ProfileForm />} />
                    <Route
                      path="notifications"
                      element={<NotificationDashboard />}
                    />
                    <Route
                      path="notifications/create"
                      element={<NotificationForm />}
                    />
                    <Route
                      path="notifications/edit/:id"
                      element={<NotificationForm />}
                    />
                    <Route
                      path="notifications/send/:id"
                      element={<NotificationSend />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/admin/dashboard" replace />}
                    />
                  </Routes>
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/*"
              element={
                <ProtectedRoute requiredRole="client">
                  <Routes>
                    <Route path="dashboard" element={<ClientDashboard />} />
                    <Route path="profile" element={<ProfileForm />} />
                    <Route
                      path="notifications"
                      element={<ClientNotifications />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/client/dashboard" replace />}
                    />
                  </Routes>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredRole={"client" as UserRole}>
                  <ProfileForm />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Accès non autorisé
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Vous n'avez pas les permissions nécessaires pour accéder à
                    cette page.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Retour
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
