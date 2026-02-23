import { useState } from 'react';
import { ChevronDown, Check, Crown, Sparkles, Briefcase, Languages, MessageCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { SPECIALIZED_AI } from '@/constants/aiModels';

const CATEGORY_ICONS = {
  creative: Sparkles,
  professional: Briefcase,
  language: Languages,
  general: MessageCircle,
};

const CATEGORY_LABELS = {
  creative: 'Creative Writing',
  professional: 'Professional',
  language: 'Language Learning',
  general: 'General Chat',
};

const CATEGORY_COLORS = {
  creative: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900',
  professional: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900',
  language: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900',
  general: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900',
};

export function AIModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedModel, setSelectedModel } = useChatStore();

  const currentAssistant =
    SPECIALIZED_AI.find(m => m.id === selectedModel) || SPECIALIZED_AI[0];
  
  const CategoryIcon = CATEGORY_ICONS[currentAssistant.category];

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <CategoryIcon className="w-5 h-5" />
        <span className="font-medium text-sm">{currentAssistant.name}</span>
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
          <div className="absolute bottom-full mb-2 left-0 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Choose Your AI Assistant
              </h3>
            </div>
            
            <div className="max-h-[32rem] overflow-y-auto pb-2">
              {(['creative', 'professional', 'language', 'general'] as const).map(category => {
                const categoryAIs = SPECIALIZED_AI.filter(ai => ai.category === category);
                const Icon = CATEGORY_ICONS[category];
                
                return (
                  <div key={category} className="mb-4">
                    <div className="px-4 py-2 flex items-center gap-2">
                      <Icon className={`w-4 h-4`} />
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {CATEGORY_LABELS[category]}
                      </span>
                    </div>
                    
                    {categoryAIs.map(ai => {
                      const isSelected = selectedModel === ai.id;
                      const AIIcon = CATEGORY_ICONS[ai.category];
                      
                      return (
                        <button
                          key={ai.id}
                          onClick={() => {
                            setSelectedModel(ai.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${
                            isSelected ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${CATEGORY_COLORS[ai.category]} flex items-center justify-center flex-shrink-0`}>
                            <AIIcon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{ai.name}</span>
                              {isSelected && (
                                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {ai.description}
                            </p>
                          </div>

                          {ai.tier === 'pro' && !isSelected && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-md flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Pro
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
