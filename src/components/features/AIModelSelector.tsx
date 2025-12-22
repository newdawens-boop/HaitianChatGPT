import { useState } from 'react';
import { ChevronDown, Check, Crown } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

interface AIModel {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'pro';
  icon?: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'sonnet-4.5',
    name: 'Sonnet 4.5',
    description: 'Best for everyday tasks',
    tier: 'free',
    icon: '⚡',
  },
  {
    id: 'opus-4.5',
    name: 'Opus 4.5',
    description: 'Most capable for complex work',
    tier: 'pro',
    icon: '💎',
  },
  {
    id: 'haiku-4.5',
    name: 'Haiku 4.5',
    description: 'Fastest for quick answers',
    tier: 'free',
    icon: '🚀',
  },
  {
    id: 'opus-4.1',
    name: 'Opus 4.1',
    description: 'Advanced reasoning model',
    tier: 'pro',
    icon: '🧠',
  },
  {
    id: 'opus-4',
    name: 'Opus 4',
    description: 'Previous generation flagship',
    tier: 'pro',
    icon: '✨',
  },
  {
    id: 'sonnet-4',
    name: 'Sonnet 4',
    description: 'Previous balanced model',
    tier: 'pro',
    icon: '⚡',
  },
  {
    id: 'opus-3',
    name: 'Opus 3',
    description: 'Legacy powerful model',
    tier: 'pro',
    icon: '💫',
  },
  {
    id: 'haiku-3.5',
    name: 'Haiku 3.5',
    description: 'Legacy fast model',
    tier: 'pro',
    icon: '🌟',
  },
];

export function AIModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedModel, setSelectedModel } = useChatStore();
  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="font-medium text-sm">{currentModel.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full mb-2 left-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2 max-h-96 overflow-y-auto">
              {/* Free Models */}
              <div className="mb-4">
                {AI_MODELS.filter(m => m.tier === 'free').map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {model.icon && <span>{model.icon}</span>}
                        <span className="font-medium">{model.name}</span>
                        {selectedModel === model.id && (
                          <Check className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {model.description}
                      </p>
                    </div>
                    {model.tier === 'free' && selectedModel === model.id && (
                      <button className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                        New chat
                      </button>
                    )}
                  </button>
                ))}
              </div>

              {/* Pro Models */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  More models
                </div>
                {AI_MODELS.filter(m => m.tier === 'pro').map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {model.icon && <span>{model.icon}</span>}
                        <span className="font-medium">{model.name}</span>
                        {selectedModel === model.id && (
                          <Check className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {model.description}
                      </p>
                    </div>
                    <button className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Upgrade
                    </button>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
