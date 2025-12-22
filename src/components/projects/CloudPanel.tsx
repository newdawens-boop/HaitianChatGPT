import { Users, Database, HardDrive, Zap, Brain, Key, FileText } from 'lucide-react';

const CLOUD_SECTIONS = [
  { id: 'users', name: 'Users', icon: Users, description: 'Manage user accounts and roles' },
  { id: 'data', name: 'Data', icon: Database, description: 'Database tables and queries' },
  { id: 'storage', name: 'Storage', icon: HardDrive, description: 'File storage and buckets' },
  { id: 'functions', name: 'Edge Functions', icon: Zap, description: 'Serverless functions' },
  { id: 'ai', name: 'AI', icon: Brain, description: 'AI usage and analytics' },
  { id: 'secrets', name: 'Secrets', icon: Key, description: 'Environment variables' },
  { id: 'logs', name: 'Logs', icon: FileText, description: 'Application logs' },
];

interface CloudPanelProps {
  projectId: string;
}

export function CloudPanel({ projectId }: CloudPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Cloud Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your project's backend services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CLOUD_SECTIONS.map((section) => (
          <button
            key={section.id}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg text-white">
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{section.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Sample Data Display */}
      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
            <p className="text-2xl font-bold">247</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">DB Size</p>
            <p className="text-2xl font-bold">1.2 GB</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Storage</p>
            <p className="text-2xl font-bold">450 MB</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Functions</p>
            <p className="text-2xl font-bold">8</p>
          </div>
        </div>
      </div>
    </div>
  );
}
