import { X, Info, Download, Share2 } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { toast } from 'sonner';

interface ImageViewerModalProps {
  imageUrl: string;
  title?: string;
}

export function ImageViewerModal({ imageUrl, title }: ImageViewerModalProps) {
  const { isImageViewerOpen, setImageViewerOpen } = useModalStore();

  if (!isImageViewerOpen) return null;

  const handleSave = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title || 'image.png';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Image saved');
    } catch (error) {
      toast.error('Failed to save image');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Image',
          url: imageUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(imageUrl);
      toast.success('Image URL copied');
    }
  };

  const handleInfo = () => {
    toast.info('Image information');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={() => setImageViewerOpen(false)}
          className="w-12 h-12 flex items-center justify-center bg-black/50 rounded-full text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInfo}
            className="w-12 h-12 flex items-center justify-center bg-black/50 rounded-full text-white"
          >
            <Info className="w-6 h-6" />
          </button>
          <button
            onClick={handleSave}
            className="px-6 h-12 flex items-center justify-center bg-black/50 rounded-full text-white font-medium"
          >
            Save
          </button>
          <button
            onClick={handleShare}
            className="px-6 h-12 flex items-center justify-center bg-white rounded-full text-black font-medium"
          >
            Share
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={imageUrl}
          alt={title || 'Full size image'}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}
