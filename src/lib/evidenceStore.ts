export interface EvidencePhotoItem {
  id: string
  name: string
  claimId: string
  dataUrl: string
  fileSize: string
  uploadTime: string
  hash: string
  ocrTag?: string
  confidence?: number
  isUserUploaded: boolean
}

export interface EvidenceFileItem {
  id: string
  name: string
  claimId: string
  type: 'Audio' | 'Image' | 'Video' | 'Telemetry' | 'Log'
  format: string
  size: string
  hash: string
  date: string
  status: 'Preserved' | 'Soft Deleted'
  dataUrl?: string
}

export const STORAGE_PHOTOS_KEY = 'RAILCLAIM_PERSISTENT_PHOTOS_V3'
export const STORAGE_FILES_KEY = 'RAILCLAIM_PERSISTENT_FILES_V3'

export const DEFAULT_NAMEPLATE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230b1526"/><rect x="40" y="40" width="520" height="320" rx="12" fill="%23132238" stroke="%23223e66" stroke-width="3"/><rect x="70" y="80" width="460" height="120" rx="8" fill="%2309111e" stroke="%2300c2ff" stroke-width="2" stroke-dasharray="4"/><text x="90" y="115" fill="%235a7596" font-family="monospace" font-size="14" font-weight="bold">OCR DETECTED [91% CONFIDENCE]</text><text x="90" y="155" fill="%2300c2ff" font-family="monospace" font-size="28" font-weight="900">MB5085-2274-K</text><text x="90" y="180" fill="%23738ea8" font-family="monospace" font-size="14">MFG: 2023-03 · JIS-E-4001 COMPLIANT</text><text x="70" y="240" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold">MITSUBISHI ELECTRIC ROLLING STOCK DIVISION</text><text x="70" y="270" fill="%23738ea8" font-family="monospace" font-size="13">3-PHASE INDUCTION MOTOR · 220 kW · 18,420 RUNNING HOURS</text><circle cx="500" cy="300" r="28" fill="%23062618" stroke="%2310b981" stroke-width="2"/><path d="M490 300 l8 8 l16 -16" fill="none" stroke="%2310b981" stroke-width="3" stroke-linecap="round"/></svg>`

export const DEFAULT_HMI_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23060c18"/><rect x="40" y="40" width="520" height="320" rx="8" fill="%230f192b" stroke="%23dc2626" stroke-width="3"/><rect x="70" y="70" width="460" height="80" fill="%233b0d0d" rx="6"/><text x="90" y="115" fill="%23f87171" font-family="sans-serif" font-size="20" font-weight="bold">⚠ TCMS FAULT ALERT // BAY 4 MUTTOM</text><rect x="70" y="170" width="220" height="150" fill="%2309111e" rx="8" stroke="%23f59e0b" stroke-width="2"/><text x="90" y="210" fill="%235a7596" font-family="monospace" font-size="13">FAULT CODE [94%]</text><text x="90" y="260" fill="%23f59e0b" font-family="monospace" font-size="36" font-weight="bold">E-042</text><text x="90" y="295" fill="%23f87171" font-family="monospace" font-size="12">IGBT THERMAL OVERLOAD</text><rect x="310" y="170" width="220" height="150" fill="%2309111e" rx="8" stroke="%2318283f" stroke-width="1"/><text x="330" y="210" fill="%235a7596" font-family="monospace" font-size="13">PEAK TEMPERATURE</text><text x="330" y="260" fill="%23ffffff" font-family="monospace" font-size="36" font-weight="bold">145 °C</text><text x="330" y="295" fill="%2338bdf8" font-family="monospace" font-size="12">SPEED: 82.4 KM/H</text></svg>`

export const DEFAULT_BOGIE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230a1322"/><circle cx="160" cy="220" r="100" fill="%23132238" stroke="%232e4d77" stroke-width="6"/><circle cx="160" cy="220" r="40" fill="%23060c18" stroke="%2300c2ff" stroke-width="3"/><circle cx="440" cy="220" r="100" fill="%23132238" stroke="%232e4d77" stroke-width="6"/><circle cx="440" cy="220" r="40" fill="%23060c18" stroke="%2300c2ff" stroke-width="3"/><rect x="80" y="120" width="440" height="30" rx="4" fill="%231f375b" stroke="%233b6399" stroke-width="2"/><rect x="220" y="160" width="160" height="90" rx="8" fill="%230c182a" stroke="%2300c2ff" stroke-width="2" stroke-dasharray="6"/><text x="235" y="200" fill="%2300c2ff" font-family="monospace" font-size="13" font-weight="bold">TRACTION MOTOR BAY</text><text x="235" y="225" fill="%23738ea8" font-family="monospace" font-size="12">AXLE MOUNTING: OK</text><text x="50" y="360" fill="%235a7596" font-family="monospace" font-size="13">DEPOT INSPECTION ANGLE 3 // MUTTOM BAY #4</text></svg>`

export const INITIAL_VAULT_PHOTOS: EvidencePhotoItem[] = [
  {
    id: 'P-101',
    name: 'motor_nameplate_ocr_angle1.jpg',
    claimId: 'RC-2026-001',
    dataUrl: DEFAULT_NAMEPLATE_SVG,
    fileSize: '4.8 MB',
    uploadTime: '18 Feb 2026, 09:42',
    hash: 'e41d8820ac92...89bc',
    ocrTag: 'MB5085-2274-K',
    confidence: 91,
    isUserUploaded: false,
  },
  {
    id: 'P-102',
    name: 'hmi_diagnostic_fault_screen.jpg',
    claimId: 'RC-2026-001',
    dataUrl: DEFAULT_HMI_SVG,
    fileSize: '3.2 MB',
    uploadTime: '18 Feb 2026, 09:44',
    hash: 'a918e77033d1...42ff',
    ocrTag: 'FAULT E-042',
    confidence: 94,
    isUserUploaded: false,
  },
  {
    id: 'P-103',
    name: 'bogie_mounting_inspection.jpg',
    claimId: 'RC-2026-001',
    dataUrl: DEFAULT_BOGIE_SVG,
    fileSize: '5.1 MB',
    uploadTime: '18 Feb 2026, 09:48',
    hash: '66df1928eb44...8820',
    ocrTag: 'Bogie Context',
    confidence: 89,
    isUserUploaded: false,
  },
]

export const INITIAL_VAULT_FILES: EvidenceFileItem[] = [
  {
    id: 'EV-8841',
    name: 'traction_motor_vibration_bay4.wav',
    claimId: 'RC-2026-001',
    type: 'Audio',
    format: 'WAV (48kHz PCM)',
    size: '2.4 MB',
    hash: '9f82d1a4e237...3e1a',
    date: '18 Feb 2026',
    status: 'Preserved',
  },
  {
    id: 'EV-8842',
    name: 'motor_nameplate_ocr_angle1.jpg',
    claimId: 'RC-2026-001',
    type: 'Image',
    format: 'JPEG (4032x3024)',
    size: '4.8 MB',
    hash: 'e41d8820ac92...89bc',
    date: '18 Feb 2026',
    status: 'Preserved',
    dataUrl: DEFAULT_NAMEPLATE_SVG,
  },
  {
    id: 'EV-8843',
    name: 'brake_pressure_transducer.csv',
    claimId: 'RC-2026-002',
    type: 'Telemetry',
    format: 'CSV (100Hz)',
    size: '1.1 MB',
    hash: '77a1bc2949ff...552f',
    date: '18 Feb 2026',
    status: 'Preserved',
  },
  {
    id: 'EV-8844',
    name: 'door_lock_actuator_highspeed.mp4',
    claimId: 'RC-2026-003',
    type: 'Video',
    format: 'MP4 (1080p60)',
    size: '18.2 MB',
    hash: '3c0bf18392ae...92ad',
    date: '18 Feb 2026',
    status: 'Preserved',
  },
  {
    id: 'EV-8845',
    name: 'hvac_refrigerant_cycle.json',
    claimId: 'RC-2026-004',
    type: 'Log',
    format: 'JSON (CAN-bus dump)',
    size: '640 KB',
    hash: 'a918e77033d1...42ff',
    date: '18 Feb 2026',
    status: 'Preserved',
  },
  {
    id: 'EV-8846',
    name: 'pantograph_collector_strip_arcing.mp4',
    claimId: 'RC-2026-005',
    type: 'Video',
    format: 'MP4 (4K30)',
    size: '32.6 MB',
    hash: '66df1928eb44...8820',
    date: '18 Feb 2026',
    status: 'Preserved',
  },
]

export function getStoredPhotos(): EvidencePhotoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_PHOTOS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Ignore fallback
  }
  return INITIAL_VAULT_PHOTOS
}

export function getStoredFiles(): EvidenceFileItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_FILES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Ignore fallback
  }
  return INITIAL_VAULT_FILES
}

export function addPersistentPhoto(photo: EvidencePhotoItem) {
  try {
    const currentPhotos = getStoredPhotos()
    // Avoid duplicate IDs
    const updatedPhotos = [photo, ...currentPhotos.filter((p) => p.id !== photo.id)]
    localStorage.setItem(STORAGE_PHOTOS_KEY, JSON.stringify(updatedPhotos))

    // Also add to file list
    const currentFiles = getStoredFiles()
    const newFile: EvidenceFileItem = {
      id: `EV-${photo.id}`,
      name: photo.name,
      claimId: photo.claimId || 'RC-2026-001',
      type: 'Image',
      format: 'Image (Vault Stored)',
      size: photo.fileSize,
      hash: photo.hash,
      date: 'Today',
      status: 'Preserved',
      dataUrl: photo.dataUrl,
    }
    const updatedFiles = [newFile, ...currentFiles.filter((f) => f.name !== photo.name)]
    localStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(updatedFiles))

    // Broadcast update across window so any active screen immediately syncs
    window.dispatchEvent(new CustomEvent('railclaim-evidence-sync', { detail: { photo, file: newFile } }))
  } catch (e) {
    console.warn('Storage save failed:', e)
  }
}

export function deletePersistentPhoto(id: string) {
  try {
    const currentPhotos = getStoredPhotos().filter((p) => p.id !== id)
    localStorage.setItem(STORAGE_PHOTOS_KEY, JSON.stringify(currentPhotos))
    window.dispatchEvent(new CustomEvent('railclaim-evidence-sync'))
  } catch (e) {
    console.warn('Storage delete failed:', e)
  }
}
