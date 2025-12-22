import { X } from 'lucide-react';
import { useState } from 'react';
import { useModalStore } from '@/stores/modalStore';
import { toast } from 'sonner';

export function BugReportModal() {
  const { isBugReportOpen, setBugReportOpen } = useModalStore();
  const [description, setDescription] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [includeShake, setIncludeShake] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isBugReportOpen) return null;

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, send to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Bug report submitted successfully');
      setBugReportOpen(false);
      setDescription('');
    } catch (error) {
      toast.error('Failed to submit bug report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={() => setBugReportOpen(false)}
      />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 w-auto md:w-[500px] max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 animate-fadeIn overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Report bug</h2>
            <button
              onClick={() => setBugReportOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">What happened?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about the issue you encountered"
              maxLength={2000}
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 focus:outline-none resize-none"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {description.length} / 2000
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Any information you share may be reviewed to help improve Haitian ChatGPT. If you have additional questions,{' '}
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              contact support
            </button>
            .
          </p>

          {/* Include screenshot toggle */}
          <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium">Include screenshot in report</span>
            <button
              onClick={() => setIncludeScreenshot(!includeScreenshot)}
              className={`w-12 h-6 rounded-full transition-colors ${
                includeScreenshot ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  includeScreenshot ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Screenshot preview */}
          {includeScreenshot && (
            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-500">Screenshot preview</span>
              </div>
            </div>
          )}

          {/* Shake to report toggle */}
          <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="text-sm font-medium">Shake device to report a bug</div>
              <div className="text-xs text-gray-500 mt-0.5">Toggle off to disable</div>
            </div>
            <button
              onClick={() => setIncludeShake(!includeShake)}
              className={`w-12 h-6 rounded-full transition-colors ${
                includeShake ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  includeShake ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !description.trim()}
            className="w-full mt-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </>
  );
}
