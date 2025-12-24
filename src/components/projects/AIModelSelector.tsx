import { Check, Crown } from 'lucide-react';
import { AI_MODELS } from '@/constants/aiModels';
import { useState } from 'react';

interface AIModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  isPro?: boolean;
}

export function AIModelSelector({
  selectedModel,
  onModelSelect,
  isPro = false,
}: AIModelSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  const availableModels = isPro
    ? AI_MODELS
    : AI_MODELS.filter(m => m.tier === 'free');

  const displayedModels = showAll
    ? availableModels
    : availableModels.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Select AI Model
        </h3>

        {!isPro && (
          <button className="flex items-center gap-1 text-xs text-purple-600 hover:underline">
            <Crown className="w-3 h-3" />
            Upgrade for more models
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayedModels.map(model => (
          <button
            key={model.id}
            onClick={() => onModelSelect(model.id)}
            disabled={!isPro && model.tier === 'pro'}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
              ${
                selectedModel === model.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }
              ${
                !isPro && model.tier === 'pro'
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
          >
            {/* ✅ LOGO */}
            <img
              src={model.logo}
              alt={model.name}
              className="w-7 h-7 object-contain"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{model.name}</span>
                {model.tier === 'pro' && (
                  <Crown className="w-3 h-3 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {model.description}
              </p>
            </div>

            {selectedModel === model.id && (
              <Check className="w-5 h-5 text-purple-600" />
            )}
          </button>
        ))}
      </div>

      {availableModels.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-sm text-purple-600 hover:underline"
        >
          {showAll
            ? 'Show less'
            : `Show ${availableModels.length - 3} more models`}
        </button>
      )}
    </div>
  );
}
