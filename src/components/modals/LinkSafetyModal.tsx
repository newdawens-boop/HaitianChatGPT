import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface LinkSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onOpenLink: (url: string) => void;
}

export function LinkSafetyModal({ isOpen, onClose, url, onOpenLink }: LinkSafetyModalProps) {
  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
    onClose();
  };

  const handleOpenLink = () => {
    onOpenLink(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-background rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <h2 className="text-2xl font-semibold text-center mb-3">
          Check this link is safe
        </h2>

        <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
          Some sites restrict our ability to check links. This link isn't verified and may include information from your conversation that could be shared with a third-party site. Make sure you trust this link before proceeding.
        </p>

        {/* URL Display */}
        <div className="bg-muted rounded-xl p-4 mb-6">
          <p className="text-sm text-primary text-center break-all line-clamp-3">
            {url}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleOpenLink}
            className="w-full h-12 text-base font-semibold bg-black hover:bg-black/90 text-white"
          >
            Open link
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full h-12 text-base font-semibold"
          >
            Copy link
          </Button>

          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
}
