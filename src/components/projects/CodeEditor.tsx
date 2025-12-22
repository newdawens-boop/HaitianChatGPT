import { ProjectFile } from '@/types/project';

interface CodeEditorProps {
  file: ProjectFile | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  if (!file || file.type === 'folder') {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>Select a file to view its contents</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300">{file.name}</span>
        <span className="text-xs text-gray-500">{file.language}</span>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm text-gray-100 font-mono">
          <code>{file.content || '// File content will appear here'}</code>
        </pre>
      </div>
    </div>
  );
}
