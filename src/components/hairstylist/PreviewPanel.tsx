import type { Gender } from './hairstylist-data'

/**
 * The user's photo the hairstyle is applied to. Dummy until uploads are wired:
 * the Figma portrait for women, a /create-profile headshot for men (the Figma
 * file has no male portrait).
 */
const PHOTO: Record<Gender, string> = {
  woman: '/hairstylist/preview.jpg',
  man: '/create-profile/professional-male/2a2eacb518b35884.jpeg',
}

/** Figma "Image Display web" (2342:21207): 560px square, white hairline, soft shadow. */
export function PreviewPanel({ gender }: { gender: Gender }) {
  return (
    <div
      className="aspect-square self-start overflow-hidden bg-white"
      style={{
        // 560 in the 1280x738 frame; shrinks on short windows so it never runs off the bottom.
        width: 'min(560px, 100%, calc(100dvh - 130px))',
        border: '1.4px solid white',
        boxShadow: '0px 2px 40px 0px rgba(0,0,0,0.1)',
      }}
    >
      <img src={PHOTO[gender]} alt="Your photo" className="size-full object-cover object-[50%_12%]" />
    </div>
  )
}

/** Figma "Main Image" (2342:21251): 342x369, rounded 12, sits above the hairstyles strip. */
export function MobilePreview({ gender }: { gender: Gender }) {
  return (
    <div className="mx-auto aspect-[342/369] w-full max-w-[480px] overflow-hidden rounded-xl border border-white">
      <img src={PHOTO[gender]} alt="Your photo" className="size-full object-cover object-[50%_18%]" />
    </div>
  )
}
