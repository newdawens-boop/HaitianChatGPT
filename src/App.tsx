import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './lib/auth';
import { Sidebar } from './components/layout/Sidebar';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';
import { UpgradePage } from './pages/UpgradePage';
import { UserMenu } from './components/modals/UserMenu';
import { HelpMenu } from './components/modals/HelpMenu';
import { SettingsModal } from './components/modals/SettingsModal';
import { ChatMenu } from './components/modals/ChatMenu';
import { ReportModal } from './components/modals/ReportModal';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="relative">
            <Sidebar />
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/upgrade" element={<UpgradePage />} />
            </Routes>
            <UserMenu />
            <HelpMenu />
            <SettingsModal />
            <ChatMenu />
            <ReportModal />
            <Toaster position="top-center" />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
