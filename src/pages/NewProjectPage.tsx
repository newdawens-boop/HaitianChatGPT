import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Code, Globe, Server, Coffee, Package, FileCode, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'react',
    name: 'React App',
    description: 'Modern React application with TypeScript and Vite',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'nextjs',
    name: 'Next.js App',
    description: 'Full-stack Next.js application with App Router',
    icon: Globe,
    color: 'from-gray-700 to-gray-900',
  },
  {
    id: 'html',
    name: 'HTML/CSS/JS',
    description: 'Static website with HTML, CSS, and vanilla JavaScript',
    icon: FileCode,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'nodejs',
    name: 'Node.js API',
    description: 'RESTful API with Express and Node.js',
    icon: Server,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'python',
    name: 'Python App',
    description: 'Python application with Flask or FastAPI',
    icon: Coffee,
    color: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'npm-package',
    name: 'NPM Package',
    description: 'Publishable NPM package with TypeScript',
    icon: Package,
    color: 'from-red-500 to-pink-500',
  },
];

export function NewProjectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateProject = async () => {
    if (!selectedTemplate || !projectDescription.trim()) {
      toast.error('Please select a template and provide a description');
      return;
    }

    setIsGenerating(true);

    try {
      const template = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate);
      
      const { data, error } = await supabase.functions.invoke('generate-project', {
        body: {
          projectType: selectedTemplate,
          description: projectDescription,
          title: projectTitle || `${template?.name} Project`,
        },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
          } catch {
            errorMessage = `${error.message || 'Failed to read response'}`;
          }
        }
        toast.error(`Failed to create project: ${errorMessage}`);
        return;
      }

      if (!data) {
        toast.error('No data returned from project generation');
        return;
      }

      toast.success('Project created successfully!');
      navigate(`/project/${data.project.id}`);
    } catch (error: any) {
      console.error('Project creation error:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome, {user?.username}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create a professional project in any language or framework. Powered by AI, ready to deploy.
          </p>
        </div>

        {/* Project Templates */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Choose Your Project Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROJECT_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Details */}
        {selectedTemplate && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6">Project Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Name (Optional)
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder={`My ${PROJECT_TEMPLATES.find(t => t.id === selectedTemplate)?.name}`}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Describe Your Project *
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="E.g., A todo list app with authentication, real-time sync, and dark mode support..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Be specific about features, design preferences, and functionality you want.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate(-1)}
                  disabled={isGenerating}
                  className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!projectDescription.trim() || isGenerating}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Project...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Create Project with AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {isGenerating && (
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  🚀 AI is generating your complete project with all necessary files...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
