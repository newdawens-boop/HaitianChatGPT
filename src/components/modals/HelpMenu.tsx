import { HelpCircle, FileText, BookOpen, Bug, Download, ChevronRight } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';

export function HelpMenu() {
  const { isHelpMenuOpen, setHelpMenuOpen, setBugReportOpen } = useModalStore();

  if (!isHelpMenuOpen) return null;

  const handleItemClick = (label: string) => {
    if (label === 'Report bug') {
      setHelpMenuOpen(false);
      setBugReportOpen(true);
    }
  };

  const helpItems = [
    { icon: HelpCircle, label: 'Help center', external: true },
    { icon: FileText, label: 'Release notes', external: true },
    { icon: BookOpen, label: 'Terms & policies', external: true },
    { icon: Bug, label: 'Report bug' },
    { icon: Download, label: 'Download apps', external: true },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-fadeIn"
        onClick={() => setHelpMenuOpen(false)}
      />
      <div className="fixed top-16 right-4 w-80 bg-popover border border-border rounded-2xl shadow-2xl z-50 animate-fadeIn overflow-hidden">
        <div className="p-2">
          {helpItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item.label)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.external && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
