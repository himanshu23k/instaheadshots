const FACES = Array.from(
  { length: 12 },
  (_, i) => `/mock/faces/face-${String(i + 1).padStart(2, '0')}.jpg`,
)

type Props = {
  direction: 'left' | 'right'
  /** CSS duration string, e.g. "60s" */
  duration: string
  /** Tailwind class for tile height, e.g. "h-32" */
  tileHeight: string
  /** 0..1 */
  opacity?: number
  /** CSS blur length, e.g. "0.5px" */
  blur?: string
  /** Tailwind class for gap between tiles */
  gap?: string
}

/**
 * Seamless horizontal marquee of headshot tiles.
 * Doubles the tile array so the animation can translate -50% for a clean loop.
 */
export function DriftingFaces({
  direction,
  duration,
  tileHeight,
  opacity = 0.55,
  blur,
  gap = 'gap-3',
}: Props) {
  const tiles = [...FACES, ...FACES]
  return (
    <div className="overflow-hidden w-full">
      <div
        className={`flex ${gap} w-max will-change-transform`}
        style={{
          animation: `marquee-${direction} ${duration} linear infinite`,
          opacity,
          filter: blur ? `blur(${blur})` : undefined,
        }}
      >
        {tiles.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            aria-hidden
            draggable={false}
            className={`${tileHeight} aspect-square object-cover shrink-0 select-none pointer-events-none`}
          />
        ))}
      </div>
    </div>
  )
}
