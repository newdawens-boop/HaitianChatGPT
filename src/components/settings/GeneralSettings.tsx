import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { settingsService } from '@/lib/settingsService';
import { UserPreferences } from '@/types/settings';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

export function GeneralSettings() {
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
      toast.success('Settings updated');
    } else {
      toast.error('Failed to update settings');
    }
  };

  if (isLoading || !preferences) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">General</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-medium">Appearance</div>
            </div>
            <select
              value={preferences.appearance}
              onChange={(e) => handleUpdate({ appearance: e.target.value })}
              className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-medium">Accent color</div>
            </div>
            <select
              value={preferences.accent_color}
              onChange={(e) => handleUpdate({ accent_color: e.target.value })}
              className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
            >
              <option value="default">Default</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-medium">Language</div>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => handleUpdate({ language: e.target.value })}
              className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
            >
              <option value="auto">Auto-detect</option>
              <option value="en">English</option>
              <option value="ht">Haitian Creole</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-medium">Spoken language</div>
              <div className="text-sm text-muted-foreground">For best results, select the language you mainly speak</div>
            </div>
            <select
              value={preferences.spoken_language}
              onChange={(e) => handleUpdate({ spoken_language: e.target.value })}
              className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
            >
              <option value="auto">Auto-detect</option>
              <option value="en">English</option>
              <option value="ht">Haitian Creole</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium">Voice</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-accent rounded-lg border border-border hover:bg-accent/80 transition-colors">
                <span className="text-sm">▶ Play</span>
              </button>
              <select
                value={preferences.voice}
                onChange={(e) => handleUpdate({ voice: e.target.value })}
                className="px-3 py-1.5 bg-accent rounded-lg border border-border outline-none"
              >
                <option value="cove">Cove</option>
                <option value="sky">Sky</option>
                <option value="breeze">Breeze</option>
                <option value="ember">Ember</option>
                <option value="juniper">Juniper</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="pt-6 border-t border-border">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer font-semibold mb-4">
            <span>Advanced</span>
            <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
          </summary>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Web search</div>
                <div className="text-sm text-muted-foreground">Let Haitian ChatGPT automatically search the web for answers</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.web_search}
                  onChange={(e) => handleUpdate({ web_search: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Code</div>
                <div className="text-sm text-muted-foreground">Let Haitian ChatGPT execute code using Code Interpreter</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.code_interpreter}
                  onChange={(e) => handleUpdate({ code_interpreter: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Canvas</div>
                <div className="text-sm text-muted-foreground">Collaborate with Haitian ChatGPT on text and code</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.canvas}
                  onChange={(e) => handleUpdate({ canvas: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Haitian ChatGPT Voice</div>
                <div className="text-sm text-muted-foreground">Enable voice mode in Haitian ChatGPT</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.voice_mode}
                  onChange={(e) => handleUpdate({ voice_mode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Advanced voice</div>
                <div className="text-sm text-muted-foreground">Have more natural conversations in voice mode</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.advanced_voice}
                  onChange={(e) => handleUpdate({ advanced_voice: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Connector search</div>
                <div className="text-sm text-muted-foreground">Let Haitian ChatGPT automatically search connected sources for answers</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.connector_search}
                  onChange={(e) => handleUpdate({ connector_search: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
