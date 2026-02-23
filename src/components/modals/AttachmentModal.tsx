import { X, Camera, Image, FileText, MessageSquare, Phone, Box, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPickMedia?: (files: File[]) => void;
}

export function AttachmentModal({ isOpen, onClose, onPickMedia }: AttachmentModalProps) {
  const navigate = useNavigate();
  const [showWebSearchOptions, setShowWebSearchOptions] = useState(false);
  const [webSearchMode, setWebSearchMode] = useState<'auto' | 'off'>('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const tools = [
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      gradient: 'from-purple-500 to-purple-700',
      action: () => {
        // In web, trigger file input with camera
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          onPickMedia?.(files);
          onClose();
        };
        input.click();
      },
    },
    {
      id: 'photos',
      label: 'Photos',
      icon: Image,
      gradient: 'from-pink-500 to-red-500',
      action: () => {
        imageInputRef.current?.click();
      },
    },
    {
      id: 'files',
      label: 'Files',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      action: () => {
        fileInputRef.current?.click();
      },
    },
    {
      id: 'wechat',
      label: 'WeChat files',
      icon: MessageSquare,
      gradient: 'from-green-500 to-teal-500',
      action: () => {
        onClose();
      },
    },
    {
      id: 'call',
      label: 'Call',
      icon: Phone,
      gradient: 'from-orange-500 to-yellow-500',
      action: () => {
        navigate('/voice');
        onClose();
      },
    },
    {
      id: 'presets',
      label: 'Presets',
      icon: Box,
      gradient: 'from-indigo-500 to-purple-800',
      action: () => {
        onClose();
      },
    },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onPickMedia?.(files);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] animate-in slide-in-from-bottom duration-300">
        <div className="bg-[#1c1c1e] rounded-t-3xl border-t border-white/10 shadow-2xl">
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-5">
            <div className="w-9 h-1.5 bg-white/30 rounded-full" />
          </div>

          {/* Content */}
          <div className="px-5 pb-8 max-h-[calc(75vh-3rem)] overflow-y-auto">
            {/* Tools Grid - 3x2 */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {tools.map((tool, index) => (
                <button
                  key={tool.id}
                  onClick={tool.action}
                  className="group bg-[#2c2c2e] hover:bg-[#3a3a3c] border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${tool.gradient} bg-opacity-20 flex items-center justify-center`}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">{tool.label}</span>
                </button>
              ))}
            </div>

            {/* Web Search */}
            <div className="space-y-2">
              <button
                onClick={() => setShowWebSearchOptions(!showWebSearchOptions)}
                className="w-full bg-[#2c2c2e] hover:bg-[#3a3a3c] border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Web search</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">{webSearchMode === 'auto' ? 'Auto' : 'Off'}</span>
                  <svg
                    className={`w-4 h-4 text-white/60 transition-transform ${showWebSearchOptions ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Web Search Options */}
              {showWebSearchOptions && (
                <div className="bg-black/30 rounded-xl p-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setWebSearchMode('auto');
                      setTimeout(() => setShowWebSearchOptions(false), 300);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      webSearchMode === 'auto' ? 'bg-blue-500/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-white font-semibold text-sm">Auto</div>
                      <div className="text-white/60 text-xs">Browses the web when needed</div>
                    </div>
                    {webSearchMode === 'auto' && (
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setWebSearchMode('off');
                      setTimeout(() => setShowWebSearchOptions(false), 300);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      webSearchMode === 'off' ? 'bg-blue-500/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-white font-semibold text-sm">Off</div>
                      <div className="text-white/60 text-xs">No web access</div>
                    </div>
                    {webSearchMode === 'off' && (
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </>
  );
}
