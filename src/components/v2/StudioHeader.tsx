import { ArrowLeft, Gem } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCreditStore } from '@/store/credit-store'
import { useStudioStore } from '@/store/studio-store'
import { useEffect, useRef, useState } from 'react'

export function StudioHeader() {
  const navigate = useNavigate()
  const reset = useStudioStore((s) => s.reset)
  const balance = useCreditStore((s) => s.balance)
  const [animate, setAnimate] = useState(false)
  const prevBalance = useRef(balance)

  useEffect(() => {
    if (prevBalance.current !== balance) {
      setAnimate(true)
      const timer = setTimeout(() => setAnimate(false), 250)
      prevBalance.current = balance
      return () => clearTimeout(timer)
    }
  }, [balance])

  const handleExit = () => {
    if (window.confirm('Leave the studio? Your progress will be lost.')) {
      reset()
      navigate('/')
    }
  }

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-surface/80 backdrop-blur-sm border-b border-ih-border/50 shrink-0 z-30">
      <button
        onClick={handleExit}
        className="flex items-center gap-2 text-ih-muted hover:text-foreground transition-colors"
        aria-label="Exit studio"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-[14px] font-medium hidden sm:inline">Your Studio</span>
      </button>

      <div
        className="flex items-center gap-1.5"
        aria-label={`${balance} credits remaining`}
      >
        <Gem className="w-4 h-4 text-ih-accent" />
        <span
          className={`text-[14px] font-medium text-foreground tabular-nums ${
            animate ? 'animate-scale-bounce' : ''
          }`}
        >
          {balance}
        </span>
        <span className="text-[12px] text-ih-muted hidden sm:inline">Credits</span>
      </div>
    </header>
  )
}
