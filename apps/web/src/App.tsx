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
const InfluencersPage = lazy(() =>
  import("@/pages/dashboard/InfluencersPage").then((m) => ({ default: m.InfluencersPage }))
);
const InfluencerProfilePage = lazy(() =>
  import("@/pages/dashboard/InfluencerProfilePage").then((m) => ({ default: m.InfluencerProfilePage }))
);
const HirePage = lazy(() =>
  import("@/pages/dashboard/HirePage").then((m) => ({ default: m.HirePage }))
);
const HiresPage = lazy(() =>
  import("@/pages/dashboard/HiresPage").then((m) => ({ default: m.HiresPage }))
);
const ProfileSetupPage = lazy(() =>
  import("@/pages/dashboard/ProfileSetupPage").then((m) => ({ default: m.ProfileSetupPage }))
);
const CampaignDetailPage = lazy(() =>
  import("@/pages/dashboard/CampaignDetailPage").then((m) => ({ default: m.CampaignDetailPage }))
);
const CampaignsPage = lazy(() =>
  import("@/pages/dashboard/CampaignsPage").then((m) => ({ default: m.CampaignsPage }))
);
const ApplicationsPage = lazy(() =>
  import("@/pages/dashboard/ApplicationsPage").then((m) => ({ default: m.ApplicationsPage }))
);
const AdminVerificationsPage = lazy(() =>
  import("@/pages/admin/AdminVerificationsPage").then((m) => ({ default: m.AdminVerificationsPage }))
);
const NotificationsPage = lazy(() =>
  import("@/pages/dashboard/NotificationsPage").then((m) => ({ default: m.NotificationsPage }))
);
const AnalyticsPage = lazy(() =>
  import("@/pages/dashboard/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage }))
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
              path="/dashboard/campaigns"
              element={<DashboardShell><CampaignsPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/campaigns/:id"
              element={<DashboardShell><CampaignDetailPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/applications"
              element={<DashboardShell><ApplicationsPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/explore"
              element={<DashboardShell><ExplorePage /></DashboardShell>}
            />
            <Route
              path="/dashboard/influencers"
              element={<DashboardShell><InfluencersPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/influencers/:id"
              element={<DashboardShell><InfluencerProfilePage /></DashboardShell>}
            />
            <Route
              path="/dashboard/hire/:influencerId"
              element={<DashboardShell><HirePage /></DashboardShell>}
            />
            <Route
              path="/dashboard/hires"
              element={<DashboardShell><HiresPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/profile"
              element={<DashboardShell><ProfileSetupPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/notifications"
              element={<DashboardShell><NotificationsPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/analytics"
              element={<DashboardShell><AnalyticsPage /></DashboardShell>}
            />
            <Route
              path="/dashboard/*"
              element={<DashboardShell><DashboardPage /></DashboardShell>}
            />
            <Route
              path="/admin/verifications"
              element={<DashboardShell><AdminVerificationsPage /></DashboardShell>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
