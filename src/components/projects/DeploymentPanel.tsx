import { Globe, Github, ExternalLink, Copy, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Project, DeploymentLog } from '@/types/project';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeploymentPanelProps {
  project: Project;
}

export function DeploymentPanel({ project }: DeploymentPanelProps) {
  const [logs] = useState<DeploymentLog[]>([
    { id: '1', timestamp: new Date(), message: 'Building project...', type: 'info' },
    { id: '2', timestamp: new Date(), message: 'Installing dependencies...', type: 'info' },
    { id: '3', timestamp: new Date(), message: 'Running build scripts...', type: 'success' },
    { id: '4', timestamp: new Date(), message: 'Deploying to production...', type: 'success' },
    { id: '5', timestamp: new Date(), message: 'Deployment successful!', type: 'success' },
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Deployment Status */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
        <div className="flex items-center gap-3 mb-4">
          {project.status === 'deployed' ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : project.status === 'error' ? (
            <XCircle className="w-6 h-6 text-red-500" />
          ) : (
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          )}
          <div>
            <h3 className="font-semibold text-lg">Deployment Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {project.status}
            </p>
          </div>
        </div>
      </div>

      {/* URLs */}
      <div className="space-y-3">
        {/* Preview URL */}
        {project.previewUrl && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Preview URL</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(project.previewUrl!)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={project.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
              {project.previewUrl}
            </p>
          </div>
        )}

        {/* GitHub URL */}
        {project.githubUrl && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                <span className="text-sm font-medium">GitHub Repository</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(project.githubUrl!)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
              {project.githubUrl}
            </p>
          </div>
        )}

        {/* Deploy URL */}
        {project.deployUrl && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Production URL</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(project.deployUrl!)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={project.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
              {project.deployUrl}
            </p>
          </div>
        )}
      </div>

      {/* Deployment Logs */}
      <div className="p-4 bg-gray-900 rounded-xl">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Deployment Logs</h4>
        <div className="space-y-1 font-mono text-xs max-h-64 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`${
                log.type === 'error'
                  ? 'text-red-400'
                  : log.type === 'success'
                  ? 'text-green-400'
                  : log.type === 'warning'
                  ? 'text-yellow-400'
                  : 'text-gray-400'
              }`}
            >
              [{log.timestamp.toLocaleTimeString()}] {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
