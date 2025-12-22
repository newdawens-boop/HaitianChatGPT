import { Share2, Users, Pin, Archive, Flag, Trash2 } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';

export function ChatMenu() {
  const { isChatMenuOpen, setChatMenuOpen, setReportOpen } = useModalStore();

  if (!isChatMenuOpen) return null;

  const handleReportClick = () => {
    setChatMenuOpen(false);
    setReportOpen(true);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-fadeIn"
        onClick={() => setChatMenuOpen(false)}
      />
      <div className="fixed top-16 right-4 w-64 bg-popover border border-border rounded-2xl shadow-2xl z-50 animate-fadeIn overflow-hidden">
        <div className="p-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Users className="w-5 h-5" />
            <span>Start a group chat</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Pin className="w-5 h-5" />
            <span>Pin chat</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Archive className="w-5 h-5" />
            <span>Archive</span>
          </button>

          <button
            onClick={handleReportClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Flag className="w-5 h-5" />
            <span>Report</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors text-left">
            <Trash2 className="w-5 h-5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </>
  );
}
