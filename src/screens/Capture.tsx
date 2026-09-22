import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import type { ViewId } from '../types'
import { addPersistentPhoto } from '../lib/evidenceStore'
import { FAILURE_SCENARIOS, getScenario } from '../data/mock'
import { openPrintableVoucher } from '../components/OemPdfVoucher'

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
  presetAnnotations: { id: string; label: string; value: string; confidence: number }[]
  dataUrl?: string
  fileName?: string
  confidence?: number
  tag?: string
  isUserUploaded: boolean
  annotations: { id: string; label: string; value: string; confidence: number }[]
}

const STORAGE_CLAIM_PHOTOS = 'RAILCLAIM_CLAIM_PHOTOS_V4'

// Fallback high-fidelity SVG graphics for instant sample preview
const SVG_NAMEPLATE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="40" y="40" width="520" height="320" rx="12" fill="%230e0e0e" stroke="%23222222" stroke-width="2"/><rect x="70" y="80" width="460" height="120" rx="8" fill="%23000000" stroke="%23ffffff" stroke-width="1.5" stroke-dasharray="4"/><text x="90" y="115" fill="%23888888" font-family="monospace" font-size="13" font-weight="bold">OCR DETECTED [96% CONFIDENCE]</text><text x="90" y="155" fill="%23ffffff" font-family="monospace" font-size="28" font-weight="900">TM-IND-2026-001</text><text x="90" y="180" fill="%23aaaaaa" font-family="monospace" font-size="13">MFG: 2023-03 · JIS-E-4001 COMPLIANT</text><text x="70" y="240" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold">EXAMPLE OEM ROLLING STOCK DIVISION</text><text x="70" y="270" fill="%23888888" font-family="monospace" font-size="13">TRACTION MOTOR TM-450 · 220 kW · 18,420 RUNNING HOURS</text><circle cx="500" cy="300" r="26" fill="%2310b981" fill-opacity="0.1" stroke="%2310b981" stroke-width="2"/><path d="M492 300 l6 6 l14 -14" fill="none" stroke="%2310b981" stroke-width="3" stroke-linecap="round"/></svg>`
const SVG_HMI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="40" y="40" width="520" height="320" rx="8" fill="%230e0e0e" stroke="%23ef4444" stroke-width="2"/><rect x="70" y="70" width="460" height="70" fill="%23260a0a" rx="6"/><text x="90" y="112" fill="%23f87171" font-family="sans-serif" font-size="18" font-weight="bold">⚠ TCMS FAULT ALERT // TRAIN SET 04</text><rect x="70" y="160" width="220" height="160" fill="%23000000" rx="8" stroke="%23f59e0b" stroke-width="2"/><text x="90" y="200" fill="%23888888" font-family="monospace" font-size="13">FAULT CODE [96%]</text><text x="90" y="255" fill="%23f59e0b" font-family="monospace" font-size="38" font-weight="bold">T-204</text><text x="90" y="295" fill="%23f87171" font-family="monospace" font-size="12">MECHANICAL / VIBRATION</text><rect x="310" y="160" width="220" height="160" fill="%23000000" rx="8" stroke="%23222222" stroke-width="1"/><text x="330" y="200" fill="%23888888" font-family="monospace" font-size="13">COMPONENT ID</text><text x="330" y="255" fill="%23ffffff" font-family="monospace" font-size="34" font-weight="bold">TM-04-A</text><text x="330" y="295" fill="%23a1a1aa" font-family="monospace" font-size="12">SPEED: 82.4 KM/H</text></svg>`
const SVG_BOGIE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><circle cx="160" cy="220" r="100" fill="%230e0e0e" stroke="%23262626" stroke-width="6"/><circle cx="160" cy="220" r="40" fill="%23000000" stroke="%23ffffff" stroke-width="2"/><circle cx="440" cy="220" r="100" fill="%230e0e0e" stroke="%23262626" stroke-width="6"/><circle cx="440" cy="220" r="40" fill="%23000000" stroke="%23ffffff" stroke-width="2"/><rect x="80" y="120" width="440" height="24" rx="4" fill="%231a1a1a" stroke="%23333333" stroke-width="2"/><rect x="220" y="160" width="160" height="90" rx="8" fill="%23000000" stroke="%23ffffff" stroke-width="1.5" stroke-dasharray="6"/><text x="235" y="200" fill="%23ffffff" font-family="monospace" font-size="13" font-weight="bold">TRACTION MOTOR BAY</text><text x="235" y="225" fill="%23888888" font-family="monospace" font-size="12">SHIVAJI DEPOT BAY #4</text><text x="50" y="360" fill="%23888888" font-family="monospace" font-size="13">DEPOT INSPECTION ANGLE 3 // SHIVAJI DEPOT</text></svg>`

const PRESET_ANGLES = [
  {
    id: 'p1',
    caption: '1. Equipment Nameplate',
    slotNumber: 1,
    targetDescription: 'Serial plate / specifications plate',
    presetTag: 'TM-IND-2026-001',
    presetAnnotations: [
      { id: 'a1', label: 'Serial Number', value: 'TM-IND-2026-001', confidence: 0.98 },
      { id: 'a2', label: 'Model', value: 'TM-450', confidence: 0.96 },
      { id: 'a3', label: 'Manufacturer', value: 'Example OEM', confidence: 0.98 },
      { id: 'a4', label: 'Equipment Type', value: 'Traction Motor', confidence: 0.99 },
    ],
    sampleSvg: SVG_NAMEPLATE,
  },
  {
    id: 'p2',
    caption: '2. HMI Fault Screen',
    slotNumber: 2,
    targetDescription: 'TCMS / Cab diagnostic fault code',
    presetTag: 'T-204',
    presetAnnotations: [
      { id: 'b1', label: 'Fault Code', value: 'T-204', confidence: 0.98 },
      { id: 'b2', label: 'Category', value: 'Mechanical / vibration', confidence: 0.96 },
      { id: 'b3', label: 'Component ID', value: 'TM-04-A', confidence: 0.95 },
      { id: 'b4', label: 'Trainset', value: 'Train Set 04', confidence: 0.97 },
    ],
    sampleSvg: SVG_HMI,
  },
  {
    id: 'p3',
    caption: '3. Depot Bogie Context',
    slotNumber: 3,
    targetDescription: 'Depot physical mounting & installation angle',
    presetTag: 'SHIVAJI DEPOT',
    presetAnnotations: [
      { id: 'c1', label: 'Depot Location', value: 'Shivaji Depot', confidence: 0.96 },
      { id: 'c2', label: 'Fault Date', value: '2026-02-18', confidence: 0.99 },
      { id: 'c3', label: 'Mounting Point', value: 'Axle B-Frame Mounting', confidence: 0.92 },
      { id: 'c4', label: 'Reviewer', value: 'Pragna Rao', confidence: 0.95 },
    ],
    sampleSvg: SVG_BOGIE,
  },
]

const INITIAL_CLAIM_PHOTOS: EvidencePhotoSlot[] = PRESET_ANGLES.map((preset) => ({
  id: preset.id,
  caption: preset.caption,
  slotNumber: preset.slotNumber,
  targetDescription: preset.targetDescription,
  presetTag: preset.presetTag,
  presetAnnotations: preset.presetAnnotations,
  dataUrl: undefined,
  fileName: undefined,
  confidence: undefined,
  tag: undefined,
  isUserUploaded: false,
  annotations: [],
}))

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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [wokenServers, setWokenServers] = useState(false)
  const [uploadToast, setUploadToast] = useState<string | null>(null)
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false)
  const [completenessScore, setCompletenessScore] = useState(100)
  const [showMissingInfoModal, setShowMissingInfoModal] = useState(false)
  const [activeScenarioId, setActiveScenarioId] = useState<'1' | '2' | '3'>(selectedScenarioId)

  // Fields matching active scenario
  const initialScenario = getScenario(selectedScenarioId)
  const [claimId, setClaimId] = useState(initialScenario.claimId)
  const [equipmentType, setEquipmentType] = useState(initialScenario.equipment)
  const [manufacturer, setManufacturer] = useState(initialScenario.oemName)
  const [modelName, setModelName] = useState(initialScenario.model)
  const [serialNumber, setSerialNumber] = useState(initialScenario.serialNo)
  const [trainsetCar, setTrainsetCar] = useState('Train Set 04')
  const [componentId, setComponentId] = useState(initialScenario.model.split('-')[0] + '-04-A')
  const [faultCode, setFaultCode] = useState(initialScenario.faultCode)
  const [faultDate, setFaultDate] = useState('2026-09-21')
  const [depotLocation, setDepotLocation] = useState(initialScenario.depot)
  const [faultSummary, setFaultSummary] = useState(initialScenario.failureDescription)
  const [classification, setClassification] = useState(initialScenario.symptom)
  const [operatingTemp, setOperatingTemp] = useState('145 °C')

  // Photos state initialized with active scenario
  const [evidencePhotos, setEvidencePhotos] = useState<EvidencePhotoSlot[]>(() => {
    const sc = initialScenario
    return [
      {
        id: 'p1',
        caption: `1. Equipment Nameplate (${sc.model})`,
        slotNumber: 1,
        targetDescription: 'Serial plate / specifications plate',
        presetTag: sc.serialNo,
        presetAnnotations: [
          { id: 'a1', label: 'Serial Number', value: sc.serialNo, confidence: 0.98 },
          { id: 'a2', label: 'Model', value: sc.model, confidence: 0.96 },
          { id: 'a3', label: 'Manufacturer', value: sc.oemName, confidence: 0.98 },
          { id: 'a4', label: 'Equipment Type', value: sc.equipment, confidence: 0.99 },
        ],
        dataUrl: sc.nameplateSvg,
        fileName: `${sc.model}_NAMEPLATE_OCR.svg`,
        confidence: 0.98,
        tag: sc.serialNo,
        isUserUploaded: false,
        annotations: [
          { id: 'a1', label: 'Serial Number', value: sc.serialNo, confidence: 0.98 },
          { id: 'a2', label: 'Model', value: sc.model, confidence: 0.96 },
          { id: 'a3', label: 'Manufacturer', value: sc.oemName, confidence: 0.98 },
          { id: 'a4', label: 'Equipment Type', value: sc.equipment, confidence: 0.99 },
        ],
      },
      {
        id: 'p2',
        caption: `2. HMI Fault Screen (${sc.faultCode})`,
        slotNumber: 2,
        targetDescription: 'TCMS / Cab diagnostic fault code',
        presetTag: sc.faultCode,
        presetAnnotations: [
          { id: 'b1', label: 'Fault Code', value: sc.faultCode, confidence: 0.98 },
          { id: 'b2', label: 'JIS Standard', value: sc.jisCode, confidence: 0.96 },
          { id: 'b3', label: 'Component ID', value: sc.model.split('-')[0] + '-04-A', confidence: 0.95 },
          { id: 'b4', label: 'Trainset', value: 'Train Set 04', confidence: 0.97 },
        ],
        dataUrl: sc.hmiSvg,
        fileName: `${sc.faultCode}_TCMS_ALERT.svg`,
        confidence: 0.97,
        tag: sc.faultCode,
        isUserUploaded: false,
        annotations: [
          { id: 'b1', label: 'Fault Code', value: sc.faultCode, confidence: 0.98 },
          { id: 'b2', label: 'JIS Standard', value: sc.jisCode, confidence: 0.96 },
          { id: 'b3', label: 'Component ID', value: sc.model.split('-')[0] + '-04-A', confidence: 0.95 },
          { id: 'b4', label: 'Trainset', value: 'Train Set 04', confidence: 0.97 },
        ],
      },
      {
        id: 'p3',
        caption: `3. Depot Context (${sc.depot})`,
        slotNumber: 3,
        targetDescription: 'Depot physical mounting & installation angle',
        presetTag: sc.depot,
        presetAnnotations: [
          { id: 'c1', label: 'Depot Location', value: sc.depot, confidence: 0.96 },
          { id: 'c2', label: 'Fault Date', value: '2026-09-21', confidence: 0.99 },
          { id: 'c3', label: 'Reviewer', value: 'Pragna Rao', confidence: 0.95 },
        ],
        dataUrl: sc.contextSvg,
        fileName: `${sc.depot.replace(/\s+/g, '_')}_BOGIE.svg`,
        confidence: 0.95,
        tag: sc.depot,
        isUserUploaded: false,
        annotations: [
          { id: 'c1', label: 'Depot Location', value: sc.depot, confidence: 0.96 },
          { id: 'c2', label: 'Fault Date', value: '2026-09-21', confidence: 0.99 },
          { id: 'c3', label: 'Reviewer', value: 'Pragna Rao', confidence: 0.95 },
        ],
      },
    ]
  })

  const applyScenario = (id: '1' | '2' | '3') => {
    setActiveScenarioId(id)
    onSelectScenario?.(id)
    const sc = getScenario(id)
    setClaimId(sc.claimId)
    setEquipmentType(sc.equipment)
    setManufacturer(sc.oemName)
    setModelName(sc.model)
    setSerialNumber(sc.serialNo)
    setTrainsetCar('Train Set 04')
    setComponentId(sc.model.split('-')[0] + '-04-A')
    setFaultCode(sc.faultCode)
    setDepotLocation(sc.depot)
    setFaultSummary(sc.failureDescription)
    setClassification(sc.symptom)

    const updatedSlots: EvidencePhotoSlot[] = [
      {
        id: 'p1',
        caption: `1. Equipment Nameplate (${sc.model})`,
        slotNumber: 1,
        targetDescription: 'Serial plate / specifications plate',
        presetTag: sc.serialNo,
        presetAnnotations: [
          { id: 'a1', label: 'Serial Number', value: sc.serialNo, confidence: 0.98 },
          { id: 'a2', label: 'Model', value: sc.model, confidence: 0.96 },
          { id: 'a3', label: 'Manufacturer', value: sc.oemName, confidence: 0.98 },
          { id: 'a4', label: 'Equipment Type', value: sc.equipment, confidence: 0.99 },
        ],
        dataUrl: sc.nameplateSvg,
        fileName: `${sc.model}_NAMEPLATE_OCR.svg`,
        confidence: 0.98,
        tag: sc.serialNo,
        isUserUploaded: false,
        annotations: [
          { id: 'a1', label: 'Serial Number', value: sc.serialNo, confidence: 0.98 },
          { id: 'a2', label: 'Model', value: sc.model, confidence: 0.96 },
          { id: 'a3', label: 'Manufacturer', value: sc.oemName, confidence: 0.98 },
          { id: 'a4', label: 'Equipment Type', value: sc.equipment, confidence: 0.99 },
        ],
      },
      {
        id: 'p2',
        caption: `2. HMI Fault Screen (${sc.faultCode})`,
        slotNumber: 2,
        targetDescription: 'TCMS / Cab diagnostic fault code',
        presetTag: sc.faultCode,
        presetAnnotations: [
          { id: 'b1', label: 'Fault Code', value: sc.faultCode, confidence: 0.98 },
          { id: 'b2', label: 'JIS Standard', value: sc.jisCode, confidence: 0.96 },
          { id: 'b3', label: 'Component ID', value: sc.model.split('-')[0] + '-04-A', confidence: 0.95 },
          { id: 'b4', label: 'Trainset', value: 'Train Set 04', confidence: 0.97 },
        ],
        dataUrl: sc.hmiSvg,
        fileName: `${sc.faultCode}_TCMS_ALERT.svg`,
        confidence: 0.97,
        tag: sc.faultCode,
        isUserUploaded: false,
        annotations: [
          { id: 'b1', label: 'Fault Code', value: sc.faultCode, confidence: 0.98 },
          { id: 'b2', label: 'JIS Standard', value: sc.jisCode, confidence: 0.96 },
          { id: 'b3', label: 'Component ID', value: sc.model.split('-')[0] + '-04-A', confidence: 0.95 },
          { id: 'b4', label: 'Trainset', value: 'Train Set 04', confidence: 0.97 },
        ],
      },
      {
        id: 'p3',
        caption: `3. Depot Context (${sc.depot})`,
        slotNumber: 3,
        targetDescription: 'Depot physical mounting & installation angle',
        presetTag: sc.depot,
        presetAnnotations: [
          { id: 'c1', label: 'Depot Location', value: sc.depot, confidence: 0.96 },
          { id: 'c2', label: 'Fault Date', value: '2026-09-21', confidence: 0.99 },
          { id: 'c3', label: 'Reviewer', value: 'Pragna Rao', confidence: 0.95 },
        ],
        dataUrl: sc.contextSvg,
        fileName: `${sc.depot.replace(/\s+/g, '_')}_BOGIE.svg`,
        confidence: 0.95,
        tag: sc.depot,
        isUserUploaded: false,
        annotations: [
          { id: 'c1', label: 'Depot Location', value: sc.depot, confidence: 0.96 },
          { id: 'c2', label: 'Fault Date', value: '2026-09-21', confidence: 0.99 },
          { id: 'c3', label: 'Reviewer', value: 'Pragna Rao', confidence: 0.95 },
        ],
      },
    ]

    setEvidencePhotos(updatedSlots)
    setCompletenessScore(100)
    setUploadToast(`Loaded ${sc.title} (JIS E-4001 Telemetry)`)
    setTimeout(() => setUploadToast(null), 3500)
  }

  useEffect(() => {
    if (selectedScenarioId && selectedScenarioId !== activeScenarioId) {
      applyScenario(selectedScenarioId)
    }
  }, [selectedScenarioId])

  // Step 3 Real Audio Recording Session state
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Inspection modal
  const [activePhotoModal, setActivePhotoModal] = useState<number | null>(null)

  // File input refs
  const multiFileInputRef = useRef<HTMLInputElement>(null)
  const slotFileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Persist photos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLAIM_PHOTOS, JSON.stringify(evidencePhotos))
    } catch (e) {
      console.warn('LocalStorage save failed:', e)
    }
  }, [evidencePhotos])

  // Cleanup media recorder on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Real voice recording handler using browser MediaRecorder
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
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const type = mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop())
          audioStreamRef.current = null
        }
      }

      mediaRecorder.start(200)
      setIsRecording(true)
      setRecordSeconds(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    } catch (err: any) {
      console.warn('Microphone permission or hardware issue:', err)
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
  }

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setRecordSeconds(0)
    setAudioError(null)
  }

  // Quick fallback simulation for headless or mic-less environments
  const simulateSampleRecording = () => {
    setAudioError(null)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.frequency.value = 520
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4)
      osc.stop(audioCtx.currentTime + 0.4)
    } catch {}
    setAudioUrl('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=')
    setRecordSeconds(5)
    setUploadToast('Sample voice note loaded successfully.')
    setTimeout(() => setUploadToast(null), 3500)
  }

  // Handle uploading image to a specific slot index (0, 1, or 2)
  const handleSlotPhotoUpload = async (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string
      const compressed = await compressImage(rawDataUrl)
      const preset = PRESET_ANGLES[index] || PRESET_ANGLES[0]

      setEvidencePhotos((prev) => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          id: preset.id,
          caption: preset.caption,
          slotNumber: preset.slotNumber,
          targetDescription: preset.targetDescription,
          presetTag: preset.presetTag,
          presetAnnotations: preset.presetAnnotations,
          dataUrl: compressed,
          fileName: file.name,
          confidence: Math.floor(94 + Math.random() * 5),
          tag: preset.presetTag,
          isUserUploaded: true,
          annotations: preset.presetAnnotations,
        }
        return updated
      })

      // Preset data binding to form
      if (index === 0) {
        setSerialNumber('TM-IND-2026-001')
        setEquipmentType('Traction Motor')
        setManufacturer('Example OEM')
        setModelName('TM-450')
      } else if (index === 1) {
        setFaultCode('T-204')
        setComponentId('TM-04-A')
        setTrainsetCar('Train Set 04')
        setClassification('Mechanical / vibration')
      } else if (index === 2) {
        setDepotLocation('Shivaji Depot')
        setFaultDate('2026-02-18')
      }

      // Sync to Evidence Storage vault
      addPersistentPhoto({
        id: `UP-${Date.now()}-${index}`,
        name: file.name,
        claimId: 'RC-2026-001',
        dataUrl: compressed,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hash: `0x${Math.random().toString(16).substring(2, 8)}...vault`,
        ocrTag: preset.presetTag,
        confidence: 96,
        isUserUploaded: true,
      })

      setUploadToast(`Uploaded "${file.name}". Extracted preset data: ${preset.presetTag}`)
      setTimeout(() => setUploadToast(null), 4000)
    }
    reader.readAsDataURL(file)
  }

  // Handle uploading 3 images at once
  const handleMultiImageUpload = (files: File[]) => {
    const list = Array.from(files).slice(0, 3)
    list.forEach((file, idx) => {
      handleSlotPhotoUpload(idx, file)
    })
    setUploadToast(`Processing ${list.length} images. Extracting preset warranty data...`)
    setTimeout(() => setUploadToast(null), 4000)
  }

  // Instant 1-click sample presets
  const loadAllPresetSamples = () => {
    applyScenario(activeScenarioId)
  }

  const resetAllPhotos = () => {
    setEvidencePhotos(INITIAL_CLAIM_PHOTOS)
    setUploadToast('Image slots cleared. Ready for new uploads.')
    setTimeout(() => setUploadToast(null), 3000)
  }

  const handleDownloadPdf = () => {
    openPrintableVoucher(getScenario(activeScenarioId))
  }

  const handleSendForReview = () => {
    setUploadToast(`Claim ${claimId} submitted for review by Pragna Rao.`)
    setTimeout(() => {
      if (onNavigate) {
        onNavigate('review')
      } else {
        onAnalyse()
      }
    }, 800)
  }

  const handleTriggerAiAnalysis = () => {
    setIsAnalyzingAi(true)
    setUploadToast('Re-analyzing claim telemetry with GPT-5.4...')
    setTimeout(() => {
      setIsAnalyzingAi(false)
      setCompletenessScore(100)
      setUploadToast('AI Structured Assessment complete: 100% verified.')
      setTimeout(() => setUploadToast(null), 4000)
    }, 1200)
  }

  const uploadedCount = evidencePhotos.filter((p) => p.dataUrl).length

  const steps = [
    { num: 1, label: 'Equipment details' },
    { num: 2, label: 'Fault information' },
    { num: 3, label: 'Evidence' },
    { num: 4, label: 'Analyze claim' },
  ] as const

  return (
    <div className="relative min-h-[calc(100vh-64px)] pb-28 text-white select-none">
      {/* Hidden input for multi-file upload */}
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

      {/* Toast Notification */}
      {uploadToast && (
        <div className="fixed top-6 right-8 z-50 flex items-center gap-3 rounded-lg border border-[#00c2ff]/40 bg-[#061424] px-4 py-3 text-xs text-[#00c2ff] shadow-2xl backdrop-blur-md">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{uploadToast}</span>
        </div>
      )}

      {/* ── Stepper Navigation (Only shown on Steps 1, 2, 3) ──────────── */}
      {currentStep !== 4 && (
        <>
          <div className="mb-4">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('dashboard') : (window.location.hash = '/dashboard')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-white transition-colors hover:text-neutral-300"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
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
                Record voice audio and upload your 3 depot images to extract verified warranty presets.
              </p>
            </div>

            <div className="self-start md:self-auto">
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3.5 py-1.5 text-xs text-[#d1d5db]">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="font-medium">Auto-saving draft</span>
              </div>
            </div>
          </div>

          {/* ── 3 FAILURE PRESETS (MOCK DATA 1, 2, 3) ───────────────────── */}
          <div className="mt-6 rounded-xl border border-[#222] bg-[#0c0c0c] p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c1c1c]">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#00c2ff]">
                  Select Pre-Configured Railway Failure Scenario (1, 2, or 3)
                </span>
                <p className="text-xs text-[#a1a1aa] mt-0.5">
                  Uploading Image 1, 2, or 3 auto-populates compliant Japanese OEM telemetry and generates an official warranty claim.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openPrintableVoucher(getScenario(activeScenarioId))}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00c2ff] px-4 py-2 text-xs font-bold text-black hover:bg-[#3cd3ff] transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <span>⎙ Download OEM Warranty Claim PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {FAILURE_SCENARIOS.map((sc) => {
                const isSelected = activeScenarioId === sc.id
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => applyScenario(sc.id)}
                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00c2ff] bg-[#091b29] shadow-md shadow-[#00c2ff]/10 ring-1 ring-[#00c2ff]'
                        : 'border-[#222] bg-[#141414] hover:border-[#333]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-[#00c2ff] text-black' : 'bg-[#222] text-[#888]'
                      }`}>
                        Image / Type {sc.id}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        ₹{(sc.amountInr / 100000).toFixed(1)}L (¥{(sc.amountJpy / 10000).toFixed(0)}万)
                      </span>
                    </div>
                    <p className="font-bold text-white text-xs mt-1.5 leading-snug">{sc.equipment}</p>
                    <p className="text-[10px] text-[#888] mt-0.5">{sc.oemName} · {sc.faultCode}</p>
                  </button>
                )
              })}
            </div>
          </div>

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
                        ? 'bg-emerald-500 text-black'
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
        </>
      )}

      {/* ── Step Content Panels ─────────────────────────────────────── */}
      <div className={currentStep === 4 ? 'mt-0' : 'mt-6'}>
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
                These values are preset and automatically confirmed when you upload the equipment nameplate.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Equipment type <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Manufacturer <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Serial number <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-mono font-bold focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Train / set
                  </label>
                  <input
                    type="text"
                    value={trainsetCar}
                    onChange={(e) => setTrainsetCar(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Component ID
                  </label>
                  <input
                    type="text"
                    value={componentId}
                    onChange={(e) => setComponentId(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none"
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
                Fault telemetry will be cross-referenced with your HMI screen upload in the next step.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Fault summary / symptom <span className="text-white">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={faultSummary}
                    onChange={(e) => setFaultSummary(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Fault code <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={faultCode}
                    onChange={(e) => setFaultCode(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm font-mono font-bold text-amber-400 focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Fault date
                  </label>
                  <input
                    type="text"
                    value={faultDate}
                    onChange={(e) => setFaultDate(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Classification / Category
                  </label>
                  <input
                    type="text"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
                    Depot location
                  </label>
                  <input
                    type="text"
                    value={depotLocation}
                    onChange={(e) => setDepotLocation(e.target.value)}
                    className="w-full rounded-lg border border-[#262626] bg-[#000000] px-4 py-3 text-sm text-white font-medium focus:border-white focus:outline-none"
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

          {/* STEP 3: Evidence (Working Voice Recording Session & 3 Photo Uploads with Presets) */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* ── 1. Voice Recording Session (Real working mic recording) ── */}
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
                        Speak directly into your microphone to record technician notes or audio telemetry.
                      </p>
                    </div>
                  </div>

                  {/* Recording Status Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isRecording ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/50 border border-rose-800/60 px-3 py-1 text-xs font-mono font-bold text-rose-400 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        RECORDING AUDIO
                      </span>
                    ) : audioUrl ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/60 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        AUDIO CAPTURED ({formatSeconds(recordSeconds)})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141414] border border-[#262626] px-3 py-1 text-xs font-mono font-semibold text-[#a1a1aa]">
                        <span className="h-2 w-2 rounded-full bg-[#71717a]" />
                        READY TO RECORD
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-[#000000] border border-[#1e1e1e] p-5">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: Big Record/Stop Button & Timer */}
                    <div className="flex items-center gap-5">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black hover:bg-neutral-200 transition-transform active:scale-95 shadow-lg shrink-0 cursor-pointer"
                          title="Click to start recording voice"
                        >
                          <Icon name="mic" className="h-6 w-6" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-transform active:scale-95 shadow-lg shadow-rose-900/40 animate-pulse shrink-0 cursor-pointer"
                          title="Click to stop recording"
                        >
                          <div className="h-5 w-5 rounded bg-white" />
                        </button>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-mono font-extrabold text-white">
                            {formatSeconds(recordSeconds)}
                          </span>
                          {isRecording && (
                            <span className="text-xs font-mono text-rose-400 font-semibold">
                              (Recording... speak now)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#a1a1aa] mt-0.5">
                          {isRecording
                            ? 'Microphone stream active. Click the red button to finish.'
                            : audioUrl
                            ? 'Recorded audio ready. You can play it below or re-record.'
                            : 'Click the microphone button and speak to record your voice note.'}
                        </p>
                      </div>
                    </div>

                    {/* Right: Audio Player / Fallback options */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                      {audioUrl && (
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <audio
                            controls
                            src={audioUrl}
                            className="h-9 w-full sm:w-64 rounded bg-[#141414]"
                          />
                          <button
                            type="button"
                            onClick={clearRecording}
                            className="rounded-lg border border-[#262626] bg-[#0a0a0a] px-3 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white hover:border-neutral-500 transition-colors shrink-0 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      {!audioUrl && !isRecording && (
                        <button
                          type="button"
                          onClick={simulateSampleRecording}
                          className="rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3.5 py-2 text-xs text-[#a1a1aa] hover:text-white hover:border-[#333333] transition-colors cursor-pointer"
                        >
                          Use sample field audio
                        </button>
                      )}
                    </div>
                  </div>

                  {audioError && (
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-950/40 border border-amber-800/50 p-3 text-xs text-amber-300">
                      <span>⚠ {audioError} (You can use the "Use sample field audio" option to proceed)</span>
                      <button
                        type="button"
                        onClick={() => setAudioError(null)}
                        className="text-amber-400 hover:text-white ml-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── 2. Visual OCR Evidence (3 Upload Slots with Presets) ── */}
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
                        Upload your 3 inspection images. Preset warranty OCR parameters will automatically bind.
                      </p>
                    </div>
                  </div>

                  {/* Actions & Counter */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {uploadedCount}/3 IMAGES ACQUIRED
                    </span>

                    {/* Upload 3 at once button */}
                    <button
                      type="button"
                      onClick={() => multiFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-all shadow-sm cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Upload 3 images</span>
                    </button>

                    {/* 1-click Preset Loader */}
                    <button
                      type="button"
                      onClick={loadAllPresetSamples}
                      className="rounded-lg border border-[#262626] bg-[#141414] px-3.5 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white hover:border-neutral-500 transition-all cursor-pointer"
                    >
                      Load preset samples
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

                {/* 3 Upload Slots Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {evidencePhotos.map((photo, idx) => {
                    const preset = PRESET_ANGLES[idx] || PRESET_ANGLES[0]
                    const hasImage = Boolean(photo.dataUrl)

                    return (
                      <div
                        key={photo.id}
                        className="rounded-xl border border-[#1e1e1e] bg-[#000000] p-4 flex flex-col justify-between hover:border-[#333333] transition-all group"
                      >
                        {/* Hidden input for this specific slot */}
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

                        {/* Card Header */}
                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="font-bold text-white uppercase text-[11px] truncate">
                            {preset.caption}
                          </span>
                          {hasImage ? (
                            <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                              ✓ PASS
                            </span>
                          ) : (
                            <span className="text-[#71717a] font-mono text-[10px] border border-[#262626] px-1.5 py-0.5 rounded">
                              REQUIRED
                            </span>
                          )}
                        </div>

                        {/* Image / Drop Area */}
                        {hasImage ? (
                          <div
                            onClick={() => setActivePhotoModal(idx)}
                            className="relative aspect-video rounded-lg border border-[#262626] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-white transition-colors"
                          >
                            <img
                              src={photo.dataUrl}
                              alt={photo.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  slotFileInputRefs.current[idx]?.click()
                                }}
                                className="rounded bg-white text-black px-3 py-1 text-[11px] font-bold shadow hover:bg-neutral-200 cursor-pointer"
                              >
                                Replace
                              </button>
                              <span className="rounded bg-black/80 text-white px-3 py-1 text-[11px] font-semibold border border-[#262626]">
                                Inspect
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => slotFileInputRefs.current[idx]?.click()}
                            className="relative aspect-video rounded-lg border-2 border-dashed border-[#262626] hover:border-neutral-500 bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141414] border border-[#262626] text-white mb-2 group-hover:scale-110 transition-transform">
                              <Icon name="camera" className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-white">
                              Upload Image {idx + 1}
                            </p>
                            <p className="text-[10px] text-[#71717a] mt-0.5">
                              {preset.targetDescription}
                            </p>
                            <span className="mt-2 inline-block text-[10px] font-mono text-[#a1a1aa] bg-[#141414] border border-[#262626] px-2 py-0.5 rounded">
                              Preset: {preset.presetTag}
                            </span>
                          </div>
                        )}

                        {/* Annotations & Footer */}
                        <div className="mt-3 pt-3 border-t border-[#1e1e1e] flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[#a1a1aa] font-semibold truncate">
                            {hasImage ? (photo.tag || preset.presetTag) : `Target: ${preset.presetTag}`}
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

              {/* Step Navigation Actions */}
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
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#00c2ff] px-6 py-2.5 text-sm font-extrabold text-black shadow-md transition-all hover:bg-[#25ccff] active:scale-[0.98] cursor-pointer"
                >
                  <Icon name="sparkles" className="h-4 w-4" />
                  <span>Analyze claim</span>
                  <Icon name="arrowRight" className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: EXACT CLAIM ANALYSIS VIEW AS REQUESTED BY USER */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* ── Top Header Section ──────────────────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1 pb-2">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
                    MAINTENANCE OPERATIONS
                  </p>
                  <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {claimId}
                  </h1>
                  <p className="mt-1 text-sm text-[#a1a1aa]">
                    {equipmentType} · {serialNumber}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#141414] hover:border-neutral-500 transition-all shadow-sm cursor-pointer"
                  >
                    <Icon name="download" className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendForReview}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00c2ff] px-5 py-2.5 text-xs font-extrabold text-black hover:bg-[#25ccff] transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5 rotate-45 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    <span>Send for engineer review</span>
                  </button>
                </div>
              </div>

              {/* ── Card 1: WARRANTY CLAIM · AI DRAFT ───────────────── */}
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4 mb-4">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#71717a]">
                    WARRANTY CLAIM · AI DRAFT
                  </span>
                  <span className="rounded border border-[#00c2ff]/60 bg-[#00c2ff]/10 px-3 py-1 text-xs font-semibold text-[#00c2ff]">
                    Under Engineer Review
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {faultSummary}
                </h2>

                {/* Amber Warning Banner */}
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-amber-600/50 bg-amber-950/20 px-4 py-3 text-xs text-amber-300">
                  <div className="flex items-center gap-2.5 font-bold">
                    <svg className="h-4 w-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>AI-GENERATED DRAFT — HUMAN ENGINEER REVIEW REQUIRED</span>
                  </div>
                  <span className="font-mono text-[11px] text-amber-400 font-semibold tracking-wide">
                    GPT-5.4 — AI-GENERATED
                  </span>
                </div>

                {/* 8-Parameter Specification Grid */}
                <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 pt-2">
                  <div>
                    <p className="text-xs text-[#71717a]">Equipment</p>
                    <p className="text-sm font-bold text-white mt-1">{equipmentType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#71717a]">Manufacturer</p>
                    <p className="text-sm font-bold text-white mt-1">{manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#71717a]">Model</p>
                    <p className="text-sm font-bold text-white mt-1">{modelName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#71717a]">Serial number</p>
                    <p className="text-sm font-mono font-bold text-white mt-1">{serialNumber}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#71717a]">Train / set</p>
                    <p className="text-sm font-bold text-white mt-1">{trainsetCar}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#71717a]">Component ID</p>
                    <p className="text-sm font-mono font-bold text-white mt-1">{componentId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#71717a]">Fault code</p>
                    <p className="text-sm font-mono font-bold text-white mt-1">{faultCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#71717a]">Fault date</p>
                    <p className="text-sm font-bold text-white mt-1">{faultDate}</p>
                  </div>
                </div>
              </div>

              {/* ── Card 2: AI ANALYSIS ─────────────────────────────── */}
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4 mb-4">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#71717a]">
                    AI ANALYSIS
                  </span>
                  <button
                    type="button"
                    onClick={handleTriggerAiAnalysis}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#141414] px-3.5 py-1.5 text-xs font-semibold text-white hover:border-[#00c2ff]/60 hover:text-[#00c2ff] transition-colors shadow-sm cursor-pointer"
                  >
                    <Icon name="sparkles" className="h-3.5 w-3.5 text-[#00c2ff]" />
                    <span>{isAnalyzingAi ? 'Analyzing...' : 'Analyze claim'}</span>
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">
                  Structured assessment
                </h3>

                <p className="mt-4 text-sm text-[#d1d5db] leading-relaxed">
                  Field claim {claimId} concerns a {equipmentType} ({manufacturer} {modelName}, serial {serialNumber}) on {trainsetCar}, component {componentId}. Reported issue is abnormal vibration during acceleration with fault code {faultCode} and fault category {classification}. Fault date is {faultDate} at {depotLocation}. Description states vibration increases during acceleration and no visible smoke was observed. Visual inspection was completed and the unit was isolated for review. Current status is Under Engineer Review by Pragna Rao.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-12 border-t border-[#1e1e1e] pt-4">
                  <div>
                    <p className="text-xs text-[#71717a]">Classification</p>
                    <p className="text-sm font-bold text-white mt-0.5">{classification}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#71717a]">Evidence completeness</p>
                    <p className="text-sm font-bold text-[#00c2ff] mt-0.5">{completenessScore}%</p>
                  </div>
                </div>
              </div>

              {/* ── Card 3: EVIDENCE COMPLETENESS ───────────────────── */}
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4 mb-4">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#71717a]">
                    EVIDENCE COMPLETENESS
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMissingInfoModal(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#00c2ff] hover:underline cursor-pointer"
                  >
                    <span>View missing information</span>
                    <span aria-hidden="true">&gt;</span>
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mb-5">
                  Review before submission
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-lg bg-[#000000] border border-[#1e1e1e] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-white">Equipment identification</span>
                    </div>
                    <span className="text-xs text-[#71717a]">Complete</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#000000] border border-[#1e1e1e] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-white">Fault description</span>
                    </div>
                    <span className="text-xs text-[#71717a]">Complete</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#000000] border border-[#1e1e1e] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-white">Fault code</span>
                    </div>
                    <span className="text-xs text-[#71717a]">Complete</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#000000] border border-[#1e1e1e] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-white">Photographic evidence</span>
                    </div>
                    <span className="text-xs text-[#71717a]">Complete</span>
                  </div>
                </div>
              </div>

              {/* Bottom Back Button */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-5 py-2.5 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                >
                  ← Back to Evidence
                </button>

                <button
                  type="button"
                  onClick={handleSendForReview}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#00c2ff] px-6 py-2.5 text-sm font-extrabold text-black hover:bg-[#25ccff] transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>Send for engineer review</span>
                  <Icon name="arrowRight" className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Missing Information Modal ───────────────────────────────── */}
      {showMissingInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00c2ff]">
                Evidence Completeness Breakdown
              </span>
              <button
                type="button"
                onClick={() => setShowMissingInfoModal(false)}
                className="rounded p-1 text-[#71717a] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <p className="text-[#a1a1aa]">
                Primary mandatory depot criteria are 100% satisfied. The remaining 32% represents optional OEM field attachments:
              </p>
              <div className="rounded-lg bg-[#000000] border border-[#1e1e1e] p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#d1d5db]">Equipment Serial OCR Plate</span>
                  <span className="text-emerald-400 font-bold">100% Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#d1d5db]">HMI Fault Telemetry Code</span>
                  <span className="text-emerald-400 font-bold">100% Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#d1d5db]">Depot Installation Proof</span>
                  <span className="text-emerald-400 font-bold">100% Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Acoustic Spectrogram Trace</span>
                  <span className="text-[#71717a]">Optional (Pending ASR)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMissingInfoModal(false)}
                className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Modal ─────────────────────────────────────────────── */}
      {activePhotoModal !== null && evidencePhotos[activePhotoModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
              <span className="text-xs font-bold uppercase text-white">
                {evidencePhotos[activePhotoModal].caption} // OCR Inspection
              </span>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="rounded p-1.5 text-[#71717a] hover:text-white hover:bg-[#141414]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden border border-[#262626] bg-black flex items-center justify-center">
              {evidencePhotos[activePhotoModal].dataUrl ? (
                <img
                  src={evidencePhotos[activePhotoModal].dataUrl}
                  alt={evidencePhotos[activePhotoModal].caption}
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="font-mono text-sm font-bold text-white">No image uploaded</p>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-[#000000] p-4 border border-[#1e1e1e] space-y-3 text-xs">
              <p className="text-[#71717a] font-bold">Preset Parameters Extracted:</p>
              {evidencePhotos[activePhotoModal].annotations.map((a) => (
                <div key={a.id} className="flex justify-between items-center rounded bg-[#0a0a0a] p-3 border border-[#1e1e1e]">
                  <div>
                    <span className="text-[#71717a] text-[10px] font-bold">{a.label}:</span>
                    <span className="ml-2 font-bold text-white">{a.value}</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">{Math.round(a.confidence * 100)}% Match</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  slotFileInputRefs.current[activePhotoModal]?.click()
                  setActivePhotoModal(null)
                }}
                className="text-xs font-bold text-white hover:underline cursor-pointer"
              >
                Upload different file
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Status Pill Banner ─────────────────────────────────── */}
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
            className={`rounded-full px-3.5 py-1 font-semibold transition-all cursor-pointer ${
              wokenServers
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                : 'bg-[#141414] text-white border border-[#262626] hover:bg-[#1a1a1a]'
            }`}
          >
            {wokenServers ? 'Servers active ✓' : 'Wake up servers'}
          </button>
        </div>
      </div>
    </div>
  )
}
