import { RotateCw, Plus, Minus, Globe, Lightbulb, Volume2, Flag, GitBranch } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';

interface MessageActionsMenuProps {
  messageId: string;
  onTryAgain: () => void;
  onAddDetails: () => void;
  onMoreConcise: () => void;
  onReadAloud: () => void;
  position: { x: number; y: number };
}

export function MessageActionsMenu({
  messageId,
  onTryAgain,
  onAddDetails,
  onMoreConcise,
  onReadAloud,
  position,
}: MessageActionsMenuProps) {
  const { setReportOpen, setMessageActionsOpen } = useModalStore();

  const handleReportClick = () => {
    setMessageActionsOpen(false);
    setReportOpen(true);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        onClick={() => setMessageActionsOpen(false)}
      />
      <div
        className="fixed w-72 bg-popover border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        <div className="p-2">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            Ask to change response
          </div>

          <button
            onClick={() => {
              onTryAgain();
              setMessageActionsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <RotateCw className="w-5 h-5" />
            <span>Try again</span>
          </button>

          <button
            onClick={() => {
              onAddDetails();
              setMessageActionsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Plus className="w-5 h-5" />
            <span>Add details</span>
          </button>

          <button
            onClick={() => {
              onMoreConcise();
              setMessageActionsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Minus className="w-5 h-5" />
            <span>More concise</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Globe className="w-5 h-5" />
            <span>Search the web</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Lightbulb className="w-5 h-5" />
            <span>Think longer</span>
          </button>

          <div className="my-2 border-t border-border" />

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <GitBranch className="w-5 h-5" />
            <span>Branch in new chat</span>
          </button>

          <button
            onClick={() => {
              onReadAloud();
              setMessageActionsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Volume2 className="w-5 h-5" />
            <span>Read aloud</span>
          </button>

          <button
            onClick={handleReportClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Flag className="w-5 h-5" />
            <span>Report message</span>
          </button>
        </div>
      </div>
    </>
  );
}
