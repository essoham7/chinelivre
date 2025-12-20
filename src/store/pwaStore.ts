import { create } from 'zustand'

type BeforeInstallPromptEvent = any

interface PwaState {
  deferredPrompt: BeforeInstallPromptEvent | null
  showPrompt: boolean
  setDeferredPrompt: (e: BeforeInstallPromptEvent | null) => void
  requestShow: () => void
  clear: () => void
}

export const usePwaStore = create<PwaState>((set, get) => ({
  deferredPrompt: null,
  showPrompt: false,
  setDeferredPrompt: (e) => set({ deferredPrompt: e }),
  requestShow: () => set({ showPrompt: true }),
  clear: () => set({ deferredPrompt: null, showPrompt: false })
}))
