import { useState, useEffect, useRef } from 'react'
import type { ViewId } from '../types'
import { useMemo } from 'react'
import {
  getStoredPhotos,
  addPersistentPhoto,
  deletePersistentPhoto,
  type EvidencePhotoItem,
} from '../lib/evidenceStore'
import { getDraft, getSubmittedClaims } from '../lib/claimStore'
import { canApprove, getSession } from '../lib/auth'

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
      canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
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
  const [inspectPhoto, setInspectPhoto] = useState<EvidencePhotoItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sync = () => setPhotos([...getStoredPhotos()])

  useEffect(() => {
    sync()
    window.addEventListener('railclaim-evidence-sync', sync)
    return () => window.removeEventListener('railclaim-evidence-sync', sync)
  }, [])

  const say = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 3000)
  }

  // Resolve "title + unique number" per claim so the engineer knows which case each photo belongs to.
  const claimTitles = useMemo(() => {
    const map = new Map<string, string>()
    const draft = getDraft()
    if (draft) map.set(draft.id, `${draft.equipmentType} — ${draft.faultSummary}`)
    for (const s of getSubmittedClaims()) map.set(s.id, `${s.equipment} — ${s.fault}`)
    return map
  }, [photos])

  const groups = useMemo(() => {
    const map = new Map<string, EvidencePhotoItem[]>()
    for (const p of photos) {
      const key = p.claimId || 'Unassigned'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return [...map.entries()]
  }, [photos])

  const handleFiles = (files: FileList | File[]) => {
    // Standalone uploads attach to the active draft so they carry its unique claim number.
    const activeClaimId = getDraft()?.id ?? 'Unassigned'
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const compressed = await compressImage(e.target?.result as string)
        addPersistentPhoto({
          id: `UP-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          name: file.name,
          claimId: activeClaimId,
          dataUrl: compressed,
          fileSize: `${(file.size / 1048576).toFixed(1)} MB`,
          uploadTime: new Date().toLocaleString(),
          hash: '',
          ocrTag: '',
          confidence: 0,
          isUserUploaded: true,
        })
        sync()
        say(`"${file.name}" added.`)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      deletePersistentPhoto(id)
      sync()
      say(`"${name}" deleted.`)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] pb-16 text-white">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
        multiple
        accept="image/*"
      />

      {toast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-[calc(100vw-2rem)] rounded-lg border border-[#2a2a2a] bg-[#111] px-4 py-3 text-xs font-semibold shadow-2xl">
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
            EVIDENCE
          </p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight sm:text-4xl">
            Evidence ({photos.length})
          </h1>
          <p className="mt-1.5 text-sm text-[#a1a1aa]">
            Claim photos in one place. Click to inspect.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onNavigate?.('create')}
            className="rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#141414]"
          >
            + New claim
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-neutral-200"
          >
            Upload photos
          </button>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[#2a2a2a] bg-[#0a0a0a] p-12 text-center">
          <p className="text-sm font-semibold text-white">No evidence yet</p>
          <p className="mt-1 text-xs text-[#71717a]">
            Photos you attach in a claim show up here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map(([claimId, items]) => (
            <section key={claimId}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white px-2 py-1 font-mono text-[11px] font-bold text-black">
                  {claimId}
                </span>
                <h2 className="text-sm font-bold text-white">
                  {claimTitles.get(claimId) ?? (claimId === 'Unassigned' ? 'Unassigned uploads' : `Claim ${claimId}`)}
                </h2>
                <span className="font-mono text-[11px] text-[#71717a]">
                  {items.length} photo{items.length === 1 ? '' : 's'}
                </span>
                {claimId !== 'Unassigned' && canApprove(getSession()) && (
                  <button
                    type="button"
                    onClick={() => onNavigate?.('approval')}
                    className="ml-auto text-xs font-bold text-white hover:underline"
                  >
                    Open in approval →
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] hover:border-[#333] transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setInspectPhoto(photo)}
                      className="block w-full cursor-pointer"
                    >
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        className="aspect-video w-full object-cover"
                      />
                    </button>
                    <div className="flex items-center justify-between gap-2 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-white">{photo.name}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-[#71717a]">
                          {photo.claimId} · {photo.fileSize}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectPhoto(photo)}
                          className="text-xs font-bold text-white hover:underline"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(photo.id, photo.name)}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {inspectPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setInspectPhoto(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-[#262626] bg-[#0a0a0a] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-black">
                  {inspectPhoto.claimId}
                </span>
                <p className="mt-1.5 truncate text-sm font-bold">{inspectPhoto.name}</p>
                <p className="truncate text-xs text-[#a1a1aa]">
                  {claimTitles.get(inspectPhoto.claimId) ?? ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectPhoto(null)}
                className="rounded p-1.5 text-[#71717a] hover:text-white"
              >
                ✕
              </button>
            </div>
            <img
              src={inspectPhoto.dataUrl}
              alt={inspectPhoto.name}
              className="mt-4 max-h-[60vh] w-full rounded-lg object-contain bg-black"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectPhoto(null)}
                className="rounded-lg border border-[#262626] px-4 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = inspectPhoto.dataUrl
                  a.download = inspectPhoto.name
                  a.click()
                }}
                className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
