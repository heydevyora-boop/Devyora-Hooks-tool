import { useRef, useState, type DragEvent } from 'react'
import { Icon } from './Icon'

interface FileDropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  hint?: string
}

export function FileDropzone({
  onFiles,
  accept = 'image/*,video/*,.pdf,.doc,.docx',
  multiple = true,
  hint = 'Images, video, screenshots, or PDF/docs',
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    onFiles(Array.from(fileList))
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragActive(true)
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      className={`w-full rounded-xl border-2 border-dashed p-5 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-outline-variant bg-surface-container-low hover:bg-surface-container'
      }`}
    >
      <Icon name="upload_file" className="text-primary text-[28px]" />
      <span className="font-label-md text-label-md text-on-surface font-semibold">
        Drop files here, or click to browse
      </span>
      <span className="font-label-sm text-label-sm text-on-surface-variant">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
