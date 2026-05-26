import { motion } from 'motion/react'
import { formatCountdown } from '@/store/referral-store'
import { cn } from '@/lib/utils'

type DiscountCountdownBarProps = {
  secondsRemaining: number
  gracePeriodActive: boolean
  onClick?: () => void
  className?: string
}

const TEXT_STYLE = {
  color: '#095D3F',
  fontFamily: '"Greed Standard VF", sans-serif',
  fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on",
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '18px',
} as const

export function DiscountCountdownBar({
  secondsRemaining,
  gracePeriodActive,
  onClick,
  className,
}: DiscountCountdownBarProps) {
  const [mm, ss] = formatCountdown(secondsRemaining).split(':')
  const interactive = typeof onClick === 'function'

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-center gap-1 px-2 py-[11px]',
        interactive && 'cursor-pointer',
        className,
      )}
      style={{
        background: 'linear-gradient(90deg, #90FBD6 0%, #BCF1C2 42.35%, #C8F9E8 100%)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <motion.div
        className="flex items-center gap-1"
        style={{ transformOrigin: 'center' }}
        animate={gracePeriodActive ? { scale: [1, 1.09, 1, 1.05, 1] } : { scale: 1 }}
        transition={
          gracePeriodActive
            ? { duration: 4, ease: 'easeInOut', repeat: Infinity, times: [0, 0.0625, 0.125, 0.1875, 1] }
            : { duration: 0 }
        }
      >
        {gracePeriodActive ? (
          <span style={TEXT_STYLE}>Last chance! Get Premium at ₹3,999</span>
        ) : (
          <>
            <span style={TEXT_STYLE}>Extra 25% off expires in</span>
            <span className="flex items-center gap-1">
              <span
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center text-white"
                style={{
                  backgroundColor: '#003000',
                  fontFamily: '"Greed Standard VF", sans-serif',
                  fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on",
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: '18px',
                }}
              >
                {mm}
              </span>
              <span style={TEXT_STYLE}>:</span>
              <span
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center text-white"
                style={{
                  backgroundColor: '#003000',
                  fontFamily: '"Greed Standard VF", sans-serif',
                  fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on",
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: '18px',
                }}
              >
                {ss}
              </span>
            </span>
            <span style={TEXT_STYLE}>mins</span>
          </>
        )}
      </motion.div>
    </div>
  )
}
