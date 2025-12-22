import { X, Share2, Search } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { toast } from 'sonner';

interface FileViewerModalProps {
  fileName: string;
  fileContent: string;
  fileType: string;
}

export function FileViewerModal({ fileName, fileContent, fileType }: FileViewerModalProps) {
  const { isFileViewerOpen, setFileViewerOpen } = useModalStore();

  if (!isFileViewerOpen) return null;

  const handleSave = () => {
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const file = new File([blob], fileName, { type: 'text/plain' });
        await navigator.share({
          title: fileName,
          files: [file],
        });
      } catch (err) {
        // Fallback to copying content
        await navigator.clipboard.writeText(fileContent);
        toast.success('File content copied');
      }
    } else {
      await navigator.clipboard.writeText(fileContent);
      toast.success('File content copied');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => setFileViewerOpen(false)}
          className="w-10 h-10 flex items-center justify-center"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="font-medium truncate">{fileName}</h2>
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm whitespace-pre-wrap font-mono">
          {fileContent}
        </pre>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-around p-4 border-t border-border">
        <button
          onClick={handleSave}
          className="flex flex-col items-center gap-1 px-4 py-2"
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </div>
          <span className="text-xs">Save</span>
        </button>
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 px-4 py-2"
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-xs">Share</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-4 py-2">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <span className="text-xs">Search</span>
        </button>
      </div>
    </div>
  );
}
