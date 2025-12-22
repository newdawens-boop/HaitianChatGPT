import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Code, MoreVertical, X, Copy, Download, Github, FileCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProjectStore } from '@/stores/projectStore';
import { projectService } from '@/lib/projectService';
import { Project, ProjectFile } from '@/types/project';

export function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Load project data
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        setLoading(true);
        const [projectData, filesData] = await Promise.all([
          projectService.getProject(projectId),
          projectService.getProjectFiles(projectId),
        ]);

        if (!projectData) {
          toast.error('Project not found');
          navigate('/projects');
          return;
        }

        setProject(projectData);
        setFiles(filesData);
        if (filesData.length > 0) {
          setSelectedFile(filesData[0].path);
        }
      } catch (error: any) {
        console.error('Failed to load project:', error);
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, navigate]);

  const handleCopyAll = async () => {
    if (!files.length) return;
    const allCode = files.map(f => `// ${f.path}\n${f.content}`).join('\n\n');
    await navigator.clipboard.writeText(allCode);
    toast.success('All code copied to clipboard');
    setShowMenu(false);
  };

  const handleDownload = () => {
    if (!project || !files.length) return;
    try {
      projectService.downloadAsZip(project, files);
      toast.success('Project downloaded');
      setShowMenu(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDownloadHTML = () => {
    const htmlFile = files.find(f => f.path.endsWith('.html'));
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

  const handlePublish = async () => {
    if (!project || !files.length) return;
    
    if (project.status === 'generating') {
      toast.info('Code is still being prepared. This project will be available to publish soon.');
      setShowMenu(false);
      return;
    }

    try {
      const repoUrl = await projectService.publishToGitHub(project, files);
      await projectService.updateProject(project.id, { github_url: repoUrl });
      toast.success('Published to GitHub!');
      setShowMenu(false);
    } catch (error: any) {
      toast.error(error.message);
      setShowMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Project not found</p>
      </div>
    );
  }

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
              <h1 className="text-lg font-semibold">{project.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
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
                  {files.map((file) => (
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
                    <code>{files.find(f => f.path === selectedFile)?.content}</code>
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
          <span>Model: {project.model}</span>
          <span>{files.length} files</span>
        </div>
      </div>
    </div>
  );
}
