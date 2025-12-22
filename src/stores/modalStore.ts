import { create } from 'zustand';

interface ModalState {
  isUserMenuOpen: boolean;
  isHelpMenuOpen: boolean;
  isSettingsOpen: boolean;
  isChatMenuOpen: boolean;
  isReportOpen: boolean;
  isMessageActionsOpen: boolean;
  isAttachmentMenuOpen: boolean;
  isBugReportOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  setHelpMenuOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setChatMenuOpen: (open: boolean) => void;
  setReportOpen: (open: boolean) => void;
  setMessageActionsOpen: (open: boolean) => void;
  setAttachmentMenuOpen: (open: boolean) => void;
  setBugReportOpen: (open: boolean) => void;
  closeAll: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isUserMenuOpen: false,
  isHelpMenuOpen: false,
  isSettingsOpen: false,
  isChatMenuOpen: false,
  isReportOpen: false,
  isMessageActionsOpen: false,
  isAttachmentMenuOpen: false,
  isBugReportOpen: false,
  setUserMenuOpen: (open) => set({ isUserMenuOpen: open }),
  setHelpMenuOpen: (open) => set({ isHelpMenuOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setChatMenuOpen: (open) => set({ isChatMenuOpen: open }),
  setReportOpen: (open) => set({ isReportOpen: open }),
  setMessageActionsOpen: (open) => set({ isMessageActionsOpen: open }),
  setAttachmentMenuOpen: (open) => set({ isAttachmentMenuOpen: open }),
  setBugReportOpen: (open) => set({ isBugReportOpen: open }),
  closeAll: () => set({
    isUserMenuOpen: false,
    isHelpMenuOpen: false,
    isSettingsOpen: false,
    isChatMenuOpen: false,
    isReportOpen: false,
    isMessageActionsOpen: false,
    isAttachmentMenuOpen: false,
    isBugReportOpen: false,
  }),
}));
