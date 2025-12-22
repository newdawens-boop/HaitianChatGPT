import { X } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { useState } from 'react';
import { toast } from 'sonner';

export function ReportModal() {
  const { isReportOpen, setReportOpen } = useModalStore();
  const [selectedReason, setSelectedReason] = useState('');

  if (!isReportOpen) return null;

  const reportReasons = [
    'Violence & self-harm',
    'Sexual exploitation & abuse',
    'Child/teen exploitation',
    'Bullying & harassment',
    'Spam, fraud & deception',
    'Privacy violation',
    'Intellectual property',
    'Age-inappropriate content',
    'Something else',
  ];

  const handleSubmit = () => {
    if (selectedReason) {
      toast.success('Report submitted successfully');
      setReportOpen(false);
      setSelectedReason('');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={() => setReportOpen(false)}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl z-50 animate-fadeIn overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Report a conversation</h2>
          <button
            onClick={() => setReportOpen(false)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="font-medium mb-4">Why are you reporting this conversation?</p>
          <div className="space-y-2">
            {reportReasons.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedReason}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              selectedReason
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
