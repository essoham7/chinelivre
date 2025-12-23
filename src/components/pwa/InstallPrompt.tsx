import { useEffect } from 'react'
import { usePwaStore, BeforeInstallPromptEvent } from '../../store/pwaStore'
import { Download } from 'lucide-react'

export function InstallPrompt({ triggerOnMount = false }: { triggerOnMount?: boolean }) {
  const { deferredPrompt, showPrompt, requestShow, clear } = usePwaStore()

  useEffect(() => {
    if (triggerOnMount && deferredPrompt) requestShow()
  }, [triggerOnMount, deferredPrompt, requestShow])

  const handleInstall = async () => {
    const e: BeforeInstallPromptEvent | null = deferredPrompt
    if (!e) return
    await e.prompt()
    clear()
  }

  if (!deferredPrompt || !showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-md p-3 flex items-center space-x-3">
      <Download className="h-5 w-5 text-blue-600" />
      <div>
        <p className="text-sm font-medium text-gray-900">Installer l'application</p>
        <p className="text-xs text-gray-500">Ajoutez ChineLivre sur votre appareil</p>
      </div>
      <button
        onClick={handleInstall}
        className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Installer
      </button>
      <button
        onClick={() => clear()}
        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
      >
        Plus tard
      </button>
    </div>
  )
}
