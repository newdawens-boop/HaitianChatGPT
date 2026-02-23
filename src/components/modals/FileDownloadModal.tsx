import { X, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileContent: string;
  fileType: string;
}

export function FileDownloadModal({ isOpen, onClose, fileName, fileContent, fileType }: FileDownloadModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('File downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const file = new File([blob], fileName, { type: 'text/plain' });
        await navigator.share({
          files: [file],
          title: fileName,
        });
      } catch (err) {
        // User cancelled or not supported
        navigator.clipboard.writeText(fileContent);
        toast.success('Content copied to clipboard');
      }
    } else {
      navigator.clipboard.writeText(fileContent);
      toast.success('Content copied to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-base font-medium flex-1 text-center truncate px-4">
          {fileName}
        </h2>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-muted px-4 py-3 border-b">
          <p className="font-semibold text-sm">{fileName}</p>
          <p className="text-xs text-muted-foreground uppercase">{fileType} File</p>
        </div>

        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Preview</p>
          <div className="bg-card rounded-lg p-4 border">
            <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words">
              {fileContent}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 p-4 border-t">
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex-1 h-12"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>

        <Button
          onClick={handleDownload}
          className="flex-1 h-12"
        >
          <Download className="w-5 h-5 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}
