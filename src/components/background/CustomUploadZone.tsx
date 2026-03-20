import { useState, useRef, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomUploadZoneProps {
  onUploadComplete: (imageUrl: string) => void
}

export function CustomUploadZone({ onUploadComplete }: CustomUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      return 'Only JPG or PNG files are supported.'
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File is too large. Max 10 MB.'
    }
    return null
  }

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setUploading(true)
      setProgress(0)

      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval)
            return 100
          }
          return p + Math.random() * 30
        })
      }, 300)

      // Simulate upload completion
      setTimeout(() => {
        clearInterval(interval)
        setProgress(100)
        setUploading(false)
        // Create a local URL for the uploaded file
        const url = URL.createObjectURL(file)
        onUploadComplete(url)
      }, 1500)
    },
    [onUploadComplete]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          border-[1.5px] border-dashed rounded-[var(--radius-card)] min-h-[140px]
          flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
          ${error
            ? 'border-ih-danger bg-ih-danger-bg'
            : dragOver
            ? 'border-ih-accent bg-ih-accent-bg'
            : 'border-ih-disabled bg-[#FAFAFA]'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="w-full px-6">
            <p className="text-[14px] text-primary-cta mb-2 truncate">Uploading...</p>
            <div className="w-full h-1 bg-ih-border rounded-full overflow-hidden">
              <div
                className="h-full bg-ih-accent rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-[12px] text-ih-muted text-right mt-1">
              {Math.round(Math.min(progress, 100))}%
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 text-ih-muted" />
            <p className="text-[14px] text-primary-cta">Drag & drop or browse</p>
            <p className="text-[12px] text-ih-muted">
              JPG or PNG &middot; Min 1000px wide &middot; Max 10 MB
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1 border-ih-border text-primary-cta"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Browse Files
            </Button>
          </>
        )}
      </div>

      {error && (
        <p className="text-ih-danger text-[12px] mt-2 flex items-center gap-1" role="alert">
          <span>!</span> {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
