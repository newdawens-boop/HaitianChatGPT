import { ThumbsUp, ThumbsDown, Download, MoreHorizontal, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useModalStore } from '@/stores/modalStore';

interface GeneratedImageProps {
  imageUrl: string;
  prompt: string;
  onRetry: () => void;
  onEdit: (editDescription: string) => void;
}

export function GeneratedImage({ imageUrl, prompt, onRetry, onEdit }: GeneratedImageProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const { setImageViewerOpen, setCurrentImageUrl, setImageEditorOpen } = useModalStore();

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `haitian-chatgpt-image-${Date.now()}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    toast.success(isLiked ? 'Feedback removed' : 'Thanks for your feedback!');
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    toast.success(isDisliked ? 'Feedback removed' : 'Thanks for your feedback!');
  };

  const handleViewFullscreen = () => {
    setCurrentImageUrl(imageUrl);
    setImageViewerOpen(true);
  };

  const handleEdit = () => {
    setCurrentImageUrl(imageUrl);
    setImageEditorOpen(true);
    setShowEditMenu(false);
  };

  return (
    <div className="my-4">
      {/* Image */}
      <div className="relative group">
        <img
          src={imageUrl}
          alt={prompt}
          onClick={handleViewFullscreen}
          className="max-w-md w-full rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg cursor-pointer"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleLike}
          className={`p-2 hover:bg-accent rounded-lg transition-colors ${
            isLiked ? 'text-blue-600 dark:text-blue-400' : ''
          }`}
          title="Like"
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleDislike}
          className={`p-2 hover:bg-accent rounded-lg transition-colors ${
            isDisliked ? 'text-red-600 dark:text-red-400' : ''
          }`}
          title="Dislike"
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
        
        {/* Three-dot menu */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    onRetry();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Retry
                </button>
                <button
                  onClick={() => {
                    handleLike();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  {isLiked ? 'Unlike' : 'Like'}
                </button>
                <button
                  onClick={() => {
                    handleDownload();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Download
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Button */}
      <div className="relative mt-3">
        <button
          onClick={() => setShowEditMenu(!showEditMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span className="text-sm font-medium">Edit</span>
        </button>

        {showEditMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowEditMenu(false)}
            />
            <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => {
                  handleLike();
                  setShowEditMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                {isLiked ? 'Unlike' : 'Like'}
              </button>
              <button
                onClick={() => {
                  onRetry();
                  setShowEditMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Retry
              </button>
              <button
                onClick={handleEdit}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Edit image
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
