import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { SPLASH_LOOKS } from './try-it-on-data'
import { C, FONT } from './tokens'

const A = '/try-it-on'
const EASE = [0.32, 0.72, 0, 1] as const

/** A tilted garment card peeking in from the side — Figma "image 57/58". */
function SideCard({ side, src }: { side: 'left' | 'right'; src: string }) {
  const left = side === 'left'
  const tilt = left ? 'rotate(-8deg) skewX(-8deg)' : 'rotate(8deg) skewX(8deg)'
  return (
    <div
      className="absolute top-[244px] h-[236px] w-[131px]"
      // Figma x = -58 and 318 on the 390 frame.
      style={{ left: left ? 'calc(50% - 253px)' : 'calc(50% + 123px)', transform: `${tilt} scaleY(0.99)` }}
    >
      {/* the card stacked behind */}
      <div
        className="absolute inset-0 rounded-[16px] bg-[#F4F4F4]"
        style={{ transform: `translate(${left ? -21 : 21}px, -13px)` }}
      />
      <div className="absolute inset-0 overflow-hidden rounded-[16px] border border-[#E0E1E1] bg-[#F9F9F9]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 size-full object-contain p-2"
            initial={{ opacity: 0, x: left ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: left ? 24 : -24 }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * Intro — Figma 370:84274. The model on the podium cycles through three
 * outfits while garment cards peek in from either side.
 */
export function Splash({ onStart }: { onStart: () => void }) {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % SPLASH_LOOKS.length), 2600)
    return () => window.clearInterval(t)
  }, [])
  const look = SPLASH_LOOKS[i]

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ ...FONT, background: 'linear-gradient(180deg, #FFFFFF 8.5%, #F7F7F8 65%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {/* All art is placed on Figma's 390-wide frame, centred. */}
      <div className="absolute inset-y-0 left-1/2 w-[390px] -translate-x-1/2">
        <img src={`${A}/splash-glow-a.svg`} alt="" className="absolute -left-[90px] -top-[71px] w-[207px] opacity-80" />
        <img src={`${A}/splash-glow-b.svg`} alt="" className="absolute left-[196px] top-[452px] w-[294px] opacity-80" />
        <img src={`${A}/splash-rays.svg`} alt="" className="absolute -left-[46px] -top-[47px] h-[344px] w-[484px]" />
        <img src={`${A}/splash-rings.svg`} alt="" className="absolute left-0 top-[549px] h-[162px] w-[390px]" />

        <SideCard side="left" src={look.left} />
        <SideCard side="right" src={look.right} />

        {/* Glass arch the model stands in */}
        <div
          className="absolute left-1/2 top-[149px] h-[366px] w-[200px] -translate-x-1/2 rounded-b-[16px] rounded-t-[999px] border border-[#F1F1F1] backdrop-blur-[6px]"
          style={{ background: 'rgba(255,255,255,0.44)', boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.4)' }}
        />
        <div className="absolute left-1/2 top-[149px] h-[366px] w-[199px] -translate-x-1/2 rounded-b-[16px] rounded-t-[999px] border-2 border-[#14DBDB]/40 blur-[2px]" />
        <img src={`${A}/splash-podium.svg`} alt="" className="absolute left-1/2 top-[576px] h-[76px] w-[143px] -translate-x-1/2" />

        <div className="absolute left-1/2 top-[160px] h-[466px] w-[300px] -translate-x-1/2">
          <AnimatePresence initial={false}>
            <motion.img
              key={look.model}
              src={look.model}
              alt="A model trying on outfits"
              className="absolute inset-0 size-full object-contain object-bottom"
              initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-0 top-[64px] flex flex-col items-center gap-1 text-center">
          <p className="text-[26px] leading-[32px] tracking-[-0.364px]" style={{ fontWeight: 350, color: C.text }}>
            See yourself in any
          </p>
          <p
            className="bg-clip-text text-[32px] leading-[32px] tracking-[-0.384px] text-transparent"
            style={{ fontWeight: 450, backgroundImage: 'linear-gradient(97deg, #070600 5.4%, #12844D 100%)' }}
          >
            o
            <span className="text-[28px] italic" style={{ fontFamily: '"Libre Baskerville", serif', fontWeight: 500 }}>
              u
            </span>
            tfit, any time
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="absolute right-6 top-4 flex h-[40px] items-center rounded-[6px] px-6 text-[14px] leading-[16px] transition-colors hover:bg-[#EEEEF0]"
        style={{ background: C.grey03, color: C.text, fontWeight: 420 }}
      >
        Skip
      </button>
      <button
        type="button"
        onClick={onStart}
        className="absolute bottom-5 left-1/2 flex h-[40px] -translate-x-1/2 items-center rounded-[6px] border px-6 text-[14px] leading-[16px] text-white transition-transform active:scale-95"
        style={{ background: C.text, borderColor: C.text, fontWeight: 450, boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.25)' }}
      >
        Try it On
      </button>
    </motion.div>
  )
}
