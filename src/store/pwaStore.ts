import { create } from 'zustand'

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PwaState {
  deferredPrompt: BeforeInstallPromptEvent | null
  showPrompt: boolean
  setDeferredPrompt: (e: BeforeInstallPromptEvent | null) => void
  requestShow: () => void
  clear: () => void
}

export const usePwaStore = create<PwaState>((set) => ({
  deferredPrompt: null,
  showPrompt: false,
  setDeferredPrompt: (e) => set({ deferredPrompt: e }),
  requestShow: () => set({ showPrompt: true }),
  clear: () => set({ deferredPrompt: null, showPrompt: false })
}))
