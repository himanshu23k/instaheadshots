import { Gem } from 'lucide-react'
import { useCreditStore } from '@/store/credit-store'
import { useEffect, useRef, useState } from 'react'

export function CreditIndicator() {
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

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`${balance} credits remaining`}
    >
      <Gem className="w-4 h-4 text-ih-accent" />
      <span
        className={`text-[14px] font-medium text-primary-cta ${
          animate ? 'animate-scale-bounce' : ''
        }`}
      >
        {balance}
      </span>
      <span className="text-[14px] text-ih-muted">Credits</span>
    </div>
  )
}
