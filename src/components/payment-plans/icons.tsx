import type { SVGProps } from 'react'

/** Star burst / discount badge — 12-point sun shape with % center. */
export function DiscountStar({
  size = 22,
  variant = 'small',
  ...props
}: SVGProps<SVGSVGElement> & { size?: number; variant?: 'small' | 'large' }) {
  // Small variant — for the discount-toggle card. Large for the State 4 hero.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 0.5 L13.6 2.4 L16 1.2 L16.6 3.7 L19.2 3.7 L18.6 6.2 L21 7.3 L19.4 9.4 L21 11.4 L18.6 12.5 L19.2 15 L16.6 15 L16 17.5 L13.6 16.3 L12 18.2 L10.4 16.3 L8 17.5 L7.4 15 L4.8 15 L5.4 12.5 L3 11.4 L4.6 9.4 L3 7.3 L5.4 6.2 L4.8 3.7 L7.4 3.7 L8 1.2 L10.4 2.4 Z"
        fill={variant === 'large' ? '#00A36D' : '#0B6E4B'}
        transform="translate(0 2)"
      />
      <text
        x="12"
        y="13.5"
        textAnchor="middle"
        fill={variant === 'large' ? '#FFFFFF' : '#FFFFFF'}
        fontSize="8"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        %
      </text>
    </svg>
  )
}

/** Large hero discount star — for State 4 "25% off unlocked". */
export function DiscountStarHero({ size = 110 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M60 4 L68 16 L80 8 L82 24 L98 22 L96 38 L112 40 L102 54 L116 64 L102 74 L112 88 L96 90 L98 106 L82 104 L80 120 L68 112 L60 124 L52 112 L40 120 L38 104 L22 106 L24 90 L8 88 L18 74 L4 64 L18 54 L8 40 L24 38 L22 22 L38 24 L40 8 L52 16 Z"
        fill="#00A36D"
        transform="translate(0 -2) scale(0.95)"
      />
      <text
        x="60"
        y="74"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="44"
        fontWeight="800"
        fontFamily="'Greed Standard VF', system-ui, sans-serif"
      >
        %
      </text>
    </svg>
  )
}

/** Stylised "50" — exported from Figma. */
export function Icon50({ size = 64 }: { size?: number }) {
  return (
    <img
      src="/payment-plans/badge-50.png"
      alt="50"
      width={size}
      height={size}
      className="block select-none"
      draggable={false}
    />
  )
}

/** Stylised "4K" — exported from Figma. */
export function Icon4K({ size = 64 }: { size?: number }) {
  return (
    <img
      src="/payment-plans/badge-4k.png"
      alt="4K"
      width={size}
      height={size}
      className="block select-none"
      draggable={false}
    />
  )
}

/** Stylised "100" with credit hexagon — exported from Figma. */
export function Icon100({ size = 64 }: { size?: number }) {
  return (
    <img
      src="/payment-plans/badge-100.png"
      alt="100"
      width={size}
      height={size}
      className="block select-none"
      draggable={false}
    />
  )
}

/** Sparkle / 4-point star — used inside BEST VALUE ribbon. */
export function Sparkle({ size = 12, color = '#00EA9C' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z"
        fill={color}
      />
    </svg>
  )
}

/** Check / tick — used in feature strip on Standard/Starter cards. */
export function CheckIcon({ size = 14, color = '#011124' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
    </svg>
  )
}

/** X / cross — used in feature strip for "No credits". */
export function CrossIcon({ size = 14, color = '#011124' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  )
}

/** Stylised "SD" badge — Standard resolution icon. */
export function IconSD({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow depth layer */}
      <rect x="8" y="13" width="50" height="42" rx="2" fill="#001508" />
      {/* Green oval accent behind "D" */}
      <ellipse cx="42" cy="31" rx="14" ry="15" fill="#00A36D" />
      {/* Main card surface */}
      <rect x="6" y="9" width="50" height="42" rx="2" fill="#0B1D2E" />
      {/* S — muted */}
      <text x="21" y="38" textAnchor="middle" fill="#7A8A94" fontSize="26" fontWeight="800" fontFamily="system-ui, sans-serif">S</text>
      {/* D — white */}
      <text x="43" y="38" textAnchor="middle" fill="white" fontSize="26" fontWeight="800" fontFamily="system-ui, sans-serif">D</text>
    </svg>
  )
}

/** Stylised "03" badge — Select 3 headshots icon. */
export function Icon03({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow depth layer */}
      <rect x="8" y="13" width="50" height="42" rx="2" fill="#001508" />
      {/* Green oval accent behind "0" */}
      <ellipse cx="22" cy="31" rx="14" ry="15" fill="#00A36D" />
      {/* Main card surface */}
      <rect x="6" y="9" width="50" height="42" rx="2" fill="#0B1D2E" />
      {/* 0 — white */}
      <text x="22" y="38" textAnchor="middle" fill="white" fontSize="26" fontWeight="800" fontFamily="system-ui, sans-serif">0</text>
      {/* 3 — muted */}
      <text x="44" y="38" textAnchor="middle" fill="#7A8A94" fontSize="26" fontWeight="800" fontFamily="system-ui, sans-serif">3</text>
    </svg>
  )
}

/** No-credits badge — diamond outline with prohibition slash. */
export function IconNoCredits({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow hex */}
      <path d="M32 9L55 22V42L32 55L9 42V22Z" fill="#001508" transform="translate(0 3)" />
      {/* Green hex accent */}
      <path d="M32 9L55 22V42L32 55L9 42V22Z" fill="#00A36D" />
      {/* Dark main surface */}
      <path d="M32 11L53 23.5V40.5L32 53L11 40.5V23.5Z" fill="#0B1D2E" />
      {/* Gem wireframe — diamond + midline */}
      <path d="M32 19L44 29L32 39L20 29Z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" />
      <line x1="20" y1="29" x2="44" y2="29" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" />
      {/* Prohibition slash */}
      <line x1="19" y1="43" x2="45" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
