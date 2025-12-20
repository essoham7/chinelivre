import { useEffect, useState } from 'react'

function isStandalone(): boolean {
  const mq = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  const ios = (window.navigator as any).standalone === true
  return mq || ios
}

export function Splash() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isStandalone()) {
      setShow(true)
      const t = setTimeout(() => setShow(false), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="flex items-center space-x-3">
        <img src="/favicon.svg" alt="ChineLivre" className="h-10 w-10" />
        <span className="text-2xl font-bold text-blue-600">ChineLivre</span>
      </div>
    </div>
  )
}
