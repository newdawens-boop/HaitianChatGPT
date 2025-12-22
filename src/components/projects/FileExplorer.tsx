import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { ProjectFile } from '@/types/project';

interface FileExplorerProps {
  files: ProjectFile[];
  onFileSelect: (file: ProjectFile) => void;
  selectedFile?: ProjectFile;
}

export function FileExplorer({ files, onFileSelect, selectedFile }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFile = (file: ProjectFile, depth = 0) => {
    const isExpanded = expandedFolders.has(file.path);
    const isSelected = selectedFile?.path === file.path;

    return (
      <div key={file.path}>
        <button
          onClick={() => {
            if (file.type === 'folder') {
              toggleFolder(file.path);
            } else {
              onFileSelect(file);
            }
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left ${
            isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''
          }`}
          style={{ paddingLeft: `${depth * 1.25 + 0.75}rem` }}
        >
          {file.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500" />
              )}
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="w-4 h-4 text-gray-500" />
            </>
          )}
          <span className="text-sm">{file.name}</span>
        </button>

        {file.type === 'folder' && isExpanded && file.children && (
          <div>
            {file.children.map((child) => renderFile(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-2">
      {files.map((file) => renderFile(file))}
    </div>
  );
}
