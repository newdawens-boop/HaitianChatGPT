import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuestState {
  messageCount: number;
  isGuestMode: boolean;
  hasSeenWelcome: boolean;
  incrementMessageCount: () => void;
  setGuestMode: (isGuest: boolean) => void;
  setHasSeenWelcome: (seen: boolean) => void;
  resetGuestState: () => void;
  isLimitReached: () => boolean;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      messageCount: 0,
      isGuestMode: false,
      hasSeenWelcome: false,

      incrementMessageCount: () => {
        set((state) => ({
          messageCount: state.messageCount + 1,
        }));
      },

      setGuestMode: (isGuest: boolean) => {
        set({ isGuestMode: isGuest });
      },

      setHasSeenWelcome: (seen: boolean) => {
        set({ hasSeenWelcome: seen });
      },

      resetGuestState: () => {
        set({
          messageCount: 0,
          isGuestMode: false,
          hasSeenWelcome: false,
        });
      },

      isLimitReached: () => {
        const state = get();
        return state.isGuestMode && state.messageCount >= 10;
      },
    }),
    {
      name: 'guest-storage',
    }
  )
);
