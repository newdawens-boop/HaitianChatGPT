import { useState } from 'react';
import { ImageViewerModal } from '../modals/ImageViewerModal';
import { toast } from 'sonner';

interface GeneratedImageProps {
  images: Array<{
    url: string;
    revised_prompt?: string;
  }>;
  onSelectImage?: (index: number) => void;
  onEditImage?: (editPrompt: string) => void;
}

export function GeneratedImage({ images, onSelectImage, onEditImage }: GeneratedImageProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setViewerOpen(true);
  };

  const handleSelect = (index: number) => {
    if (onSelectImage) {
      onSelectImage(index);
      toast.success(`Image ${index + 1} selected`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Images created</p>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Skip
        </button>
      </div>

      <p className="text-sm text-muted-foreground">Which image do you like more?</p>

      {/* Images Grid */}
      <div className="grid grid-cols-2 gap-3">
        {images.map((image, index) => (
          <div key={index} className="space-y-2">
            <button
              onClick={() => handleImageClick(index)}
              className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all group"
            >
              <img
                src={image.url}
                alt={`Generated image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 w-6 h-6 rounded bg-black/60 text-white flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>

            <button
              onClick={() => handleSelect(index)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-full transition-colors text-sm font-medium"
            >
              <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                <span className="w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100" />
              </span>
              Image {index + 1}
            </button>
          </div>
        ))}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage !== null && (
        <ImageViewerModal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedImage(null);
          }}
          imageUrl={images[selectedImage].url}
          title={images[selectedImage].revised_prompt || `Image ${selectedImage + 1}`}
          onEdit={onEditImage}
        />
      )}
    </div>
  );
}
