import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner, ProtectedRoute, PublicRoute } from './components/common';
import useAuthStore from './store/authStore';

// ── Auth ──────────────────────────────────────────────────
const LoginPage          = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/auth/RegisterPage'));
const GoogleCallbackPage = lazy(() => import('./pages/auth/GoogleCallbackPage'));

// ── Admin ─────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./Admin/AdminDashboard'));

// ── Public pages ──────────────────────────────────────────
const LandingPage       = lazy(() => import('./pages/MainSite/LandingPage/LandingPage'));
const PublicJobs        = lazy(() => import('./pages/MainSite/JobsPage'));
const PublicAbout       = lazy(() => import('./pages/MainSite/AboutPage'));
const PricingPage       = lazy(() => import('./pages/Dashboard/PricingPage'));
const PrivacyPage       = lazy(() => import('./pages/MainSite/Privacy'));
const TermsPage         = lazy(() => import('./pages/MainSite/Terms'));
const SupportPage       = lazy(() => import('./pages/MainSite/Support'));
const CookiesPage       = lazy(() => import('./pages/MainSite/Cookies'));
const FAQPage           = lazy(() => import('./pages/MainSite/FAQ'));
const ComingSoon        = lazy(() => import('./pages/MainSite/ComingSoon'));
const NotFound          = lazy(() => import('./pages/MainSite/NotFound'));
const PublicContact     = lazy(() => import('./pages/MainSite/ContactPage'));
const FeaturesPage      = lazy(() => import('./pages/MainSite/Features/FeaturesPage'));
const FeatureDetailPage = lazy(() => import('./pages/MainSite/Features/FeatureDetailPage'));

// ── User Dashboard ────────────────────────────────────────
const DashboardPage  = lazy(() => import('./pages/Dashboard/DashboardPage'));
const ProfilePage    = lazy(() => import('./pages/Dashboard/ProfilePage'));
const SettingsPage   = lazy(() => import('./pages/Dashboard/SettingsPage'));
const CVPage         = lazy(() => import('./components/cv/CVPage'));
const UserJobsPage   = lazy(() => import('./pages/Dashboard/UserJobsPage'));
const DashJobDetail  = lazy(() => import('./pages/Dashboard/JobDetailPage'));
const CommunityPage  = lazy(() => import('./pages/Dashboard/CommunityPage'));
const ChatRoomsPage  = lazy(() => import('./pages/Dashboard/ChatRoomsPage'));
const CareerPathPage = lazy(() => import('./pages/Dashboard/CareerPathPage'));
const CoursesPage    = lazy(() => import('./pages/Dashboard/CoursesPage'));
const InterviewPage  = lazy(() => import('./pages/Dashboard/InterviewPage'));
const WalletPage     = lazy(() => import('./pages/Dashboard/WalletPage'));

// ── Company ───────────────────────────────────────────────
const CompanyRegisterPage      = lazy(() => import('./pages/Company/CompanyRegisterPage'));
const CompanyDashboard         = lazy(() => import('./pages/Company/CompanyDashboard'));
const CompanyJobsPage          = lazy(() => import('./pages/Company/CompanyJobsPage'));
const CompanyApplicantsPage    = lazy(() => import('./pages/Company/CompanyApplicantsPage'));
const CompanyProfilePage       = lazy(() => import('./pages/Company/CompanyProfilePage'));
// const CompanyMembersPage       = lazy(() => import('./pages/Company/CompanyMembersPage'));
const CompanyNotificationsPage = lazy(() => import('./pages/Company/CompanyNotificationsPage'));
const CompanySettingsPage      = lazy(() => import('./pages/Company/CompanySettingsPage'));
const CompanyPipelinesPage     = lazy(() => import('./pages/Company/CompanyPipelinePage'));
const AnalyticsPage            = lazy(() => import('./pages/Company/CompanyAnalyticsPage'));
const CompanyNewJobPage        = lazy(() => import('./pages/Company/CompanyNewJobPage'));

/* ── Helper: where to redirect after login by role ──────── */
export const getDashboardByRole = (role) => {
  switch (role) {
    case 'admin':
    case 'support': return '/admin';
    case 'company': return '/company/dashboard'; // ✅ FIX #4: was '/company/' (no route existed)
    case 'user':    return '/dashboard';
    default:        return '/dashboard';
  }
};

/* ════════════════════════════════════════════════════════════
   APP ROUTES
════════════════════════════════════════════════════════════ */
export default function App() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      checkAuth();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAuthenticated && isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>

        {/* ════════════════════════════════════════════════
            ADMIN
        ════════════════════════════════════════════════ */}
        <Route path="/admin/*"
          element={
            <ProtectedRoute roles={['admin', 'support']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════════════════
            PUBLIC
        ════════════════════════════════════════════════ */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/jobs"            element={<PublicJobs />} />         {/* ✅ FIX #5: was commented out */}
        <Route path="/jobs/:id"        element={<PublicJobs />} />
        <Route path="/about"           element={<PublicAbout />} />
        <Route path="/pricing"         element={<PricingPage />} />
        <Route path="/privacy"         element={<PrivacyPage />} />
        <Route path="/terms"           element={<TermsPage />} />
        <Route path="/support"         element={<SupportPage />} />
        <Route path="/cookies"         element={<CookiesPage />} />
        <Route path="/faq"             element={<FAQPage />} />
        <Route path="/contact"         element={<PublicContact />} />
        <Route path="/features"        element={<FeaturesPage />} />
        <Route path="/features/:slug"  element={<FeatureDetailPage />} />

        {/* ════════════════════════════════════════════════
            AUTH
        ════════════════════════════════════════════════ */}
        <Route path="/login"         element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register"      element={<RegisterPage />} />
        <Route path="/auth/callback" element={<GoogleCallbackPage />} />

        {/* ════════════════════════════════════════════════
            USER DASHBOARD
        ════════════════════════════════════════════════ */}
        <Route path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        <Route path="/dashboard/cvs"
          element={<ProtectedRoute><CVPage /></ProtectedRoute>} />

        <Route path="/dashboard/jobs"
          element={<ProtectedRoute><UserJobsPage /></ProtectedRoute>} />

        <Route path="/dashboard/jobs/:id"
          element={<ProtectedRoute><DashJobDetail /></ProtectedRoute>} />

        <Route path="/dashboard/settings"
          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="/community"
          element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />

        <Route path="/rooms"
          element={<ProtectedRoute><ChatRoomsPage /></ProtectedRoute>} />

        <Route path="/career-path"
          element={<ProtectedRoute><CareerPathPage /></ProtectedRoute>} />

        <Route path="/courses"
          element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />

        <Route path="/interview"
          element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />

        <Route path="/wallet"
          element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />

        {/* ════════════════════════════════════════════════
            COMPANY
        ════════════════════════════════════════════════ */}
        <Route path="/company/register"
          element={<CompanyRegisterPage />} />

        {/* ✅ FIX #4 companion: /company and /company/ both redirect to dashboard */}
        <Route path="/company"
          element={<Navigate to="/company/dashboard" replace />} />

        <Route path="/company/dashboard"
          element={
            <ProtectedRoute roles={['company', 'admin']}>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/company/jobs/new"
          element={
            <ProtectedRoute roles={['company', 'admin']}>
              <CompanyNewJobPage />
            </ProtectedRoute>
          }
        />

        <Route path="/company/jobs"
          element={
            <ProtectedRoute roles={['company', 'admin']}>
              <CompanyJobsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/company/applicants"
          element={
            <ProtectedRoute roles={['company', 'admin']}>
              <CompanyApplicantsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/company/profile"
          element={
            <ProtectedRoute roles={['company', 'admin']}>
              <CompanyProfilePage />
            </ProtectedRoute>
          }
        />

       

        <Route path="/company/notifications"
          element={
            <ProtectedRoute roles={['company', 'admin']}>
              <CompanyNotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/company/settings"
          element={
            <ProtectedRoute roles={['company', 'admin']}>
              <CompanySettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/company/pipeline"
          element={
            <ProtectedRoute roles={['company', 'admin']}>
              <CompanyPipelinesPage />
            </ProtectedRoute>
          }
        />

        <Route path="/company/analytics"
          element={
            <ProtectedRoute roles={['company', 'admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════════════════
            404
        ════════════════════════════════════════════════ */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
}