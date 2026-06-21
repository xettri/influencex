import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/PageLoader";
import { Toaster } from "@/components/Toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Route-level code splitting — each page is its own JS chunk
const LandingPage = lazy(() =>
  import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import("@/pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const CreateCampaignPage = lazy(() =>
  import("@/pages/dashboard/CreateCampaignPage").then((m) => ({ default: m.CreateCampaignPage }))
);
const ExplorePage = lazy(() =>
  import("@/pages/dashboard/ExplorePage").then((m) => ({ default: m.ExplorePage }))
);

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/dashboard"
              element={<DashboardShell><DashboardPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/campaigns/new"
              element={<DashboardShell><CreateCampaignPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/explore"
              element={<DashboardShell><ExplorePage /></DashboardShell>}
            />
            <Route
              path="/dashboard/*"
              element={<DashboardShell><DashboardPage /></DashboardShell>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
