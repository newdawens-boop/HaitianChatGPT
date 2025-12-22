import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { settingsService } from '@/lib/settingsService';
import { toast } from 'sonner';
import { Download, Archive, Trash2 } from 'lucide-react';

export function DataControlsSettings() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    const blob = await settingsService.exportData(user.id);
    
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `haitian-chatgpt-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } else {
      toast.error('Failed to export data');
    }
    
    setIsExporting(false);
  };

  const handleArchiveAll = async () => {
    if (!user) return;
    
    const success = await settingsService.archiveAllChats(user.id);
    if (success) {
      toast.success('All chats archived');
    } else {
      toast.error('Failed to archive chats');
    }
  };

  const handleDeleteAll = async () => {
    if (!user) return;
    
    const success = await settingsService.deleteAllChats(user.id);
    if (success) {
      toast.success('All chats deleted');
      setShowDeleteConfirm(false);
    } else {
      toast.error('Failed to delete chats');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Data controls</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <div className="font-medium">Improve the model for everyone</div>
            <div className="text-sm text-muted-foreground">
              Allow your conversations to be used to improve our models
            </div>
          </div>
          <button className="px-4 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
            <span>On</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <div className="font-medium">Shared links</div>
          </div>
          <button className="px-4 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors">
            Manage
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <div className="font-medium">Archived chats</div>
          </div>
          <button className="px-4 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors">
            Manage
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <div className="font-medium">Archive all chats</div>
          </div>
          <button
            onClick={handleArchiveAll}
            className="px-4 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            Archive all
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <div className="font-medium">Delete all chats</div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-1.5 text-sm border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete all
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium">Export data</div>
          </div>
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="px-4 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl z-[61] p-6">
            <h3 className="text-xl font-semibold mb-3">Delete all chats?</h3>
            <p className="text-muted-foreground mb-6">
              This will permanently delete all your chats. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Delete all
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
