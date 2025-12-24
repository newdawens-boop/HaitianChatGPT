import { useState } from 'react';
import { ChevronDown, Check, Crown } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

// ✅ LOGO IMPORTS
import SonnetLogo from '@/assets/logos/sonnet.png';
import OpusLogo from '@/assets/logos/opus.png';
import HaikuLogo from '@/assets/logos/haiku.png';

interface AIModel {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'pro';
  logo: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'sonnet-4.5',
    name: 'Sonnet 4.5',
    description: 'Best for everyday tasks',
    tier: 'free',
    logo: SonnetLogo,
  },
  {
    id: 'opus-4.5',
    name: 'Opus 4.5',
    description: 'Most capable for complex work',
    tier: 'pro',
    logo: OpusLogo,
  },
  {
    id: 'haiku-4.5',
    name: 'Haiku 4.5',
    description: 'Fastest for quick answers',
    tier: 'free',
    logo: HaikuLogo,
  },
  {
    id: 'opus-4.1',
    name: 'Opus 4.1',
    description: 'Advanced reasoning model',
    tier: 'pro',
    logo: OpusLogo,
  },
  {
    id: 'opus-4',
    name: 'Opus 4',
    description: 'Previous generation flagship',
    tier: 'pro',
    logo: OpusLogo,
  },
  {
    id: 'sonnet-4',
    name: 'Sonnet 4',
    description: 'Previous balanced model',
    tier: 'pro',
    logo: SonnetLogo,
  },
  {
    id: 'opus-3',
    name: 'Opus 3',
    description: 'Legacy powerful model',
    tier: 'pro',
    logo: OpusLogo,
  },
  {
    id: 'haiku-3.5',
    name: 'Haiku 3.5',
    description: 'Legacy fast model',
    tier: 'pro',
    logo: HaikuLogo,
  },
];

export function AIModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedModel, setSelectedModel } = useChatStore();

  const currentModel =
    AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <img
          src={currentModel.logo}
          alt={currentModel.name}
          className="w-5 h-5 object-contain"
        />
        <span className="font-medium text-sm">{currentModel.name}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute bottom-full mb-2 left-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2 max-h-96 overflow-y-auto">
              {/* FREE MODELS */}
              <div className="mb-4">
                {AI_MODELS.filter(m => m.tier === 'free').map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                  >
                    <img
                      src={model.logo}
                      alt={model.name}
                      className="w-6 h-6 object-contain mt-0.5"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        {selectedModel === model.id && (
                          <Check className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {model.description}
                      </p>
                    </div>

                    {selectedModel === model.id && (
                      <span className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                        New chat
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* PRO MODELS */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  More models
                </div>

                {AI_MODELS.filter(m => m.tier === 'pro').map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                  >
                    <img
                      src={model.logo}
                      alt={model.name}
                      className="w-6 h-6 object-contain mt-0.5"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        {selectedModel === model.id && (
                          <Check className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {model.description}
                      </p>
                    </div>

                    <span className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Upgrade
                    </span>
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
