import { Share2, Users, Pin, Archive, Flag, Trash2, Check } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { useChatStore } from '@/stores/chatStore';
import { shareService } from '@/lib/shareService';
import { toast } from 'sonner';
import { useState } from 'react';

export function ChatMenu() {
  const { isChatMenuOpen, setChatMenuOpen, setReportOpen } = useModalStore();
  const { currentChatId } = useChatStore();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCreatingShare, setIsCreatingShare] = useState(false);

  if (!isChatMenuOpen) return null;

  const handleReportClick = () => {
    setChatMenuOpen(false);
    setReportOpen(true);
  };

  const handleShare = async () => {
    if (!currentChatId) return;
    
    setIsCreatingShare(true);
    const token = await shareService.createShareLink(currentChatId);
    
    if (token) {
      const url = shareService.getShareUrl(token);
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard!');
    } else {
      toast.error('Failed to create share link');
    }
    
    setIsCreatingShare(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-fadeIn"
        onClick={() => setChatMenuOpen(false)}
      />
      <div className="fixed top-16 right-4 w-64 bg-popover border border-border rounded-2xl shadow-2xl z-50 animate-fadeIn overflow-hidden">
        <div className="p-2">
          <button 
            onClick={handleShare}
            disabled={isCreatingShare}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left disabled:opacity-50"
          >
            {shareUrl ? <Check className="w-5 h-5 text-primary" /> : <Share2 className="w-5 h-5" />}
            <span>{shareUrl ? 'Link copied!' : isCreatingShare ? 'Creating link...' : 'Share'}</span>
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
