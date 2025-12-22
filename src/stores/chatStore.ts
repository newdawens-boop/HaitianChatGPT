import { create } from 'zustand';
import { Message, Chat } from '@/types/chat';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  selectedModel: string;
  loadingStatus: string | null;
  editingMessageId: string | null;
  setChats: (chats: Chat[]) => void;
  setCurrentChatId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  removeMessagesFrom: (messageId: string) => void;
  setIsLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedModel: (model: string) => void;
  setLoadingStatus: (status: string | null) => void;
  setEditingMessageId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  currentChatId: null,
  messages: [],
  isLoading: false,
  isSidebarOpen: false,
  selectedModel: 'sonnet-4.5',
  loadingStatus: null,
  editingMessageId: null,
  setChats: (chats) => set({ chats }),
  setCurrentChatId: (id) => set({ currentChatId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  removeMessagesFrom: (messageId) => set((state) => {
    const index = state.messages.findIndex(m => m.id === messageId);
    return { messages: index >= 0 ? state.messages.slice(0, index) : state.messages };
  }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setLoadingStatus: (status) => set({ loadingStatus: status }),
  setEditingMessageId: (id) => set({ editingMessageId: id }),
}));
