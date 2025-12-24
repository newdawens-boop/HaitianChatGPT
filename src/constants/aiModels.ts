import { AIModel } from '@/types/project';

// ✅ LOGO IMPORTS
import SonnetLogo from '@/assets/logos/sonnet.png';
import OpusLogo from '@/assets/logos/opus.png';
import HaikuLogo from '@/assets/logos/haiku.png';
import GeminiLogo from '@/assets/logos/gemini.png';

export const AI_MODELS: AIModel[] = [
  {
    id: 'sonnet-4.5',
    name: 'Sonnet 4.5',
    description: 'Balanced model for everyday tasks',
    tier: 'free',
    logo: SonnetLogo,
  },
  {
    id: 'opus-4.1',
    name: 'Opus 4.1',
    description: 'Most capable model for complex tasks',
    tier: 'pro',
    logo: OpusLogo,
  },
  {
    id: 'opus-4',
    name: 'Opus 4',
    description: 'Advanced reasoning and analysis',
    tier: 'pro',
    logo: OpusLogo,
  },
  {
    id: 'haiku',
    name: 'Haiku',
    description: 'Fast and efficient for simple tasks',
    tier: 'pro',
    logo: HaikuLogo,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: "Google's advanced AI model",
    tier: 'pro',
    logo: GeminiLogo,
  },
];

export const FREE_MODELS = AI_MODELS.filter(m => m.tier === 'free');
export const PRO_MODELS = AI_MODELS.filter(m => m.tier === 'pro');
