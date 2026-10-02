import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Gender } from './hairstylist-data'
import { MobilePreview, PreviewPanel } from './PreviewPanel'

const CREDITS = 50
const FONT = { fontFamily: 'var(--font-greed)' }

function Credits({ size }: { size: 'web' | 'mobile' }) {
  const web = size === 'web'
  return (
    <div className="flex items-center gap-1">
      <img src="/hairstylist/credits.svg" alt="" width={web ? 20 : 16} height={web ? 20 : 16} />
      <span
        className={web ? 'text-[18px] leading-5 tracking-[-0.09px]' : 'text-[16px] leading-[18px]'}
        style={{ ...FONT, fontWeight: web ? 420 : 450, color: 'var(--color-text-primary)' }}
      >
        {CREDITS}
      </span>
      <span className="sr-only">credits</span>
    </div>
  )
}

/** Figma "Header Container": back button only on web; back + credits on mobile. */
function TopBar({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="flex h-15 w-full shrink-0 items-center justify-between px-4 web:-ml-2 web:px-0">
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        aria-label="Go back"
        className="flex items-center justify-center rounded-md p-2 transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-button-icon-black)' }}
      >
        <ArrowLeft size={24} strokeWidth={1.5} />
      </button>
      <div className="px-2 web:hidden">
        <Credits size="mobile" />
      </div>
    </div>
  )
}

/**
 * Two layouts, one tree. At 1280px+ it is Figma's web frame (2342:21185): a
 * 358px form column with a hairline divider, its CTA docked at the bottom, and
 * the photo preview centred in the rest. Below that it is the 390 mobile frame
 * (2342:21246): the photo on top, the form under it, the CTA docked full-bleed.
 */
export function HairstylistShell({
  gender,
  title,
  onBack,
  footer,
  children,
}: {
  gender: Gender
  title: string
  onBack?: () => void
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-white web:bg-[#F7F7F8]" style={FONT}>
      <div className="mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col web:gap-3 web:px-6">
        <TopBar onBack={onBack} />

        <div className="flex min-h-0 flex-1">
          <aside
            className="relative flex min-h-0 w-full flex-col web:w-[358px] web:shrink-0 web:border-r web:pr-6"
            style={{ borderColor: 'var(--color-border-primary)' }}
          >
            <div className="hidden shrink-0 items-center justify-between pb-8 web:flex">
              <h1
                className="text-[26px] leading-7 tracking-[-0.312px]"
                style={{ ...FONT, fontWeight: 450, color: 'var(--color-text-primary)' }}
              >
                {title}
              </h1>
              <Credits size="web" />
            </div>

            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-6 web:px-0">
              <div className="mx-auto flex w-full max-w-[480px] flex-col gap-8 web:max-w-none">
                <div className="web:hidden">
                  <MobilePreview gender={gender} />
                </div>
                {children}
              </div>
            </div>

            {/* In flow rather than absolute: v2's dock grows when its pills appear,
                and an overlay would hide the last row of tiles behind it. The
                negative margins stretch it over the page gutter as in Figma (382 wide). */}
            <div
              className="relative shrink-0 bg-white px-6 py-3 web:-mx-6 web:bg-[#F7F7F8] web:py-4"
              style={{ filter: 'drop-shadow(0px -2px 6px rgba(0,0,0,0.06))' }}
            >
              <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3 web:max-w-none">{footer}</div>
            </div>
          </aside>

          <main className="hidden min-w-0 flex-1 justify-center px-6 pt-[14px] web:flex">
            <PreviewPanel gender={gender} />
          </main>
        </div>
      </div>
    </div>
  )
}
