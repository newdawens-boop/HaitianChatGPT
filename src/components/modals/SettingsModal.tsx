import { useState } from 'react';
import { X, Settings, Bell, Palette, Grid3x3, ShoppingBag, Database, Shield, Users, User } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { GeneralSettings } from '../settings/GeneralSettings';
import { NotificationsSettings } from '../settings/NotificationsSettings';
import { PersonalizationSettings } from '../settings/PersonalizationSettings';
import { DataControlsSettings } from '../settings/DataControlsSettings';
import { SecuritySettings } from '../settings/SecuritySettings';
import { ParentalControlsSettings } from '../settings/ParentalControlsSettings';
import { OrdersSettings } from '../settings/OrdersSettings';

type SettingsTab = 'general' | 'notifications' | 'personalization' | 'apps' | 'orders' | 'data' | 'security' | 'parental' | 'account';

export function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen } = useModalStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  if (!isSettingsOpen) return null;

  const tabs = [
    { id: 'general' as const, icon: Settings, label: 'General' },
    { id: 'notifications' as const, icon: Bell, label: 'Notifications' },
    { id: 'personalization' as const, icon: Palette, label: 'Personalization' },
    { id: 'apps' as const, icon: Grid3x3, label: 'Apps' },
    { id: 'orders' as const, icon: ShoppingBag, label: 'Orders' },
    { id: 'data' as const, icon: Database, label: 'Data controls' },
    { id: 'security' as const, icon: Shield, label: 'Security' },
    { id: 'parental' as const, icon: Users, label: 'Parental controls' },
    { id: 'account' as const, icon: User, label: 'Account' },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={() => setSettingsOpen(false)}
      />
      <div className="fixed inset-4 md:inset-8 bg-background border border-border rounded-2xl shadow-2xl z-50 animate-fadeIn overflow-hidden flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">General</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-border overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === tab.id ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'personalization' && <PersonalizationSettings />}
          {activeTab === 'orders' && <OrdersSettings />}
          {activeTab === 'data' && <DataControlsSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'parental' && <ParentalControlsSettings />}
          {activeTab === 'apps' && (
            <div className="text-center py-12 text-muted-foreground">
              Apps settings coming soon
            </div>
          )}
          {activeTab === 'account' && (
            <div className="text-center py-12 text-muted-foreground">
              Account settings coming soon
            </div>
          )}
        </div>
      </div>
    </>
  );
}
