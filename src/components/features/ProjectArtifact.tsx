import { Eye, Code, MoreVertical, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProjectArtifactProps {
  projectId: string;
  title: string;
  description?: string;
  status: 'generating' | 'ready' | 'error';
  preview?: string;
}

export function ProjectArtifact({ projectId, title, description, status, preview }: ProjectArtifactProps) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleOpenProject = () => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="my-4 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description || 'Interactive artifact'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {status === 'generating' && (
            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
              <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full animate-pulse" />
              Generating...
            </div>
          )}
          
          {status === 'ready' && (
            <>
              <button
                onClick={handleOpenProject}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Preview"
              >
                <Eye className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleOpenProject}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="View Code"
              >
                <Code className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      <button
                        onClick={handleOpenProject}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        Copy
                      </button>
                      <button
                        onClick={handleOpenProject}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        Publish
                      </button>
                      <button
                        onClick={handleOpenProject}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        Download as HTML
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview Area - Click to open */}
      <div
        onClick={handleOpenProject}
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        {preview ? (
          <div className="p-8">
            <div dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            {status === 'generating' ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <p>Creating project...</p>
              </div>
            ) : status === 'ready' ? (
              <p>Click to view project</p>
            ) : (
              <p>Error generating project</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
