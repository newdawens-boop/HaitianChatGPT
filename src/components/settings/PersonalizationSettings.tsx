import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { settingsService } from '@/lib/settingsService';
import { UserPreferences } from '@/types/settings';
import { toast } from 'sonner';
import { ChevronDown, Info } from 'lucide-react';

export function PersonalizationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    const prefs = await settingsService.getUserPreferences(user.id);
    setPreferences(prefs);
    setIsLoading(false);
  };

  const handleUpdate = async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) return;
    
    const success = await settingsService.updatePreferences(user.id, updates);
    if (success) {
      setPreferences({ ...preferences, ...updates });
      toast.success('Personalization updated');
    } else {
      toast.error('Failed to update');
    }
  };

  if (isLoading || !preferences) {
    return <div className="p-6">Loading...</div>;
  }

  const styleOptions = [
    { value: 'default', label: 'Default' },
    { value: 'concise', label: 'Concise' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'professional', label: 'Professional' },
  ];

  const characteristicOptions = [
    { value: 'default', label: 'Default' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <div className="space-y-6">
      {/* Base Style and Tone */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Base style and tone</h3>
          <select
            value={preferences.base_style_tone}
            onChange={(e) => handleUpdate({ base_style_tone: e.target.value })}
            className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
          >
            {styleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-muted-foreground">
          Set the style and tone of how Haitian ChatGPT responds to you. This doesn't impact Haitian ChatGPT's capabilities.
        </p>
      </div>

      {/* Characteristics */}
      <div className="pt-6 border-t border-border">
        <h3 className="font-semibold mb-2">Characteristics</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose additional customizations on top of your base style and tone.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span>Warm</span>
            <select
              value={preferences.characteristic_warm}
              onChange={(e) => handleUpdate({ characteristic_warm: e.target.value })}
              className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
            >
              {characteristicOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <span>Enthusiastic</span>
            <select
              value={preferences.characteristic_enthusiastic}
              onChange={(e) => handleUpdate({ characteristic_enthusiastic: e.target.value })}
              className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
            >
              {characteristicOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <span>Headers & Lists</span>
            <select
              value={preferences.characteristic_headers_lists}
              onChange={(e) => handleUpdate({ characteristic_headers_lists: e.target.value })}
              className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
            >
              {characteristicOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <span>Emoji</span>
            <select
              value={preferences.characteristic_emoji}
              onChange={(e) => handleUpdate({ characteristic_emoji: e.target.value })}
              className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
            >
              {characteristicOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="pt-6 border-t border-border">
        <h3 className="font-semibold mb-2">Custom instructions</h3>
        <textarea
          value={preferences.custom_instructions || ''}
          onChange={(e) => handleUpdate({ custom_instructions: e.target.value })}
          placeholder="Additional behavior, style, and tone preferences"
          rows={4}
          className="w-full px-3 py-2 bg-accent rounded-lg border border-border outline-none resize-none"
        />
      </div>

      {/* About You */}
      <div className="pt-6 border-t border-border">
        <h3 className="font-semibold mb-2">About you</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nickname</label>
            <input
              type="text"
              value={preferences.about_you_nickname || ''}
              onChange={(e) => handleUpdate({ about_you_nickname: e.target.value })}
              placeholder="What should Haitian ChatGPT call you?"
              className="w-full px-3 py-2 bg-accent rounded-lg border border-border outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Occupation</label>
            <input
              type="text"
              value={preferences.about_you_occupation || ''}
              onChange={(e) => handleUpdate({ about_you_occupation: e.target.value })}
              placeholder="Level 10 mage"
              className="w-full px-3 py-2 bg-accent rounded-lg border border-border outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">More about you</label>
            <textarea
              value={preferences.about_you_more || ''}
              onChange={(e) => handleUpdate({ about_you_more: e.target.value })}
              placeholder="Interests, values, or preferences to keep in mind"
              rows={3}
              className="w-full px-3 py-2 bg-accent rounded-lg border border-border outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Memory */}
      <div className="pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold">Memory</h3>
          <button className="p-1 hover:bg-accent rounded-full transition-colors">
            <Info className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="ml-auto px-3 py-1 text-sm border border-border rounded-lg hover:bg-accent transition-colors">
            Manage
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Reference saved memories</div>
              <div className="text-sm text-muted-foreground">Let Haitian ChatGPT save and use memories when responding</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.reference_saved_memories}
                onChange={(e) => handleUpdate({ reference_saved_memories: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Reference chat history</div>
              <div className="text-sm text-muted-foreground">Let Haitian ChatGPT reference recent conversations when responding</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.reference_chat_history}
                onChange={(e) => handleUpdate({ reference_chat_history: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Haitian ChatGPT may use Memory to personalize queries to search providers, such as Bing.{' '}
          <button className="text-primary hover:underline">Learn more</button>
        </p>
      </div>
    </div>
  );
}
