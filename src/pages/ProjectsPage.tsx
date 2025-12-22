import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderOpen } from 'lucide-react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Project } from '@/types/project';

const DEMO_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'My React App',
    description: 'A modern React application with TypeScript',
    type: 'react',
    status: 'deployed',
    createdAt: new Date(),
    updatedAt: new Date(),
    previewUrl: 'https://preview-abc123.haitianchatgpt.app',
    githubUrl: 'https://github.com/user/my-react-app',
    deployUrl: 'https://react-abc123.haitianchatgpt.app',
  },
  {
    id: '2',
    name: 'E-commerce Dashboard',
    description: 'Next.js dashboard for online store',
    type: 'nextjs',
    status: 'ready',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Portfolio Website',
    description: 'Personal portfolio with animations',
    type: 'html',
    status: 'building',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function ProjectsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects] = useState<Project[]>(DEMO_PROJECTS);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and deploy your applications
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/project/${project.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
