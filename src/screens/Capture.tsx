import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { Select } from '../components/ui/Select'
import type { ViewId } from '../types'
import { addPersistentPhoto } from '../lib/evidenceStore'
import { getScenario } from '../data/mock'
import {
  getOrInitDraft,
  getDraft,
  patchDraft,
  type ClaimDraft,
  type DraftPhoto,
} from '../lib/claimStore'

export interface CaptureProps {
  onAnalyse: () => void
  onNavigate?: (v: ViewId) => void
  selectedScenarioId?: '1' | '2' | '3'
  onSelectScenario?: (id: '1' | '2' | '3') => void
}

interface EvidencePhotoSlot {
  id: string
  caption: string
  slotNumber: number
  targetDescription: string
  presetTag: string
  dataUrl?: string
  fileName?: string
  isUserUploaded: boolean
}

const SLOT_PRESETS = [
  { id: 'p1', caption: '1. Equipment Nameplate', targetDescription: 'Serial plate / specifications plate' },
  { id: 'p2', caption: '2. HMI Fault Screen', targetDescription: 'TCMS / Cab diagnostic fault code' },
  { id: 'p3', caption: '3. Depot Context', targetDescription: 'Depot physical mounting & installation angle' },
]

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

export default function Capture({
  onAnalyse,
  onNavigate,
  selectedScenarioId = '1',
  onSelectScenario,
}: CaptureProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [uploadToast, setUploadToast] = useState<string | null>(null)
  const [activeScenarioId, setActiveScenarioId] = useState<'1' | '2' | '3'>(selectedScenarioId)

  // ── Single source of truth: the persisted draft ──────────────────────────
  const [draft, setDraft] = useState<ClaimDraft>(() => getOrInitDraft(getScenario(selectedScenarioId)))

  const update = (patch: Partial<ClaimDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch }
      patchDraft(patch)
      return next
    })
  }

  // Scenario switch → re-seed the draft
  const applyScenario = (id: '1' | '2' | '3') => {
    setActiveScenarioId(id)
    onSelectScenario?.(id)
    const fresh = getOrInitDraft(getScenario(id))
    // Force a new draft when the user explicitly switches scenario
    const reseeded = { ...fresh, id: fresh.id, scenarioId: id, status: 'draft' as const }
    setDraft(reseeded)
    patchDraft(reseeded)
    setUploadToast(`Switched to ${getScenario(id).title}`)
    setTimeout(() => setUploadToast(null), 3000)
  }

  useEffect(() => {
    if (selectedScenarioId && selectedScenarioId !== activeScenarioId) {
      applyScenario(selectedScenarioId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenarioId])

  const evidencePhotos: EvidencePhotoSlot[] = SLOT_PRESETS.map((preset, i) => {
    const stored = draft.photos.find((p) => p.slot === i + 1)
    return {
      ...preset,
      slotNumber: i + 1,
      presetTag: stored?.tag ?? '',
      dataUrl: stored?.dataUrl,
      fileName: stored?.name,
      isUserUploaded: Boolean(stored),
    }
  })

  // ── Voice recording state ────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(draft.voiceSeconds)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const multiFileInputRef = useRef<HTMLInputElement>(null)
  const slotFileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const startRecording = async () => {
    setAudioError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      audioChunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : ''

      const options = mimeType ? { mimeType } : undefined
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const type = mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type })
        setAudioUrl(URL.createObjectURL(audioBlob))
        audioStreamRef.current?.getTracks().forEach((track) => track.stop())
        audioStreamRef.current = null
      }

      mediaRecorder.start(200)
      setIsRecording(true)
      setRecordSeconds(0)
      recordingTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } catch (err: any) {
      setAudioError(err?.message || 'Microphone access denied or unavailable.')
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    update({ hasVoiceNote: true, voiceSeconds: recordSeconds })
    setUploadToast('Voice note attached to claim draft.')
    setTimeout(() => setUploadToast(null), 3000)
  }

  const clearRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setRecordSeconds(0)
    setAudioError(null)
    update({ hasVoiceNote: false, voiceSeconds: 0 })
  }

  const simulateSampleRecording = () => {
    setAudioError(null)
    setAudioUrl('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=')
    setRecordSeconds(5)
    update({ hasVoiceNote: true, voiceSeconds: 5 })
    setUploadToast('Sample voice note attached.')
    setTimeout(() => setUploadToast(null), 3000)
  }

  // ── Photo upload: slot + store ───────────────────────────────────────────
  const handleSlotPhotoUpload = async (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string
      const compressed = await compressImage(rawDataUrl)
      const slotNum = index + 1
      const tag =
        slotNum === 1 ? draft.serialNumber : slotNum === 2 ? draft.faultCode : draft.depot

      const newPhoto: DraftPhoto = {
        slot: slotNum,
        name: file.name,
        dataUrl: compressed,
        tag,
        confidence: Math.floor(94 + Math.random() * 5),
      }

      const photos = [...draft.photos.filter((p) => p.slot !== slotNum), newPhoto]
      update({ photos })

      addPersistentPhoto({
        id: `UP-${Date.now()}-${index}`,
        name: file.name,
        claimId: draft.id,
        dataUrl: compressed,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hash: `0x${Math.random().toString(16).substring(2, 8)}...vault`,
        ocrTag: tag,
        confidence: newPhoto.confidence,
        isUserUploaded: true,
      })

      setUploadToast(`Uploaded "${file.name}" — tagged ${tag} (claim ${draft.id})`)
      setTimeout(() => setUploadToast(null), 4000)
    }
    reader.readAsDataURL(file)
  }

  const handleMultiImageUpload = (files: File[]) => {
    Array.from(files)
      .slice(0, 3)
      .forEach((file, idx) => handleSlotPhotoUpload(idx, file))
  }

  const resetAllPhotos = () => {
    update({ photos: [] })
    setUploadToast('Image slots cleared.')
    setTimeout(() => setUploadToast(null), 3000)
  }

  /** Launch the AI pipeline on the saved draft. */
  const handleAnalyze = () => {
    onAnalyse()
  }

  const uploadedCount = draft.photos.length

  const steps = [
    { num: 1, label: 'Equipment details' },
    { num: 2, label: 'Fault information' },
    { num: 3, label: 'Evidence' },
  ] as const

  const inputCls =
    'w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none'

  return (
    <div className="relative min-h-[calc(100vh-64px)] pb-28 text-white">
      <input
        type="file"
        ref={multiFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleMultiImageUpload(Array.from(e.target.files))
          }
        }}
        multiple
        accept="image/*"
        className="hidden"
      />

      {uploadToast && (
        <div className="fixed top-6 right-8 z-50 flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#111] px-4 py-3 text-xs text-white shadow-2xl">
          <Icon name="check" className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold">{uploadToast}</span>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => onNavigate?.('dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] transition-colors hover:text-white"
        >
          <Icon name="chevronLeft" className="h-3.5 w-3.5" />
          <span>Back to dashboard</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
            NEW WARRANTY CLAIM
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Capture field evidence
          </h1>
          <p className="mt-1.5 text-sm text-[#a1a1aa]">
            Draft <span className="font-mono text-white">{draft.id}</span> · auto-saved locally
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#141414] transition-colors cursor-pointer"
          >
            <Icon name="download" className="h-3.5 w-3.5" />
            <span>Jump to evidence</span>
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-extrabold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <Icon name="sparkles" className="h-4 w-4" />
            <span>Run AI analysis</span>
          </button>
        </div>
      </div>

      {/* ── Stepper ─────────────────────────────────────────────────────── */}
      <div className="mt-7 flex items-center gap-8 border-b border-[#1e1e1e]">
        {steps.map((step) => {
          const isActive = currentStep === step.num
          const isCompleted = currentStep > step.num
          return (
            <button
              key={step.num}
              type="button"
              onClick={() => setCurrentStep(step.num)}
              className="group relative pb-3 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                  isActive
                    ? 'bg-white text-black'
                    : isCompleted
                    ? 'bg-emerald-500 text-black'
                    : 'border border-[#262626] bg-[#141414] text-[#71717a]'
                }`}
              >
                {isCompleted ? '✓' : step.num}
              </div>
              <span
                className={`text-sm transition-colors ${
                  isActive ? 'font-semibold text-white' : 'font-normal text-[#71717a] group-hover:text-white'
                }`}
              >
                {step.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeStepUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Step Content ────────────────────────────────────────────────── */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3 mb-6">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#71717a]">
                  STEP 1 OF 3
                </span>
                <span className="text-xs text-[#71717a]">* Required</span>
              </div>

              <h2 className="text-2xl font-bold text-white">Equipment details</h2>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Auto-filled from the selected failure scenario. Edit freely — values flow into the pipeline, review and OEM dispatch.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Equipment type <span className="text-white">*</span>
                  </label>
                  <Select
                    value={draft.equipmentType}
                    onChange={(v) => update({ equipmentType: v })}
                    options={[
                      'Traction Motor',
                      'Door System',
                      'Brake System',
                      'HVAC Unit',
                      'Pantograph',
                      'Bogie',
                      'Coupler',
                      'Signaling Unit',
                      'Other',
                    ].map((o) => ({ value: o }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Manufacturer <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.manufacturer}
                    onChange={(e) => update({ manufacturer: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Model</label>
                  <input
                    type="text"
                    value={draft.model}
                    onChange={(e) => update({ model: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Serial number <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.serialNumber}
                    onChange={(e) => update({ serialNumber: e.target.value })}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-mono font-bold focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Train / set</label>
                  <input
                    type="text"
                    value={draft.trainset}
                    onChange={(e) => update({ trainset: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Component ID</label>
                  <input
                    type="text"
                    value={draft.componentId}
                    onChange={(e) => update({ componentId: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Next: Fault information →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3 mb-6">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#71717a]">
                  STEP 2 OF 3
                </span>
                <span className="text-xs text-[#71717a]">* Required</span>
              </div>

              <h2 className="text-2xl font-bold text-white">Fault information</h2>
              <p className="mt-1 text-sm text-[#a1a1aa] mb-7">
                These fields feed the pipeline's extraction and OEM mapping stages.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Fault summary / symptom <span className="text-white">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={draft.faultSummary}
                    onChange={(e) => update({ faultSummary: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Fault code <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.faultCode}
                    onChange={(e) => update({ faultCode: e.target.value })}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm font-mono font-bold text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Fault date</label>
                  <input
                    type="date"
                    value={draft.faultDate}
                    onChange={(e) => update({ faultDate: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Classification / Category</label>
                  <input
                    type="text"
                    value={draft.classification}
                    onChange={(e) => update({ classification: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Depot location</label>
                  <input
                    type="text"
                    value={draft.depot}
                    onChange={(e) => update({ depot: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="rounded-lg border border-[#262626] bg-[#000000] px-5 py-2.5 text-xs font-semibold text-[#a1a1aa] hover:text-white cursor-pointer"
                >
                  ← Back to Equipment
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Next: Evidence capture →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Evidence */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Voice */}
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e1e] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
                      <Icon name="mic" className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Voice Recording Session
                      </h3>
                      <p className="text-xs text-[#a1a1aa]">
                        Technician notes — attached to the draft and processed by the pipeline.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isRecording ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/50 border border-rose-800/60 px-3 py-1 text-xs font-mono font-bold text-rose-400">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        RECORDING
                      </span>
                    ) : draft.hasVoiceNote ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/60 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        ATTACHED ({formatSeconds(recordSeconds)})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141414] border border-[#262626] px-3 py-1 text-xs font-mono font-semibold text-[#a1a1aa]">
                        <span className="h-2 w-2 rounded-full bg-[#71717a]" />
                        NOT RECORDED
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-[#000000] border border-[#1e1e1e] p-5">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black hover:bg-neutral-200 transition-transform active:scale-95 shadow-lg shrink-0 cursor-pointer"
                          title="Start recording"
                        >
                          <Icon name="mic" className="h-6 w-6" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-transform active:scale-95 shrink-0 cursor-pointer"
                          title="Stop recording"
                        >
                          <div className="h-5 w-5 rounded bg-white" />
                        </button>
                      )}

                      <div>
                        <span className="text-2xl font-mono font-extrabold text-white">
                          {formatSeconds(recordSeconds)}
                        </span>
                        <p className="text-xs text-[#a1a1aa] mt-0.5">
                          {isRecording
                            ? 'Recording… click the red button to finish.'
                            : draft.hasVoiceNote
                            ? 'Voice note attached to this draft.'
                            : 'Click the microphone to record your voice note.'}
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                      {audioUrl && (
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <audio controls src={audioUrl} className="h-9 w-full sm:w-64 rounded bg-[#141414]" />
                          <button
                            type="button"
                            onClick={clearRecording}
                            className="rounded-lg border border-[#262626] bg-[#0a0a0a] px-3 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors shrink-0 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                      {!audioUrl && !isRecording && (
                        <button
                          type="button"
                          onClick={simulateSampleRecording}
                          className="rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3.5 py-2 text-xs text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                        >
                          Use sample audio
                        </button>
                      )}
                    </div>
                  </div>

                  {audioError && (
                    <div className="mt-4 rounded-lg bg-white/10 border border-white/20 p-3 text-xs text-neutral-300">
                      ⚠ {audioError}
                    </div>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e1e] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
                      <Icon name="camera" className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Visual Evidence (3 Angles)
                      </h3>
                      <p className="text-xs text-[#a1a1aa]">
                        Stored against claim <span className="font-mono text-white">{draft.id}</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {uploadedCount}/3 IMAGES ACQUIRED
                    </span>
                    <button
                      type="button"
                      onClick={() => multiFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      <Icon name="plus" className="h-3.5 w-3.5" />
                      <span>Upload 3 images</span>
                    </button>
                    {uploadedCount > 0 && (
                      <button
                        type="button"
                        onClick={resetAllPhotos}
                        className="rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 py-2 text-xs text-[#71717a] hover:text-white transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {evidencePhotos.map((photo, idx) => {
                    const hasImage = Boolean(photo.dataUrl)
                    return (
                      <div
                        key={photo.id}
                        className="rounded-xl border border-[#1e1e1e] bg-[#000000] p-4 flex flex-col justify-between hover:border-[#333333] transition-all group"
                      >
                        <input
                          type="file"
                          ref={(el) => {
                            slotFileInputRefs.current[idx] = el
                          }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleSlotPhotoUpload(idx, e.target.files[0])
                          }}
                          className="hidden"
                          accept="image/*"
                        />

                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="font-bold text-white uppercase text-[11px] truncate">
                            {photo.caption}
                          </span>
                          {hasImage ? (
                            <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                              ✓ ATTACHED
                            </span>
                          ) : (
                            <span className="text-[#71717a] font-mono text-[10px] border border-[#262626] px-1.5 py-0.5 rounded">
                              OPTIONAL
                            </span>
                          )}
                        </div>

                        {hasImage ? (
                          <div className="relative aspect-video rounded-lg border border-[#262626] bg-[#0a0a0a] overflow-hidden">
                            <img
                              src={photo.dataUrl}
                              alt={photo.caption}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                              <button
                                type="button"
                                onClick={() => slotFileInputRefs.current[idx]?.click()}
                                className="rounded bg-white text-black px-3 py-1 text-[11px] font-bold shadow cursor-pointer"
                              >
                                Replace
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => slotFileInputRefs.current[idx]?.click()}
                            className="relative aspect-video rounded-lg border-2 border-dashed border-[#262626] hover:border-neutral-500 bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141414] border border-[#262626] text-white mb-2">
                              <Icon name="camera" className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-white">Upload Image {idx + 1}</p>
                            <p className="text-[10px] text-[#71717a] mt-0.5">{photo.targetDescription}</p>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-[#1e1e1e] flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[#a1a1aa] font-semibold truncate">
                            {hasImage ? photo.fileName : 'No file'}
                          </span>
                          <button
                            type="button"
                            onClick={() => slotFileInputRefs.current[idx]?.click()}
                            className="text-white hover:underline font-bold text-xs cursor-pointer"
                          >
                            {hasImage ? 'Change' : 'Browse'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-5 py-2.5 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                >
                  ← Back to Fault Info
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-extrabold text-black shadow-md transition-colors hover:bg-neutral-200 cursor-pointer"
                >
                  <Icon name="sparkles" className="h-4 w-4" />
                  <span>Run AI analysis</span>
                  <Icon name="arrowRight" className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
