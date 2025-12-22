import { AIModel } from '@/types/project';

export const AI_MODELS: AIModel[] = [
  {
    id: 'sonnet-4.5',
    name: 'Sonnet 4.5',
    description: 'Balanced model for everyday tasks',
    tier: 'free',
    icon: '⚡',
  },
  {
    id: 'opus-4.1',
    name: 'Opus 4.1',
    description: 'Most capable model for complex tasks',
    tier: 'pro',
    icon: '🧠',
  },
  {
    id: 'opus-4',
    name: 'Opus 4',
    description: 'Advanced reasoning and analysis',
    tier: 'pro',
    icon: '💎',
  },
  {
    id: 'haiku',
    name: 'Haiku',
    description: 'Fast and efficient for simple tasks',
    tier: 'pro',
    icon: '🚀',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Google\'s advanced AI model',
    tier: 'pro',
    icon: '✨',
  },
];

export const FREE_MODELS = AI_MODELS.filter(m => m.tier === 'free');
export const PRO_MODELS = AI_MODELS.filter(m => m.tier === 'pro');
