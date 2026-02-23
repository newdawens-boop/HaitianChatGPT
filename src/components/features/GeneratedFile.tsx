import { Download } from 'lucide-react';
import { FileDownloadModal } from '../modals/FileDownloadModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface GeneratedFileProps {
  fileName: string;
  fileContent: string;
  fileType: string;
}

export function GeneratedFile({ fileName, fileContent, fileType }: GeneratedFileProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-muted rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold text-sm">{fileName}</p>
            <p className="text-xs text-muted-foreground uppercase">{fileType} File</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowModal(true)}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <FileDownloadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        fileName={fileName}
        fileContent={fileContent}
        fileType={fileType}
      />
    </>
  );
}
