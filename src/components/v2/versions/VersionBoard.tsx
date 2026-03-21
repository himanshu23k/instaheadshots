import { useStudioStore } from '@/store/studio-store'
import { VersionCircle } from './VersionCircle'

export function VersionBoard() {
  const pinnedVersions = useStudioStore((s) => s.pinnedVersions)
  const currentComposite = useStudioStore((s) => s.currentComposite)
  const previewPinnedVersion = useStudioStore((s) => s.previewPinnedVersion)
  const unpinVersion = useStudioStore((s) => s.unpinVersion)

  if (pinnedVersions.length === 0) return null

  return (
    <div className="flex items-start gap-2" role="listbox" aria-label="Pinned versions">
      {pinnedVersions.map((version) => (
        <VersionCircle
          key={version.id}
          version={version}
          isActive={currentComposite === version.image}
          onPreview={previewPinnedVersion}
          onUnpin={unpinVersion}
        />
      ))}
    </div>
  )
}
