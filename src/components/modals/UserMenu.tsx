import { Sparkles, Palette, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const { isUserMenuOpen, setUserMenuOpen, setHelpMenuOpen, setSettingsOpen } = useModalStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isUserMenuOpen) return null;

  const handleHelpClick = () => {
    setUserMenuOpen(false);
    setHelpMenuOpen(true);
  };

  const handleSettingsClick = () => {
    setUserMenuOpen(false);
    setSettingsOpen(true);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-fadeIn"
        onClick={() => setUserMenuOpen(false)}
      />
      <div className="fixed top-16 right-4 w-80 bg-popover border border-border rounded-2xl shadow-2xl z-50 animate-fadeIn overflow-hidden">
        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{user?.username || 'User'}</div>
              <div className="text-sm text-muted-foreground">@{user?.username?.toLowerCase() || 'user'}</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <button
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/upgrade');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Sparkles className="w-5 h-5" />
            <span>Upgrade plan</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Palette className="w-5 h-5" />
            <span>Personalization</span>
          </button>

          <button
            onClick={handleSettingsClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>

        <div className="border-t border-border p-2">
          <button
            onClick={handleHelpClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Help</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-xs">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-sm font-medium">{user?.username || 'User'}</div>
              <div className="text-xs text-muted-foreground">Free</div>
            </div>
          </div>
          <button
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/upgrade');
            }}
            className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
          >
            Upgrade
          </button>
        </div>
      </div>
    </>
  );
}
