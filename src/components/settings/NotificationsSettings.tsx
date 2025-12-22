import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { settingsService } from '@/lib/settingsService';
import { UserPreferences } from '@/types/settings';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

export function NotificationsSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
      toast.success('Notification settings updated');
    } else {
      toast.error('Failed to update settings');
    }
    setActiveMenu(null);
  };

  const getNotifLabel = (value: string) => {
    const options: Record<string, string> = {
      'push': 'Push',
      'email': 'Email',
      'push,email': 'Push, Email',
      'none': 'Off',
    };
    return options[value] || value;
  };

  const NotificationOption = ({ 
    title, 
    description, 
    value, 
    field 
  }: { 
    title: string; 
    description: string; 
    value: string; 
    field: keyof UserPreferences;
  }) => {
    const isOpen = activeMenu === field;

    return (
      <div className="border-b border-border">
        <button
          onClick={() => setActiveMenu(isOpen ? null : field as string)}
          className="w-full flex items-center justify-between py-4 hover:bg-accent/50 px-2 rounded transition-colors"
        >
          <div className="text-left flex-1">
            <div className="font-medium">{title}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{getNotifLabel(value)}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="pb-3 px-2">
            <div className="bg-muted rounded-lg p-1 space-y-1">
              {[
                { value: 'push', label: 'Push' },
                { value: 'email', label: 'Email' },
                { value: 'push,email', label: 'Push, Email' },
                { value: 'none', label: 'Off' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleUpdate({ [field]: option.value })}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    value === option.value ? 'bg-background shadow' : 'hover:bg-background/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading || !preferences) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Notifications</h3>

      <div className="space-y-1">
        <NotificationOption
          title="Responses"
          description="Get notified when Haitian ChatGPT responds to requests that take time, like research or image generation."
          value={preferences.notif_responses}
          field="notif_responses"
        />

        <NotificationOption
          title="Group chats"
          description="You'll receive notifications for new messages from group chats."
          value={preferences.notif_group_chats}
          field="notif_group_chats"
        />

        <NotificationOption
          title="Tasks"
          description="Get notified when tasks you've created have updates."
          value={preferences.notif_tasks}
          field="notif_tasks"
        />

        <NotificationOption
          title="Projects"
          description="Get notified when you receive an email invitation to a shared project."
          value={preferences.notif_projects}
          field="notif_projects"
        />

        <NotificationOption
          title="Recommendations"
          description="Stay in the loop on new tools, tips, and features from Haitian ChatGPT."
          value={preferences.notif_recommendations}
          field="notif_recommendations"
        />
      </div>
    </div>
  );
}
