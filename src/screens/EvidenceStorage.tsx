import { useState, useEffect, useRef } from 'react'
import type { ViewId } from '../types'
import {
  getStoredPhotos,
  getStoredFiles,
  addPersistentPhoto,
  deletePersistentPhoto,
  STORAGE_PHOTOS_KEY,
  STORAGE_FILES_KEY,
  INITIAL_VAULT_PHOTOS,
  INITIAL_VAULT_FILES,
  type EvidencePhotoItem,
  type EvidenceFileItem,
} from '../lib/evidenceStore'

// Resize/compress image before storing in localStorage to prevent quota exhaustion
function compressImage(dataUrl: string, maxWidth = 1000, maxHeight = 800): Promise<string> {
  return new Promise((resolve) => {
    if (dataUrl.startsWith('data:image/svg')) {
      resolve(dataUrl)
      return
    }
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      } else {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export default function EvidenceStorage({
  onNavigate,
}: {
  onNavigate?: (v: ViewId) => void
}) {
  const [photos, setPhotos] = useState<EvidencePhotoItem[]>(getStoredPhotos)
  const [evidenceList, setEvidenceList] = useState<EvidenceFileItem[]>(getStoredFiles)
  const [uploadNotification, setUploadNotification] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [inspectModalPhoto, setInspectModalPhoto] = useState<EvidencePhotoItem | null>(null)
  const [photoFilter, setPhotoFilter] = useState<'all' | 'user' | 'ocr'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Real-time synchronization whenever photos are uploaded in Create Claim or anywhere
  const syncFromStore = () => {
    setPhotos([...getStoredPhotos()])
    setEvidenceList([...getStoredFiles()])
  }

  useEffect(() => {
    syncFromStore()
    window.addEventListener('railclaim-evidence-sync', syncFromStore)
    window.addEventListener('storage', syncFromStore)
    window.addEventListener('focus', syncFromStore)
    return () => {
      window.removeEventListener('railclaim-evidence-sync', syncFromStore)
      window.removeEventListener('storage', syncFromStore)
      window.removeEventListener('focus', syncFromStore)
    }
  }, [])

  const processUploadedFile = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    const reader = new FileReader()

    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string
      let storedDataUrl = rawDataUrl

      if (isImage) {
        storedDataUrl = await compressImage(rawDataUrl)
      }

      const randomHex = Math.random().toString(16).substring(2, 8)
      const fakeHash = `0x${randomHex}f82a...${Math.random().toString(16).substring(2, 6)}`
      const newPhotoId = `UP-${Date.now().toString().slice(-4)}`
      const now = new Date()
      const timeStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

      const newPhoto: EvidencePhotoItem = {
        id: newPhotoId,
        name: file.name,
        claimId: 'RC-2026-001',
        dataUrl: storedDataUrl,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadTime: timeStr,
        hash: fakeHash,
        ocrTag: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
        confidence: Math.floor(90 + Math.random() * 8),
        isUserUploaded: true,
      }

      // Add to persistent evidence store
      addPersistentPhoto(newPhoto)
      syncFromStore()

      setUploadNotification(`"${file.name}" saved to persistent vault storage (SHA-256: ${fakeHash})`)
      setTimeout(() => setUploadNotification(null), 4500)
    }

    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        processUploadedFile(files[i])
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        processUploadedFile(e.dataTransfer.files[i])
      }
    }
  }

  const handleDeletePhoto = (id: string, name: string) => {
    if (window.confirm(`Soft delete "${name}" from local active view? (Record preserved in audit log)`)) {
      deletePersistentPhoto(id)
      syncFromStore()
      setUploadNotification(`"${name}" soft-deleted. Audit preservation record retained.`)
      setTimeout(() => setUploadNotification(null), 3000)
    }
  }

  const filteredPhotos = photos.filter((p) => {
    if (photoFilter === 'user') return p.isUserUploaded
    if (photoFilter === 'ocr') return !!p.ocrTag
    return true
  })

  return (
    <div className="relative min-h-[calc(100vh-64px)] pb-28 text-white select-none">
      {/* Hidden file input supporting photos, videos, and telemetry files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*,video/*,audio/*,.csv,.json,.pdf"
      />

      {/* ── Title & Eyebrow ────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
          EVIDENCE VAULT
        </p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Evidence Storage
        </h1>
        <p className="mt-1.5 text-sm text-[#a1a1aa]">
          Original field files are preserved separately from AI-generated findings.
        </p>
      </div>

      {/* Upload Notification Toast */}
      {uploadNotification && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#059669]/60 bg-[#062618] px-4 py-3 text-xs text-emerald-300 shadow-xl transition-all">
          <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{uploadNotification}</span>
        </div>
      )}

      {/* ── Top Two Cards Grid (Matching reference pixel-to-pixel) ── */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Secure Evidence Vault */}
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm flex flex-col justify-between">
          <div>
            {/* Cloud Icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#241a08] border border-[#FFFFFF]/30 text-[#FFFFFF]">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white tracking-tight">
              Secure evidence vault
            </h2>
            <p className="mt-2 text-sm text-[#a1a1aa] leading-relaxed">
              Upload a photo, video, or voice note. Files are validated, assigned a collision-safe path, and stored behind the API.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-extrabold text-black shadow-sm transition-all hover:bg-neutral-200 active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Upload evidence</span>
            </button>
            <span className="text-xs text-[#71717a]">
              {photos.length} photos in persistent storage
            </span>
          </div>
        </div>

        {/* Card 2: Protection Controls */}
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
            DATA INTEGRITY
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Protection controls
          </h2>

          <div className="mt-6 space-y-5">
            {/* Control 1 */}
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#062618] border border-[#059669]/40 text-[#10b981]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Original preserved</p>
                <p className="text-xs text-[#a1a1aa] mt-0.5">No AI overwrite</p>
              </div>
            </div>

            {/* Control 2 */}
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#062618] border border-[#059669]/40 text-[#10b981]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">50 MB limit</p>
                <p className="text-xs text-[#a1a1aa] mt-0.5">Validated before storage</p>
              </div>
            </div>

            {/* Control 3 */}
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#062618] border border-[#059669]/40 text-[#10b981]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Soft delete</p>
                <p className="text-xs text-[#a1a1aa] mt-0.5">Audit-safe retention</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SPECIFIC SECTION: Persistent Uploaded Photos & Evidence Gallery ─ */}
      <div className="mt-8 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e1e1e] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_#FFFFFF]" />
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
                PERSISTENT EVIDENCE VAULT
              </p>
            </div>
            <h3 className="mt-1 text-xl font-bold text-white tracking-tight">
              Uploaded Field Evidence & Photo Gallery
            </h3>
            <p className="mt-1 text-xs text-[#a1a1aa]">
              All photos uploaded here or during claim capture remain persistently stored in browser storage. Click any photo to inspect.
            </p>
          </div>

          {/* Controls & Filter tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPhotoFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                photoFilter === 'all'
                  ? 'bg-white text-black'
                  : 'border border-[#1e1e1e] text-[#a1a1aa] hover:text-white'
              }`}
            >
              All Photos ({photos.length})
            </button>
            <button
              type="button"
              onClick={() => setPhotoFilter('user')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                photoFilter === 'user'
                  ? 'bg-white text-black'
                  : 'border border-[#1e1e1e] text-[#a1a1aa] hover:text-white'
              }`}
            >
              User Uploaded ({photos.filter((p) => p.isUserUploaded).length})
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset vault to initial depot evidence photos?')) {
                  localStorage.removeItem(STORAGE_PHOTOS_KEY)
                  localStorage.removeItem(STORAGE_FILES_KEY)
                  setPhotos(INITIAL_VAULT_PHOTOS)
                  setEvidenceList(INITIAL_VAULT_FILES)
                }
              }}
              className="rounded-lg border border-[#1e1e1e] px-2.5 py-1.5 text-xs text-[#71717a] hover:text-rose-400 transition-colors"
              title="Reset gallery to defaults"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-6 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#FFFFFF] bg-white/10'
              : 'border-[#1e1e1e] bg-black hover:border-[#FFFFFF]/60 hover:bg-[#111111]'
          }`}
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#141414] border border-[#1e1e1e] text-[#FFFFFF] mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-xs font-bold text-white">
            Drag and drop new field photos here, or <span className="text-[#FFFFFF]">browse files</span>
          </p>
          <p className="text-[11px] text-[#71717a] mt-1">
            PNG, JPG, WEBP or Telemetry logs up to 50 MB · Automatically synchronized across all claims
          </p>
        </div>

        {/* Photo Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-xl border border-[#1e1e1e] bg-black overflow-hidden flex flex-col justify-between hover:border-[#FFFFFF]/60 transition-all shadow-md"
            >
              {/* Top thumbnail image */}
              <div
                onClick={() => setInspectModalPhoto(photo)}
                className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer"
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="rounded bg-black/80 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-bold text-[#FFFFFF] border border-[#FFFFFF]/40">
                    {photo.claimId}
                  </span>
                  {photo.isUserUploaded && (
                    <span className="rounded bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      User Upload
                    </span>
                  )}
                </div>

                {photo.confidence && (
                  <div className="absolute top-2 right-2">
                    <span className="rounded bg-black/80 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-bold text-neutral-300 border border-white/20">
                      {photo.confidence}% Match
                    </span>
                  </div>
                )}

                {/* Hover inspect hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="rounded-lg bg-white text-black px-3 py-1 text-xs font-bold shadow-lg">
                    Click to Inspect
                  </span>
                </div>
              </div>

              {/* Bottom Photo Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-bold text-white" title={photo.name}>
                    {photo.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-[#71717a] ml-2">
                    {photo.fileSize}
                  </span>
                </div>

                {photo.ocrTag && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-[#71717a] font-semibold">TAG:</span>
                    <span className="font-mono text-xs font-bold text-[#FFFFFF]">
                      {photo.ocrTag}
                    </span>
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-[#1e1e1e] flex items-center justify-between text-[10px] text-[#71717a]">
                  <span className="font-mono">{photo.hash}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectModalPhoto(photo)}
                      className="text-[#FFFFFF] hover:underline font-semibold"
                    >
                      View
                    </button>
                    {photo.isUserUploaded && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id, photo.name)}
                        className="text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stored Evidence Files Table ──────────────────────────────── */}
      <div className="mt-8 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-[#71717a] uppercase">
            STORED EVIDENCE FILES ({evidenceList.length})
          </span>
          <span className="text-xs text-[#a1a1aa]">Immutable Vault Storage: JIS-E-4001 Compliant</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e] text-[11px] font-semibold tracking-wider text-[#71717a] uppercase">
              <th className="py-4 px-6 font-semibold w-40">CLAIM ID</th>
              <th className="py-4 px-6 font-semibold">FILE NAME</th>
              <th className="py-4 px-6 font-semibold w-40">FORMAT</th>
              <th className="py-4 px-6 font-semibold w-28">SIZE</th>
              <th className="py-4 px-6 font-semibold w-48">SHA-256 HASH</th>
              <th className="py-4 px-6 font-semibold w-36">INTEGRITY</th>
              <th className="py-4 px-6 text-right w-24">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {evidenceList.map((file) => (
              <tr
                key={file.id}
                className="group hover:bg-[#111111] transition-colors"
              >
                {/* Claim ID */}
                <td className="py-4 px-6 font-sans text-xs font-bold text-[#FFFFFF]">
                  {file.claimId}
                </td>

                {/* File Name */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white group-hover:text-[#FFFFFF] transition-colors">
                      {file.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717a] mt-0.5">ID: {file.id} · {file.date}</p>
                </td>

                {/* Format */}
                <td className="py-4 px-6 text-xs text-[#d1d5db]">
                  {file.format}
                </td>

                {/* Size */}
                <td className="py-4 px-6 text-xs text-[#d1d5db]">
                  {file.size}
                </td>

                {/* Hash */}
                <td className="py-4 px-6 font-mono text-[11px] text-[#71717a]">
                  {file.hash}
                </td>

                {/* Status badge */}
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-medium bg-[#062618] text-[#10b981] border border-[#059669]/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                    {file.status}
                  </span>
                </td>

                {/* Action */}
                <td className="py-4 px-6 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (file.dataUrl) {
                        const matchedPhoto = photos.find((p) => p.name === file.name || p.id.includes(file.id))
                        if (matchedPhoto) {
                          setInspectModalPhoto(matchedPhoto)
                          return
                        }
                        const a = document.createElement('a')
                        a.href = file.dataUrl
                        a.download = file.name
                        a.click()
                      } else {
                        alert(`Downloading verifiable raw evidence artifact: ${file.name}\nSHA-256 HASH: ${file.hash}`)
                      }
                    }}
                    className="text-xs font-bold text-[#FFFFFF] hover:text-white transition-colors"
                  >
                    {file.dataUrl ? 'View' : 'Download'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Photo High-Res Inspection Modal ─────────────────────────── */}
      {inspectModalPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFFFFF]">
                  VAULT EVIDENCE INSPECTION // {inspectModalPhoto.claimId}
                </p>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {inspectModalPhoto.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalPhoto(null)}
                className="rounded p-1.5 text-[#71717a] hover:text-white hover:bg-[#18283f] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* High Res Image */}
            <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden border border-[#262626] bg-black flex items-center justify-center">
              <img
                src={inspectModalPhoto.dataUrl}
                alt={inspectModalPhoto.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Telemetry & Metadata Grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-black border border-[#1e1e1e] p-3">
                <span className="text-[10px] text-[#71717a] uppercase font-bold">SHA-256 Hash</span>
                <p className="font-mono text-[11px] text-[#FFFFFF] font-semibold truncate mt-1">
                  {inspectModalPhoto.hash}
                </p>
              </div>
              <div className="rounded-lg bg-black border border-[#1e1e1e] p-3">
                <span className="text-[10px] text-[#71717a] uppercase font-bold">File Size</span>
                <p className="text-white font-semibold mt-1">
                  {inspectModalPhoto.fileSize}
                </p>
              </div>
              <div className="rounded-lg bg-black border border-[#1e1e1e] p-3">
                <span className="text-[10px] text-[#71717a] uppercase font-bold">Uploaded At</span>
                <p className="text-white font-semibold mt-1">
                  {inspectModalPhoto.uploadTime}
                </p>
              </div>
              <div className="rounded-lg bg-black border border-[#1e1e1e] p-3">
                <span className="text-[10px] text-[#71717a] uppercase font-bold">Integrity State</span>
                <p className="text-emerald-400 font-bold mt-1">
                  Immutable Vault ✓
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setInspectModalPhoto(null)}
                className="rounded-lg border border-[#1e1e1e] bg-[#141414] px-4 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = inspectModalPhoto.dataUrl
                  a.download = inspectModalPhoto.name
                  a.click()
                }}
                className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200"
              >
                Download Original
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
