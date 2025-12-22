import { Menu, MoreVertical, ChevronDown, Sparkles, User } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useModalStore } from '@/stores/modalStore';
import { useAuth } from '@/lib/auth';

export function ChatHeader() {
  const { toggleSidebar } = useChatStore();
  const { setUserMenuOpen, setChatMenuOpen } = useModalStore();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-lg transition-colors">
            <span className="font-semibold">Haitian ChatGPT</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <button className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:opacity-90 transition-opacity">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Get Plus</span>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => setUserMenuOpen(true)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>
          )}

          <button
            onClick={() => setChatMenuOpen(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
