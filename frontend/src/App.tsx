import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/layout/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import LanguageSelect from "@/pages/LanguageSelect";
import VerifyEmail from "@/pages/VerifyEmail";
import CheckEmail from "@/pages/CheckEmail";

// Lazy-loaded pages (code splitting)
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Workouts = lazy(() => import("@/pages/Workouts"));
const ProgramBuilder = lazy(() => import("@/pages/ProgramBuilder"));
const SessionLogger = lazy(() => import("@/pages/SessionLogger"));
const BodyTracking = lazy(() => import("@/pages/BodyTracking"));
const Nutrition = lazy(() => import("@/pages/Nutrition"));
const RecipesPage = lazy(() => import("@/pages/Recipes"));
const Notes = lazy(() => import("@/pages/Notes"));
const Community = lazy(() => import("@/pages/Community"));
const Activity = lazy(() => import("@/pages/Activity"));
const Planning = lazy(() => import("@/pages/Planning"));
const Records = lazy(() => import("@/pages/Records"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const Statistics = lazy(() => import("@/pages/Statistics"));
const Profile = lazy(() => import("@/pages/Profile"));
const Timers = lazy(() => import("@/pages/Timers"));
const NotificationsSettings = lazy(() => import("@/pages/NotificationsSettings"));
const Admin = lazy(() => import("@/pages/Admin"));

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

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="live-dot scale-150" />
      </div>
    );
  }
  if (!isAuthenticated || !user?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center gap-4">
        <p className="text-6xl font-display font-bold text-onair-muted/20">404</p>
        <p className="text-onair-muted">Cette page n'existe pas.</p>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  const { fetchUser } = useAuthStore();
  const { resolvedTheme } = useThemeStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const isDark = resolvedTheme === "dark";

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
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="live-dot scale-150" /></div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/language" element={<LanguageSelect />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/check-email" element={<CheckEmail />} />
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
              <Route path="timers" element={<Timers />} />
              <Route path="tabata" element={<Navigate to="/timers" replace />} />
              <Route path="workouts/new" element={<ProgramBuilder />} />
              <Route path="workouts/program/:id" element={<ProgramBuilder />} />
              <Route path="workouts/session" element={<SessionLogger />} />
              <Route path="workouts/session/:id" element={<SessionLogger />} />
              <Route path="planning" element={<Planning />} />
              <Route path="records" element={<Records />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="activity" element={<Activity />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="body" element={<BodyTracking />} />
              <Route path="nutrition" element={<Nutrition />} />
              <Route path="recipes" element={<RecipesPage />} />
              <Route path="notes" element={<Notes />} />
              <Route path="community" element={<Community />} />
              <Route path="notifications" element={<NotificationsSettings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
