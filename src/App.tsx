import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './lib/auth';
import { Sidebar } from './components/layout/Sidebar';
import { ChatPage } from './pages/ChatPage';
import { WelcomePage } from './pages/WelcomePage';
import { AuthPage } from './pages/AuthPage';
import { CreatePasswordPage } from './pages/CreatePasswordPage';
import { VerificationPage } from './pages/VerificationPage';
import { UpgradePage } from './pages/UpgradePage';
import { SharedConversationPage } from './pages/SharedConversationPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { UserMenu } from './components/modals/UserMenu';
import { HelpMenu } from './components/modals/HelpMenu';
import { BugReportModal } from './components/modals/BugReportModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ChatMenu } from './components/modals/ChatMenu';
import { ReportModal } from './components/modals/ReportModal';
import { BugReportModal } from './components/modals/BugReportModal';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {user && <Sidebar />}
      <Routes>
        <Route path="/welcome" element={user ? <Navigate to="/" replace /> : <WelcomePage />} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/create-password" element={user ? <Navigate to="/" replace /> : <CreatePasswordPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/share/:token" element={<SharedConversationPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upgrade"
          element={
            <ProtectedRoute>
              <UpgradePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <ProjectWorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? "/" : "/welcome"} replace />} />
      </Routes>
      {user && (
        <>
          <UserMenu />
          <HelpMenu />
      <BugReportModal />
          <SettingsModal />
          <ChatMenu />
          <ReportModal />
          <BugReportModal />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-center" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
