import { Camera, Paperclip, Image, Lightbulb, Search, ShoppingBag, BookOpen, Globe, Paintbrush, FileQuestion } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { useRef } from 'react';
import { toast } from 'sonner';

interface AttachmentMenuProps {
  onFileSelect: (files: File[]) => void;
}

export function AttachmentMenu({ onFileSelect }: AttachmentMenuProps) {
  const { isAttachmentMenuOpen, setAttachmentMenuOpen } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isAttachmentMenuOpen) return null;

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
    setAttachmentMenuOpen(false);
  };

  const handleAddFiles = () => {
    fileInputRef.current?.click();
    setAttachmentMenuOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files);
      toast.success(`${files.length} file(s) selected`);
    }
  };

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".zip,.html,.txt,.js,.jsx,.ts,.tsx,.json,.pdf,.doc,.docx,.csv,.md,.png,.jpg,.jpeg,.gif,.svg"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className="fixed inset-0 z-50 animate-fadeIn"
        onClick={() => setAttachmentMenuOpen(false)}
      />
      <div className="fixed bottom-20 left-4 w-72 bg-popover border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
        <div className="p-2">
          <button
            onClick={handleTakePhoto}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Camera className="w-5 h-5" />
            <span>Take photo</span>
          </button>

          <button
            onClick={handleAddFiles}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
          >
            <Paperclip className="w-5 h-5" />
            <span>Add photos & files</span>
          </button>

          <div className="my-2 border-t border-border" />

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Image className="w-5 h-5" />
            <span>Create image</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Lightbulb className="w-5 h-5" />
            <span>Thinking</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Search className="w-5 h-5" />
            <span>Deep research</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <ShoppingBag className="w-5 h-5" />
            <span>Shopping research</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <BookOpen className="w-5 h-5" />
            <span>Study and learn</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Globe className="w-5 h-5" />
            <span>Web search</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <Paintbrush className="w-5 h-5" />
            <span>Canvas</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left">
            <FileQuestion className="w-5 h-5" />
            <span>Quizzes</span>
          </button>
        </div>
      </div>
    </>
  );
}
