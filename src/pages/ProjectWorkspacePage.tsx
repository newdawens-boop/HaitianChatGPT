import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Code, 
  Eye, 
  Cloud, 
  Github, 
  Download, 
  Upload,
  Rocket,
  Settings,
  Monitor,
  Smartphone
} from 'lucide-react';
import { FileExplorer } from '@/components/projects/FileExplorer';
import { CodeEditor } from '@/components/projects/CodeEditor';
import { CloudPanel } from '@/components/projects/CloudPanel';
import { DeploymentPanel } from '@/components/projects/DeploymentPanel';
import { AIModelSelector } from '@/components/projects/AIModelSelector';
import { ProjectFile, Project } from '@/types/project';

// Demo project data
const DEMO_PROJECT: Project = {
  id: '1',
  name: 'My React App',
  description: 'A modern React application',
  type: 'react',
  status: 'deployed',
  createdAt: new Date(),
  updatedAt: new Date(),
  previewUrl: 'https://preview-abc123.haitianchatgpt.app',
  githubUrl: 'https://github.com/user/my-react-app',
  deployUrl: 'https://react-abc123.haitianchatgpt.app',
};

const DEMO_FILES: ProjectFile[] = [
  {
    id: '1',
    name: 'src',
    path: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file',
        language: 'typescript',
        content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;`,
      },
      {
        id: '3',
        name: 'index.tsx',
        path: 'src/index.tsx',
        type: 'file',
        language: 'typescript',
        content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
      },
    ],
  },
  {
    id: '4',
    name: 'public',
    path: 'public',
    type: 'folder',
    children: [
      {
        id: '5',
        name: 'index.html',
        path: 'public/index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>React App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>`,
      },
    ],
  },
  {
    id: '6',
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    language: 'json',
    content: `{\n  "name": "my-react-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
  },
];

export function ProjectWorkspacePage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [activeView, setActiveView] = useState<'preview' | 'code' | 'cloud' | 'deploy'>('code');
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [selectedModel, setSelectedModel] = useState('sonnet-4.5');

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">{DEMO_PROJECT.name}</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {DEMO_PROJECT.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button
                onClick={() => setActiveView('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  activeView === 'preview'
                    ? 'bg-white dark:bg-gray-600 shadow'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setActiveView('code')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  activeView === 'code'
                    ? 'bg-white dark:bg-gray-600 shadow'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
              <button
                onClick={() => setActiveView('cloud')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  activeView === 'cloud'
                    ? 'bg-white dark:bg-gray-600 shadow'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Cloud className="w-4 h-4" />
                Cloud
              </button>
              <button
                onClick={() => setActiveView('deploy')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  activeView === 'deploy'
                    ? 'bg-white dark:bg-gray-600 shadow'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Rocket className="w-4 h-4" />
                Deploy
              </button>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                <Monitor className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Github className="w-4 h-4" />
              GitHub
            </button>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              Upload ZIP
            </button>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Rocket className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer or AI Selector */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-sm mb-3">Project Structure</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {activeView === 'code' && (
              <FileExplorer
                files={DEMO_FILES}
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            )}
            {activeView === 'preview' && (
              <div className="p-4">
                <AIModelSelector
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  isPro={false}
                />
              </div>
            )}
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-hidden">
          {activeView === 'preview' && (
            <div className="h-full bg-white dark:bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Preview will load here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {DEMO_PROJECT.previewUrl}
                </p>
              </div>
            </div>
          )}

          {activeView === 'code' && <CodeEditor file={selectedFile} />}

          {activeView === 'cloud' && <CloudPanel projectId={projectId || '1'} />}

          {activeView === 'deploy' && <DeploymentPanel project={DEMO_PROJECT} />}
        </main>
      </div>
    </div>
  );
}
