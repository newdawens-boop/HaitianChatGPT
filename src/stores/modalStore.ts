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
  isImageViewerOpen: boolean;
  isImageEditorOpen: boolean;
  isFileViewerOpen: boolean;
  currentImageUrl: string;
  currentFile: { name: string; content: string; type: string } | null;
  setUserMenuOpen: (open: boolean) => void;
  setHelpMenuOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setChatMenuOpen: (open: boolean) => void;
  setReportOpen: (open: boolean) => void;
  setMessageActionsOpen: (open: boolean) => void;
  setAttachmentMenuOpen: (open: boolean) => void;
  setBugReportOpen: (open: boolean) => void;
  setImageViewerOpen: (open: boolean) => void;
  setImageEditorOpen: (open: boolean) => void;
  setFileViewerOpen: (open: boolean) => void;
  setCurrentImageUrl: (url: string) => void;
  setCurrentFile: (file: { name: string; content: string; type: string } | null) => void;
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
  isImageViewerOpen: false,
  isImageEditorOpen: false,
  isFileViewerOpen: false,
  currentImageUrl: '',
  currentFile: null,
  setUserMenuOpen: (open) => set({ isUserMenuOpen: open }),
  setHelpMenuOpen: (open) => set({ isHelpMenuOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setChatMenuOpen: (open) => set({ isChatMenuOpen: open }),
  setReportOpen: (open) => set({ isReportOpen: open }),
  setMessageActionsOpen: (open) => set({ isMessageActionsOpen: open }),
  setAttachmentMenuOpen: (open) => set({ isAttachmentMenuOpen: open }),
  setBugReportOpen: (open) => set({ isBugReportOpen: open }),
  setImageViewerOpen: (open) => set({ isImageViewerOpen: open }),
  setImageEditorOpen: (open) => set({ isImageEditorOpen: open }),
  setFileViewerOpen: (open) => set({ isFileViewerOpen: open }),
  setCurrentImageUrl: (url) => set({ currentImageUrl: url }),
  setCurrentFile: (file) => set({ currentFile: file }),
  closeAll: () => set({
    isUserMenuOpen: false,
    isHelpMenuOpen: false,
    isSettingsOpen: false,
    isChatMenuOpen: false,
    isReportOpen: false,
    isMessageActionsOpen: false,
    isAttachmentMenuOpen: false,
    isBugReportOpen: false,
    isImageViewerOpen: false,
    isImageEditorOpen: false,
    isFileViewerOpen: false,
  }),
}));
