import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { InstallPWA } from "@/components/InstallPWA";
import Layout from "@/components/layout/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import LanguageSelect from "@/pages/LanguageSelect";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import ProgramBuilder from "@/pages/ProgramBuilder";
import SessionLogger from "@/pages/SessionLogger";
import BodyTracking from "@/pages/BodyTracking";
import Nutrition from "@/pages/Nutrition";
import Community from "@/pages/Community";
import Activity from "@/pages/Activity";
import Statistics from "@/pages/Statistics";
import Profile from "@/pages/Profile";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="live-dot scale-150" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  const isDark = theme === "dark";

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? "#1a1a2e" : "#ffffff",
            color: isDark ? "#e8e8ed" : "#1d1d1f",
            border: `1px solid ${isDark ? "#2a2a3e" : "#e5e5ea"}`,
            borderRadius: "12px",
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.4)"
              : "0 4px 24px rgba(0,0,0,0.08)",
          },
        }}
      />
      <InstallPWA />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/language" element={<LanguageSelect />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="workouts/new" element={<ProgramBuilder />} />
          <Route path="workouts/program/:id" element={<ProgramBuilder />} />
          <Route path="workouts/session" element={<SessionLogger />} />
          <Route path="workouts/session/:id" element={<SessionLogger />} />
          <Route path="activity" element={<Activity />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="body" element={<BodyTracking />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
