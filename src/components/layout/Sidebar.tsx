import { Menu, X, Search, Plus, Image, Grid3x3, FolderOpen, LogIn } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useAuth } from '@/lib/auth';
import { chatService } from '@/lib/chatService';
import { useQuery } from '@tanstack/react-query';
import { ChatHistoryItem } from '../features/ChatHistoryItem';
import { useNavigate } from 'react-router-dom';

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar, setSidebarOpen, setCurrentChatId, setMessages } = useChatStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: chats = [], refetch } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: () => chatService.getChats(user!.id),
    enabled: !!user,
  });

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleChatClick = async (chatId: string) => {
    setCurrentChatId(chatId);
    const messages = await chatService.getChatMessages(chatId);
    setMessages(messages);
    setSidebarOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">HC</span>
            </div>
            <span className="font-semibold">Haitian ChatGPT</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-3 space-y-2 border-b border-border">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Plus className="w-5 h-5" />
            <span>New chat</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Search className="w-5 h-5" />
            <span>Search chats</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Image className="w-5 h-5" />
            <span>Images</span>
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">NEW</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Grid3x3 className="w-5 h-5" />
            <span>Apps</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <FolderOpen className="w-5 h-5" />
            <span>Projects</span>
          </button>

          {!user && (
            <button
              onClick={handleLogin}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors text-left font-medium"
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Chat History */}
        {user && (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-3">
              <div className="text-xs text-muted-foreground px-3 py-2 font-medium">Your chats</div>
              <div className="space-y-1">
                {chats.map((chat) => (
                  <ChatHistoryItem
                    key={chat.id}
                    chat={chat}
                    onClick={() => handleChatClick(chat.id)}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
