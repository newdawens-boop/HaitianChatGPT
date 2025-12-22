import { Code, Smartphone, Globe, ChevronRight } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getIcon = () => {
    switch (project.type) {
      case 'ios':
      case 'android':
        return <Smartphone className="w-6 h-6" />;
      case 'html':
        return <Globe className="w-6 h-6" />;
      default:
        return <Code className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'creating':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'building':
        return 'bg-yellow-500';
      case 'deployed':
        return 'bg-purple-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <button
      onClick={onClick}
      className="group w-full p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-xl transition-all text-left"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl text-white">
          {getIcon()}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {project.status}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
        {project.name}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        {project.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {project.type}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
      </div>
    </button>
  );
}
