import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { LANGUAGES } from '../data/mock'
import type { ViewId } from '../types'

export interface CaptureProps {
  onAnalyse: () => void
  onNavigate?: (v: ViewId) => void
}

import { addPersistentPhoto } from '../lib/evidenceStore'

interface EvidencePhotoSlot {
  id: string
  caption: string
  kind: string
  dataUrl?: string
  fileName?: string
  confidence: number
  tag?: string
  isUserUploaded: boolean
  annotations: { id: string; label: string; value: string; confidence: number }[]
}

const STORAGE_CLAIM_PHOTOS = 'RAILCLAIM_CLAIM_PHOTOS_PERSIST_V2'

// SVG presets for initial depot angles
const SVG_NAMEPLATE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230b1526"/><rect x="40" y="40" width="520" height="320" rx="12" fill="%23132238" stroke="%23223e66" stroke-width="3"/><rect x="70" y="80" width="460" height="120" rx="8" fill="%2309111e" stroke="%2300c2ff" stroke-width="2" stroke-dasharray="4"/><text x="90" y="115" fill="%235a7596" font-family="monospace" font-size="14" font-weight="bold">OCR DETECTED [91% CONFIDENCE]</text><text x="90" y="155" fill="%2300c2ff" font-family="monospace" font-size="28" font-weight="900">MB5085-2274-K</text><text x="90" y="180" fill="%23738ea8" font-family="monospace" font-size="14">MFG: 2023-03 · JIS-E-4001 COMPLIANT</text><text x="70" y="240" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold">MITSUBISHI ELECTRIC ROLLING STOCK DIVISION</text><text x="70" y="270" fill="%23738ea8" font-family="monospace" font-size="13">3-PHASE INDUCTION MOTOR · 220 kW · 18,420 RUNNING HOURS</text><circle cx="500" cy="300" r="28" fill="%23062618" stroke="%2310b981" stroke-width="2"/><path d="M490 300 l8 8 l16 -16" fill="none" stroke="%2310b981" stroke-width="3" stroke-linecap="round"/></svg>`
const SVG_HMI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23060c18"/><rect x="40" y="40" width="520" height="320" rx="8" fill="%230f192b" stroke="%23dc2626" stroke-width="3"/><rect x="70" y="70" width="460" height="80" fill="%233b0d0d" rx="6"/><text x="90" y="115" fill="%23f87171" font-family="sans-serif" font-size="20" font-weight="bold">⚠ TCMS FAULT ALERT // BAY 4 MUTTOM</text><rect x="70" y="170" width="220" height="150" fill="%2309111e" rx="8" stroke="%23f59e0b" stroke-width="2"/><text x="90" y="210" fill="%235a7596" font-family="monospace" font-size="13">FAULT CODE [94%]</text><text x="90" y="260" fill="%23f59e0b" font-family="monospace" font-size="36" font-weight="bold">E-042</text><text x="90" y="295" fill="%23f87171" font-family="monospace" font-size="12">IGBT THERMAL OVERLOAD</text><rect x="310" y="170" width="220" height="150" fill="%2309111e" rx="8" stroke="%2318283f" stroke-width="1"/><text x="330" y="210" fill="%235a7596" font-family="monospace" font-size="13">PEAK TEMPERATURE</text><text x="330" y="260" fill="%23ffffff" font-family="monospace" font-size="36" font-weight="bold">145 °C</text><text x="330" y="295" fill="%2338bdf8" font-family="monospace" font-size="12">SPEED: 82.4 KM/H</text></svg>`
const SVG_BOGIE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230a1322"/><circle cx="160" cy="220" r="100" fill="%23132238" stroke="%232e4d77" stroke-width="6"/><circle cx="160" cy="220" r="40" fill="%23060c18" stroke="%2300c2ff" stroke-width="3"/><circle cx="440" cy="220" r="100" fill="%23132238" stroke="%232e4d77" stroke-width="6"/><circle cx="440" cy="220" r="40" fill="%23060c18" stroke="%2300c2ff" stroke-width="3"/><rect x="80" y="120" width="440" height="30" rx="4" fill="%231f375b" stroke="%233b6399" stroke-width="2"/><rect x="220" y="160" width="160" height="90" rx="8" fill="%230c182a" stroke="%2300c2ff" stroke-width="2" stroke-dasharray="6"/><text x="235" y="200" fill="%2300c2ff" font-family="monospace" font-size="13" font-weight="bold">TRACTION MOTOR BAY</text><text x="235" y="225" fill="%23738ea8" font-family="monospace" font-size="12">AXLE MOUNTING: OK</text><text x="50" y="360" fill="%235a7596" font-family="monospace" font-size="13">DEPOT INSPECTION ANGLE 3 // MUTTOM BAY #4</text></svg>`

const INITIAL_CLAIM_PHOTOS: EvidencePhotoSlot[] = [
  {
    id: 'p1',
    caption: 'NAMEPLATE — TRACTION MOTOR',
    kind: 'nameplate',
    dataUrl: SVG_NAMEPLATE,
    confidence: 91,
    tag: 'MB5085-2274-K',
    isUserUploaded: false,
    annotations: [
      { id: 'a1', label: 'Serial', value: 'MB5085-2274-K', confidence: 0.91 },
      { id: 'a2', label: 'Mfg. date', value: '2023-03', confidence: 0.96 },
    ],
  },
  {
    id: 'p2',
    caption: 'HMI FAULT DISPLAY',
    kind: 'hmi',
    dataUrl: SVG_HMI,
    confidence: 94,
    tag: 'E-042',
    isUserUploaded: false,
    annotations: [
      { id: 'a3', label: 'Code', value: 'E-042', confidence: 0.94 },
      { id: 'a4', label: 'Temp', value: '145 °C', confidence: 0.88 },
    ],
  },
  {
    id: 'p3',
    caption: 'INSTALLATION CONTEXT',
    kind: 'context',
    dataUrl: SVG_BOGIE,
    confidence: 89,
    tag: 'Depot Angle Verified',
    isUserUploaded: false,
    annotations: [
      { id: 'a5', label: 'Mounting', value: 'Axle B-Frame', confidence: 0.89 },
      { id: 'a6', label: 'Depot', value: 'Muttom Bay #4', confidence: 0.95 },
    ],
  },
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

export default function Capture({ onAnalyse, onNavigate }: CaptureProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [wokenServers, setWokenServers] = useState(false)
  const [uploadToast, setUploadToast] = useState<string | null>(null)

  // Persistent Evidence Photos
  const [evidencePhotos, setEvidencePhotos] = useState<EvidencePhotoSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLAIM_PHOTOS)
      if (saved) return JSON.parse(saved)
    } catch {
      // Fallback
    }
    return INITIAL_CLAIM_PHOTOS
  })

  // Step 1 Form state
  const [equipmentType, setEquipmentType] = useState('Traction Motor')
  const [manufacturer, setManufacturer] = useState('Example OEM')
  const [serialNumber, setSerialNumber] = useState('MB5085-2274-K')
  const [trainsetCar, setTrainsetCar] = useState('TS-04 / Coach C2')
  const [depotLocation, setDepotLocation] = useState('Kochi Muttom Depot Bay #4')
  const [operatingLine, setOperatingLine] = useState('Line 1 - Blue Corridor')

  // Step 2 Form state
  const [faultSummary, setFaultSummary] = useState('Abnormal vibration and high thermal reading during acceleration phase')
  const [faultCode, setFaultCode] = useState('E-042')
  const [severity, setSeverity] = useState('Critical (Level 1)')
  const [operatingTemp, setOperatingTemp] = useState('145 °C')

  // Step 3 Evidence states
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('ta')
  const [activePhotoModal, setActivePhotoModal] = useState<number | null>(null)

  const generalFileInputRef = useRef<HTMLInputElement>(null)
  const slotFileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Persist photos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLAIM_PHOTOS, JSON.stringify(evidencePhotos))
    } catch (e) {
      console.warn('LocalStorage save failed:', e)
    }
  }, [evidencePhotos])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isRecording) {
      interval = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } else {
      setRecordSeconds(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Handle uploading image to a specific slot index
  const handleSlotPhotoUpload = async (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string
      const compressed = await compressImage(rawDataUrl)

      setEvidencePhotos((prev) => {
        const updated = [...prev]
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            dataUrl: compressed,
            fileName: file.name,
            isUserUploaded: true,
            confidence: Math.floor(92 + Math.random() * 6),
            tag: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
            annotations: [
              { id: `u1-${Date.now()}`, label: 'User File', value: file.name, confidence: 0.96 },
              { id: `u2-${Date.now()}`, label: 'Status', value: 'Field Verified', confidence: 0.94 },
              { id: `u3-${Date.now()}`, label: 'Storage', value: 'Persistent Vault', confidence: 1.0 },
            ],
          }
        }
        return updated
      })

      // Sync to general persistent evidence vault
      addPersistentPhoto({
        id: `UP-${Date.now()}`,
        name: file.name,
        claimId: 'RC-2026-001',
        dataUrl: compressed,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hash: `0x${Math.random().toString(16).substring(2, 8)}...vault`,
        ocrTag: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
        confidence: 95,
        isUserUploaded: true,
      })

      setUploadToast(`Uploaded "${file.name}" to Angle ${index + 1} (Saved persistently to Evidence)`)
      setTimeout(() => setUploadToast(null), 4000)
    }
    reader.readAsDataURL(file)
  }

  // Handle general image upload (adds a new angle and saves to persistent evidence)
  const handleGeneralImageUpload = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string
      const compressed = await compressImage(rawDataUrl)

      const newSlot: EvidencePhotoSlot = {
        id: `p-${Date.now()}`,
        caption: `USER EVIDENCE — ${file.name.slice(0, 20)}`,
        kind: 'user_angle',
        dataUrl: compressed,
        fileName: file.name,
        confidence: 95,
        tag: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
        isUserUploaded: true,
        annotations: [
          { id: `g1-${Date.now()}`, label: 'File', value: file.name, confidence: 0.95 },
          { id: `g2-${Date.now()}`, label: 'Size', value: `${(file.size / 1024).toFixed(0)} KB`, confidence: 1.0 },
        ],
      }

      setEvidencePhotos((prev) => [newSlot, ...prev])

      // Sync to general persistent evidence vault
      addPersistentPhoto({
        id: `UP-${Date.now()}`,
        name: file.name,
        claimId: 'RC-2026-001',
        dataUrl: compressed,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hash: `0x${Math.random().toString(16).substring(2, 8)}...vault`,
        ocrTag: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
        confidence: 95,
        isUserUploaded: true,
      })

      setUploadToast(`Image "${file.name}" added to evidence angles and saved to Evidence Vault`)
      setTimeout(() => setUploadToast(null), 4000)
    }
    reader.readAsDataURL(file)
  }

  const steps = [
    { num: 1, label: 'Equipment details' },
    { num: 2, label: 'Fault information' },
    { num: 3, label: 'Evidence' },
    { num: 4, label: 'Review & analyze' },
  ] as const

  return (
    <div className="relative min-h-[calc(100vh-64px)] pb-28 text-white select-none">
      {/* General hidden file input */}
      <input
        type="file"
        ref={generalFileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) handleGeneralImageUpload(e.target.files[0])
        }}
        className="hidden"
        accept="image/*"
      />

      {/* ── Back to Dashboard Link ──────────────────────────────────── */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('dashboard') : window.location.hash = '/dashboard'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#00c2ff] transition-colors hover:text-[#38d4ff]"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to dashboard</span>
        </button>
      </div>

      {/* ── Eyebrow & Title Row with Auto-saving draft ─────────────── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
            NEW WARRANTY CLAIM
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Capture field evidence
          </h1>
          <p className="mt-1.5 text-sm text-[#a1a1aa]">
            Start with the facts. RailClaim AI will structure the claim for engineer review.
          </p>
        </div>

        {/* Auto-saving draft indicator */}
        <div className="self-start md:self-auto">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3.5 py-1.5 text-xs text-[#d1d5db]">
            <span className="h-2 w-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
            <span className="font-medium">Auto-saving draft</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {uploadToast && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#00c2ff]/50 bg-[#061826] px-4 py-3 text-xs text-[#00c2ff] shadow-xl">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{uploadToast}</span>
        </div>
      )}

      {/* ── Stepper Navigation ──────────────────────────────────────── */}
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
                    ? 'bg-[#00c2ff] text-black shadow-[0_0_10px_rgba(0,194,255,0.4)]'
                    : isCompleted
                    ? 'bg-[#10b981] text-black'
                    : 'border border-[#262626] bg-[#141414] text-[#71717a]'
                }`}
              >
                {isCompleted ? '✓' : step.num}
              </div>
              <span
                className={`text-sm transition-colors ${
                  isActive
                    ? 'font-semibold text-white'
                    : 'font-normal text-[#71717a] group-hover:text-white'
                }`}
              >
                {step.label}
              </span>

              {/* Active cyan indicator line */}
              {isActive && (
                <motion.div
                  layoutId="activeStepUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00c2ff]"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Step Content Panels ─────────────────────────────────────── */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: Equipment Details */}
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
                  STEP 1 OF 4
                </span>
                <span className="text-xs text-[#71717a]">* Required</span>
              </div>

              <h2 className="text-2xl font-bold text-white">Equipment details</h2>
              <p className="mt-1 text-sm text-[#a1a1aa] mb-7">
                Required fields help reduce back-and-forth with engineering and the OEM.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equipment Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Equipment type <span className="text-[#00c2ff]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={equipmentType}
                      onChange={(e) => setEquipmentType(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                    >
                      <option value="Traction Motor">Traction Motor</option>
                      <option value="Brake Control Unit">Brake Control Unit</option>
                      <option value="Door Actuator">Door Actuator</option>
                      <option value="Pantograph Assembly">Pantograph Assembly</option>
                      <option value="Auxiliary Power Unit">Auxiliary Power Unit</option>
                      <option value="HVAC Compressor">HVAC Compressor</option>
                    </select>
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00c2ff] text-xs">
                      *
                    </span>
                  </div>
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Manufacturer <span className="text-[#00c2ff]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      placeholder="Example OEM"
                      className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00c2ff] text-xs">
                      *
                    </span>
                  </div>
                </div>

                {/* Serial Number / Asset ID */}
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Serial number / Asset ID <span className="text-[#00c2ff]">*</span>
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                  />
                </div>

                {/* Trainset / Car Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Trainset / Car number <span className="text-[#00c2ff]">*</span>
                  </label>
                  <input
                    type="text"
                    value={trainsetCar}
                    onChange={(e) => setTrainsetCar(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                  />
                </div>

                {/* Depot Location */}
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Depot location
                  </label>
                  <input
                    type="text"
                    value={depotLocation}
                    onChange={(e) => setDepotLocation(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                  />
                </div>

                {/* Operating Line */}
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Operating line
                  </label>
                  <input
                    type="text"
                    value={operatingLine}
                    onChange={(e) => setOperatingLine(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                  />
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-8 flex items-center justify-end pt-5 border-t border-[#1e1e1e]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#00c2ff] px-6 py-2.5 text-sm font-extrabold text-black shadow-sm transition-all hover:bg-[#2ed2ff] active:scale-[0.98]"
                >
                  <span>Next: Fault information</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Fault Information */}
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
                  STEP 2 OF 4
                </span>
                <span className="text-xs text-[#71717a]">* Required</span>
              </div>

              <h2 className="text-2xl font-bold text-white">Fault information</h2>
              <p className="mt-1 text-sm text-[#a1a1aa] mb-7">
                Provide observed symptoms and technical diagnostics codes.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Observed fault symptom / Description <span className="text-[#00c2ff]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={faultSummary}
                    onChange={(e) => setFaultSummary(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                      HMI diagnostic fault code <span className="text-[#00c2ff]">*</span>
                    </label>
                    <input
                      type="text"
                      value={faultCode}
                      onChange={(e) => setFaultCode(e.target.value)}
                      className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                      Fault severity rating
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                    >
                      <option value="Critical (Level 1)">Critical (Level 1)</option>
                      <option value="Major (Level 2)">Major (Level 2)</option>
                      <option value="Minor (Level 3)">Minor (Level 3)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                      Peak operating temperature
                    </label>
                    <input
                      type="text"
                      value={operatingTemp}
                      onChange={(e) => setOperatingTemp(e.target.value)}
                      className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-[#00c2ff]/70 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-8 flex items-center justify-between pt-5 border-t border-[#1e1e1e]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="rounded-lg border border-[#1e1e1e] bg-[#141414] px-5 py-2.5 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors"
                >
                  ← Back to Equipment
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#00c2ff] px-6 py-2.5 text-sm font-extrabold text-black shadow-sm transition-all hover:bg-[#2ed2ff] active:scale-[0.98]"
                >
                  <span>Next: Telemetry & Evidence</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Evidence (Audio & OCR Photos with File Upload) */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Audio Studio Card */}
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Icon name="mic" className="h-4 w-4 text-[#00c2ff]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      1. Multilingual Acoustic Telemetry (Voice Note)
                    </h3>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#71717a]">Dialect:</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="rounded border border-[#1e1e1e] bg-[#000000] px-3 py-1 text-white font-medium focus:outline-none"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label} ({l.native})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 rounded-lg bg-[#000000] border border-[#1e1e1e] p-6">
                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      onClick={() => setIsRecording(!isRecording)}
                      className={`flex h-14 w-14 items-center justify-center rounded-xl font-bold transition-all shadow-md ${
                        isRecording
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-[#00c2ff] text-black hover:bg-[#25ccff]'
                      }`}
                    >
                      {isRecording ? (
                        <div className="h-4 w-4 rounded bg-white" />
                      ) : (
                        <Icon name="mic" className="h-5 w-5 text-black" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="text-xs font-bold tracking-wider uppercase text-white">
                          {isRecording ? 'STREAMING AUDIO TELEMETRY' : 'READY FOR RECORDING'}
                        </span>
                      </div>
                      <p className="text-2xl font-extrabold text-white mt-0.5">
                        {formatSeconds(recordSeconds)}
                      </p>
                      <p className="text-xs text-[#71717a]">
                        48kHz Sampling · Railway Terminology Bias Active
                      </p>
                    </div>
                  </div>

                  {/* Waveform */}
                  <div className="flex items-center gap-1 h-12 bg-[#0a0a0a] rounded-lg px-4 border border-[#1e1e1e]">
                    {[12, 28, 45, 18, 62, 35, 80, 52, 95, 40, 75, 20, 60, 85, 30, 70, 48, 90, 25, 55, 38, 72].map(
                      (h, i) => (
                        <motion.div
                          key={i}
                          className={`w-1 rounded-full ${
                            isRecording ? 'bg-[#00c2ff]' : 'bg-[#262626]'
                          }`}
                          animate={
                            isRecording
                              ? {
                                  height: [6, (h * 0.4) + Math.random() * 8, 6],
                                }
                              : { height: 6 }
                          }
                          transition={{
                            repeat: Infinity,
                            duration: 0.45,
                            delay: i * 0.02,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Visual OCR Evidence Card with Real Image Upload Capability */}
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e1e] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Icon name="camera" className="h-4 w-4 text-[#00c2ff]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      2. Multi-Spectral Visual OCR Evidence ({evidencePhotos.length} Required Angles)
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-400 font-semibold">
                      {evidencePhotos.length}/{evidencePhotos.length} PHOTOS ACQUIRED
                    </span>

                    {/* Image Upload Button */}
                    <button
                      type="button"
                      onClick={() => generalFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#00c2ff] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#25ccff] transition-all shadow-sm"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Upload image file</span>
                    </button>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {evidencePhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="rounded-lg border border-[#1e1e1e] bg-[#000000] p-4 flex flex-col justify-between hover:border-[#00c2ff]/60 transition-all group"
                    >
                      {/* Hidden input for this specific photo slot */}
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
                        <span className="font-semibold text-white uppercase text-[11px] truncate max-w-[180px]">
                          {photo.caption}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {photo.isUserUploaded ? (
                            <span className="text-[#00c2ff] font-bold text-[10px] bg-[#061826] px-1.5 py-0.5 rounded border border-[#00c2ff]/40">
                              CUSTOM
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold text-[10px]">PASS</span>
                          )}
                        </div>
                      </div>

                      {/* Display Image Box */}
                      <div
                        onClick={() => setActivePhotoModal(idx)}
                        className="relative aspect-video rounded border border-[#262626] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-[#00c2ff]/60 transition-colors"
                      >
                        {photo.dataUrl ? (
                          <img
                            src={photo.dataUrl}
                            alt={photo.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center p-3">
                            <span className="text-[10px] uppercase text-[#71717a] font-bold">
                              OCR DETECTED [{photo.confidence}%]
                            </span>
                            <p className="text-sm font-bold text-[#00c2ff] mt-0.5">{photo.tag}</p>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              slotFileInputRefs.current[idx]?.click()
                            }}
                            className="rounded bg-[#00c2ff] text-black px-2.5 py-1 text-[11px] font-bold shadow hover:bg-[#25ccff]"
                          >
                            Replace Image
                          </button>
                          <span className="rounded bg-black/80 text-white px-2.5 py-1 text-[11px] font-semibold">
                            Inspect
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-3 pt-2 border-t border-[#1e1e1e] flex items-center justify-between text-[10px] text-[#71717a]">
                        <span className="truncate">
                          {photo.tag || `${photo.annotations.length} Annotations`}
                        </span>
                        <button
                          type="button"
                          onClick={() => slotFileInputRefs.current[idx]?.click()}
                          className="text-[#00c2ff] hover:underline font-semibold"
                        >
                          Upload File
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-5 py-2.5 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors"
                >
                  ← Back to Fault Info
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#00c2ff] px-6 py-2.5 text-sm font-extrabold text-black shadow-sm transition-all hover:bg-[#2ed2ff] active:scale-[0.98]"
                >
                  <span>Next: Review & analyze</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Review & Analyze */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3 mb-6">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#71717a]">
                  STEP 4 OF 4
                </span>
                <span className="text-xs text-emerald-400 font-bold">ALL CRITERIA SATISFIED</span>
              </div>

              <h2 className="text-2xl font-bold text-white">Review & analyze claim</h2>
              <p className="mt-1 text-sm text-[#a1a1aa] mb-7">
                Verify structured facts before launching the neural warranty evaluation pipeline.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="rounded-lg bg-[#000000] border border-[#1e1e1e] p-5 space-y-3 text-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#71717a]">
                    Equipment Summary
                  </p>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Equipment:</span>
                    <span className="font-semibold text-white">{equipmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Manufacturer:</span>
                    <span className="font-semibold text-white">{manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Asset ID:</span>
                    <span className="font-mono text-[#00c2ff] font-bold">{serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Trainset:</span>
                    <span className="font-semibold text-white">{trainsetCar}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-[#000000] border border-[#1e1e1e] p-5 space-y-3 text-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#71717a]">
                    Diagnostic & Telemetry
                  </p>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">HMI Fault Code:</span>
                    <span className="font-bold text-amber-400">{faultCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Severity:</span>
                    <span className="font-bold text-rose-400">{severity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Operating Temp:</span>
                    <span className="font-semibold text-white">{operatingTemp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Evidence Count:</span>
                    <span className="font-bold text-emerald-400">1 Audio + {evidencePhotos.length} Visual Artifacts</span>
                  </div>
                </div>
              </div>

              {/* Big CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#1e1e1e] bg-[#000000] p-6">
                <div>
                  <p className="text-sm font-bold text-white">Telemetric Payload Ready for Submission</p>
                  <p className="text-xs text-[#71717a] mt-0.5">
                    Payload: {(2.4 + evidencePhotos.length * 1.2).toFixed(1)} MB · JIS-E-4001 Compliant · SHA-256 Hashed
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onAnalyse}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#00c2ff] px-8 py-3.5 text-sm font-extrabold text-black shadow-md transition-all hover:bg-[#2ed2ff] active:scale-[0.98]"
                >
                  <span>EXECUTE NEURAL PIPELINE</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 flex justify-start">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-5 py-2.5 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors"
                >
                  ← Back to Evidence
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Photo Modal ─────────────────────────────────────────────── */}
      {activePhotoModal !== null && evidencePhotos[activePhotoModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
              <span className="text-xs font-bold uppercase text-[#00c2ff]">
                {evidencePhotos[activePhotoModal].caption} // OCR Inspection
              </span>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="rounded p-1.5 text-[#71717a] hover:text-white hover:bg-[#18283f]"
              >
                ✕
              </button>
            </div>

            {/* High Res Image */}
            <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden border border-[#262626] bg-black flex items-center justify-center">
              {evidencePhotos[activePhotoModal].dataUrl ? (
                <img
                  src={evidencePhotos[activePhotoModal].dataUrl}
                  alt={evidencePhotos[activePhotoModal].caption}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4">
                  <p className="font-mono text-sm font-bold text-[#00c2ff]">
                    {evidencePhotos[activePhotoModal].tag}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-[#000000] p-4 border border-[#1e1e1e] space-y-3 text-xs">
              <p className="text-[#71717a] font-bold">Annotations Extracted:</p>
              {evidencePhotos[activePhotoModal].annotations.map((a) => (
                <div key={a.id} className="flex justify-between items-center rounded bg-[#0a0a0a] p-3 border border-[#1e1e1e]">
                  <div>
                    <span className="text-[#71717a] text-[10px] font-bold">{a.label}:</span>
                    <span className="ml-2 font-bold text-white">{a.value}</span>
                  </div>
                  <span className="text-[#00c2ff] font-bold">{Math.round(a.confidence * 100)}% Match</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => slotFileInputRefs.current[activePhotoModal]?.click()}
                className="text-xs font-bold text-[#00c2ff] hover:underline"
              >
                Replace with local file
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="rounded-lg bg-[#00c2ff] px-5 py-2 text-xs font-bold text-black hover:bg-[#2ed2ff]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Bottom Pill Banner ──────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-4 rounded-full bg-[#0a0a0a]/95 backdrop-blur-md border border-[#1e1e1e] px-5 py-2 text-xs font-medium text-white shadow-2xl">
          <span>
            {wokenServers
              ? 'Backend servers active. Real-time telemetry synchronized.'
              : 'Frontend Preview Only. Please wake servers to enable backend functionality.'}
          </span>
          <button
            type="button"
            onClick={() => setWokenServers(!wokenServers)}
            className={`rounded-full px-3.5 py-1 font-semibold transition-all ${
              wokenServers
                ? 'bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/40'
                : 'bg-[#141414] text-[#00c2ff] border border-[#00c2ff]/40 hover:bg-[#1a1a1a]'
            }`}
          >
            {wokenServers ? 'Servers active ✓' : 'Wake up servers'}
          </button>
        </div>
      </div>
    </div>
  )
}
