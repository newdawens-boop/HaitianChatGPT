import { X, ChevronLeft, ChevronRight, RotateCw, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface WebViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export function WebViewModal({ isOpen, onClose, url }: WebViewModalProps) {
  const [loading, setLoading] = useState(true);

  if (!isOpen) return null;

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRefresh = () => {
    const iframe = document.getElementById('web-view-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-sm text-muted-foreground truncate flex-1">
            {url}
          </p>
        </div>
      </div>

      {/* WebView */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          id="web-view-iframe"
          src={url}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-around px-4 py-3 border-t">
        <button
          onClick={() => window.history.back()}
          className="w-11 h-11 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => window.history.forward()}
          className="w-11 h-11 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          onClick={handleRefresh}
          className="w-11 h-11 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          <RotateCw className="w-6 h-6" />
        </button>

        <button
          onClick={handleOpenExternal}
          className="w-11 h-11 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ExternalLink className="w-6 h-6" />
        </button>

        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
