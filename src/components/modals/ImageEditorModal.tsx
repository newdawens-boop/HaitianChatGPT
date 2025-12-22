import { useState } from 'react';
import { useModalStore } from '@/stores/modalStore';
import { Camera, Image as ImageIcon, Crop, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditorModalProps {
  imageUrl: string;
  onEdit: (editDescription: string, selectedArea?: any, blendImage?: File) => void;
}

export function ImageEditorModal({ imageUrl, onEdit }: ImageEditorModalProps) {
  const { isImageEditorOpen, setImageEditorOpen } = useModalStore();
  const [editMode, setEditMode] = useState<'menu' | 'select' | 'blend' | 'describe'>('menu');
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [blendImage, setBlendImage] = useState<File | null>(null);
  const [editDescription, setEditDescription] = useState('');

  if (!isImageEditorOpen) return null;

  const handleTakePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setBlendImage(file);
        setEditMode('describe');
      }
    };
    input.click();
  };

  const handleBlendPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setBlendImage(file);
        setEditMode('describe');
      }
    };
    input.click();
  };

  const handleSelectArea = () => {
    setEditMode('select');
  };

  const handleConfirmSelection = () => {
    setSelectedArea({ x: 0, y: 0, width: 100, height: 100 }); // Placeholder
    setEditMode('describe');
  };

  const handleSubmitEdit = () => {
    if (!editDescription.trim()) {
      toast.error('Please describe your edits');
      return;
    }
    onEdit(editDescription, selectedArea, blendImage || undefined);
    setImageEditorOpen(false);
    resetState();
  };

  const resetState = () => {
    setEditMode('menu');
    setSelectedArea(null);
    setBlendImage(null);
    setEditDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        {editMode === 'select' ? (
          <div className="flex items-center justify-between text-white">
            <button
              onClick={() => setEditMode('menu')}
              className="px-4 py-2"
            >
              Cancel
            </button>
            <span className="font-medium">Select</span>
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 font-medium"
            >
              Next
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setImageEditorOpen(false);
              resetState();
            }}
            className="w-12 h-12 flex items-center justify-center bg-black/50 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Image */}
      <div className="w-full h-full flex items-center justify-center p-16">
        <img
          src={imageUrl}
          alt="Edit"
          className="max-w-full max-h-full object-contain"
        />
        {blendImage && editMode === 'describe' && (
          <div className="absolute bottom-32 left-4 w-24 h-24 rounded-lg overflow-hidden border-2 border-white">
            <img
              src={URL.createObjectURL(blendImage)}
              alt="Blend"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80">
        {editMode === 'menu' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSelectArea}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-white"
            >
              <Crop className="w-5 h-5" />
              <span>Select area</span>
            </button>
            <button
              onClick={handleTakePhoto}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-white"
            >
              <Camera className="w-5 h-5" />
              <span>Take photo</span>
            </button>
            <button
              onClick={handleBlendPhoto}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-white"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Blend in a photo</span>
            </button>
          </div>
        )}

        {editMode === 'select' && (
          <div className="text-center text-white text-sm">
            Select an area to edit
          </div>
        )}

        {editMode === 'describe' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditMode('menu')}
              className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full text-white"
            >
              <Crop className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Describe edits"
              className="flex-1 px-4 py-3 bg-white/10 rounded-full text-white placeholder-white/60 focus:outline-none"
            />
            <button
              onClick={handleSubmitEdit}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-black"
            >
              <Check className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
