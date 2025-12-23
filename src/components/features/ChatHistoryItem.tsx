import { Chat } from '@/types/chat';
import { MoreHorizontal } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

interface ChatHistoryItemProps {
  chat: Chat;
  onClick: () => void;
  onUpdate: () => void;
}

export function ChatHistoryItem({ chat, onClick, onUpdate }: ChatHistoryItemProps) {
  const { currentChatId } = useChatStore();
  const isActive = currentChatId === chat.id;

  return (
    <div
      onClick={onClick}
      className={`w-full group flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
        isActive ? 'bg-accent' : 'hover:bg-accent'
      }`}
    >
      <span className="flex-1 truncate text-sm">{chat.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background/50 rounded transition-opacity"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
