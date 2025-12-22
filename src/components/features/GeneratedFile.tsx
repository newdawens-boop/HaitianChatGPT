import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useModalStore } from '@/stores/modalStore';

interface GeneratedFileProps {
  fileName: string;
  fileContent: string;
  fileType: string;
}

export function GeneratedFile({ fileName, fileContent, fileType }: GeneratedFileProps) {
  const { setFileViewerOpen, setCurrentFile } = useModalStore();

  const handleDownload = () => {
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const handleOpenFile = () => {
    setCurrentFile({ name: fileName, content: fileContent, type: fileType });
    setFileViewerOpen(true);
  };

  return (
    <div className="my-4">
      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <button
            onClick={handleOpenFile}
            className="font-medium hover:underline text-left"
          >
            👉 Download the file: {fileName}
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {fileType} • {(fileContent.length / 1024).toFixed(2)} KB
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            You can create and edit files in many formats, including Python, Java, HTML, CSS, JavaScript, JSX, TXT, CSV, and more.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
