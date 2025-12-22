import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Code, MoreVertical, X, Copy, Download, Github, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { useProjectStore } from '@/stores/projectStore';

export function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Get project from store or use demo data
  const projectStore = useProjectStore();
  const storedProject = projectId ? projectStore.getProject(projectId) : null;

  // Mock project data - in real app, fetch from store/API
  const projectData = storedProject || {
    id: projectId || '',
    title: 'ChatGPT-Style Settings',
    description: 'Interactive artifact',
    status: 'ready' as const,
    model: 'Sonnet 4.5',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Settings</title>
  <style>
    body { font-family: system-ui; margin: 0; padding: 20px; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Settings Page</h1>
  <div id="settings">
    <div class="setting-item">
      <h3>General</h3>
      <p>Name, email, language preferences</p>
    </div>
    <div class="setting-item">
      <h3>Security</h3>
      <p>Password, 2FA, sessions</p>
    </div>
  </div>
</body>
</html>`,
        language: 'html'
      },
      {
        path: 'styles.css',
        content: `body {
  font-family: system-ui;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}

.setting-item {
  background: white;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}`,
        language: 'css'
      },
      {
        path: 'script.js',
        content: `console.log('Settings loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready');
});`,
        language: 'javascript'
      }
    ],
    createdAt: new Date().toISOString()
  };

  const handleCopyAll = async () => {
    const allCode = projectData.files.map((f: any) => `// ${f.path}\n${f.content}`).join('\n\n');
    await navigator.clipboard.writeText(allCode);
    toast.success('All code copied to clipboard');
    setShowMenu(false);
  };

  const handleDownload = () => {
    // Create ZIP download (simplified - in real app use JSZip)
    const allCode = projectData.files.map((f: any) => `// ${f.path}\n${f.content}`).join('\n\n');
    const blob = new Blob([allCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.title}.txt`;
    a.click();
    toast.success('Project downloaded');
    setShowMenu(false);
  };

  const handleDownloadHTML = () => {
    const htmlFile = projectData.files.find((f: any) => f.path.endsWith('.html'));
    if (htmlFile) {
      const blob = new Blob([htmlFile.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      a.click();
      toast.success('HTML file downloaded');
    } else {
      toast.error('No HTML file found');
    }
    setShowMenu(false);
  };

  const handlePublish = () => {
    // GitHub publishing flow
    if (projectData.status === 'generating') {
      toast.info('Code is still being prepared. This project will be available to publish soon.');
    } else {
      toast.info('GitHub authentication required. Please connect your GitHub account.');
    }
    setShowMenu(false);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{projectData.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{projectData.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Toggle Preview/Code */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`p-2 rounded-lg transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Preview"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`p-2 rounded-lg transition-colors ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Code"
              >
                <Code className="w-5 h-5" />
              </button>
            </div>

            {/* Three-dot menu */}
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
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={handleCopyAll}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Copy className="w-4 h-4" />
                      Copy all code
                    </button>
                    <button
                      onClick={handlePublish}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Github className="w-4 h-4" />
                      Publish to GitHub
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Download className="w-4 h-4" />
                      Download project
                    </button>
                    <button
                      onClick={handleDownloadHTML}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <FileCode className="w-4 h-4" />
                      Download as HTML
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' && (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 p-8">
            <div className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium">General</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name, email, language preferences</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium">Security</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Password, 2FA, sessions</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email notification preferences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'code' && (
          <div className="h-full flex">
            {/* File Explorer */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Files</h3>
                <div className="space-y-1">
                  {projectData.files.map((file: any) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file.path)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedFile === file.path
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FileCode className="w-4 h-4 inline mr-2" />
                      {file.path}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Code View */}
            <div className="flex-1 overflow-y-auto">
              {selectedFile ? (
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{selectedFile}</h3>
                  </div>
                  <pre className="bg-[#282C34] text-[#ABB2BF] p-6 rounded-xl overflow-x-auto">
                    <code>{projectData.files.find((f: any) => f.path === selectedFile)?.content}</code>
                  </pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Select a file to view code
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Model Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Model: {projectData.model}</span>
          <span>{projectData.files.length} files</span>
        </div>
      </div>
    </div>
  );
}
