import { Check } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

interface AIModel {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'pro';
}

const AI_MODELS: AIModel[] = [
  { id: 'sonnet-4.5', name: 'Sonnet 4.5', description: 'Best for everyday tasks', tier: 'free' },
  { id: 'opus-4.5', name: 'Opus 4.5', description: 'Most capable for complex work', tier: 'pro' },
  { id: 'haiku-4.5', name: 'Haiku 4.5', description: 'Fastest for quick answers', tier: 'free' },
  { id: 'opus-4.1', name: 'Opus 4.1', description: 'Advanced reasoning model', tier: 'pro' },
  { id: 'opus-4', name: 'Opus 4', description: 'Previous generation flagship', tier: 'pro' },
  { id: 'sonnet-4', name: 'Sonnet 4', description: 'Previous balanced model', tier: 'pro' },
  { id: 'opus-3', name: 'Opus 3', description: 'Legacy powerful model', tier: 'pro' },
  { id: 'haiku-3.5', name: 'Haiku 3.5', description: 'Legacy fast model', tier: 'pro' },
];

export function AIModelSettings() {
  const { selectedModel, setSelectedModel } = useChatStore();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">AI Model</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose the AI model for your conversations
        </p>
      </div>

      <div className="space-y-6">
        {/* Free Models */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Free Models</h3>
          <div className="space-y-2">
            {AI_MODELS.filter(m => m.tier === 'free').map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl transition-colors ${
                  selectedModel === model.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex-1 text-left">
                  <div className="font-medium">{model.name}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {model.description}
                  </p>
                </div>
                {selectedModel === model.id && (
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pro Models */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Pro Models</h3>
          <div className="space-y-2">
            {AI_MODELS.filter(m => m.tier === 'pro').map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl transition-colors ${
                  selectedModel === model.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex-1 text-left">
                  <div className="font-medium flex items-center gap-2">
                    {model.name}
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {model.description}
                  </p>
                </div>
                {selectedModel === model.id && (
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
