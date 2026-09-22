import { useRef, useState } from 'react'
import { getScenario } from '../data/mock'
import { getOrInitDraft, patchDraft, type ClaimDraft } from '../lib/claimStore'
import { addPersistentPhoto } from '../lib/evidenceStore'
import { translateToJapanese, speakJapanese } from '../lib/translator'
import { canApprove, getSession } from '../lib/auth'
import { logAuditEvent } from '../lib/auditLog'
import type { ViewId } from '../types'

const inputCls =
  'w-full rounded-lg border border-[#262626] bg-black px-4 py-2.5 text-sm text-white font-medium focus:border-white focus:outline-none'
const EQUIPMENT_OPTIONS = ['Traction Motor', 'Door System', 'Brake System', 'HVAC Unit', 'Pantograph', 'Bogie', 'Coupler', 'Signaling Unit', 'Other']
const OEM_OPTIONS = ['Mitsubishi Electric', 'Hitachi Rail', 'Toshiba Infrastructure', 'Kawasaki Heavy Industries', 'Siemens Mobility', 'Alstom Transport', 'Other']

function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (dataUrl.startsWith('data:image/svg')) return resolve(dataUrl)
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      const maxW = 1000, maxH = 800
      if (width > maxW || height > maxH) {
        if (width > height) { height = Math.round((height * maxW) / width); width = maxW }
        else { width = Math.round((width * maxH) / height); height = maxH }
      }
      const c = document.createElement('canvas')
      c.width = width; c.height = height
      c.getContext('2d')?.drawImage(img, 0, 0, width, height)
      resolve(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export default function CreateClaim({ onSubmit }: { onSubmit: (v: ViewId) => void }) {
  const [draft, setDraft] = useState<ClaimDraft>(() => getOrInitDraft(getScenario('1')))
  const update = (p: Partial<ClaimDraft>) => {
    setDraft((d) => ({ ...d, ...p }))
    patchDraft(p)
  }

  // voice state
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(draft.voiceSeconds)
  const [audioUrl, setAudioUrl] = useState<string | null>(draft.voiceAudioDataUrl ?? null)
  const [jaAudioUrl, setJaAudioUrl] = useState<string | null>(draft.voiceJapaneseAudioDataUrl ?? null)
  const [translating, setTranslating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const mrRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recRef = useRef<any>(null)
  const transcriptRef = useRef('')
  const fileRef = useRef<HTMLInputElement>(null)

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      transcriptRef.current = ''
      const mr = new MediaRecorder(stream)
      mrRef.current = mr
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        // persist audio as dataURL (small clips only)
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          finishVoice(dataUrl)
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start(200)
      // live speech recognition in parallel
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SR) {
        const rec = new SR()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = navigator.language || 'en-IN'
        rec.onresult = (e: any) => {
          let text = ''
          for (const r of e.results) text += r[0]?.transcript ?? ''
          transcriptRef.current = text
          setDraft((d) => ({ ...d, voiceTranscript: text }))
        }
        rec.start()
        recRef.current = rec
      }
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      say('Microphone unavailable — type the note instead.')
    }
  }

  /** Fetch Japanese TTS audio via /api/tts proxy and return a data URL (or null). */
  const fetchJapaneseAudio = async (japaneseText: string): Promise<string | null> => {
    try {
      const encoded = encodeURIComponent(japaneseText.slice(0, 180))
      const res = await fetch(`/api/tts?ie=UTF-8&q=${encoded}&tl=ja&client=tw-ob`)
      if (!res.ok) return null
      const blob = await res.blob()
      return await new Promise<string | null>((resolve) => {
        const r = new FileReader()
        r.onload = () => resolve(r.result as string)
        r.onerror = () => resolve(null)
        r.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  const runTranslation = async (text: string) => {
    const transcript = text.trim()
    if (!transcript) { say('Type or record a note first.'); return }
    setTranslating(true)
    try {
      const res = await translateToJapanese(transcript, 'auto')
      let jaAudio: string | null = null
      try {
        jaAudio = await fetchJapaneseAudio(res.japaneseText)
        if (jaAudio) setJaAudioUrl(jaAudio)
      } catch { /* playback fallback still works via speakJapanese */ }
      update({ voiceTranscript: transcript, hasVoiceNote: true, voiceJapanese: res.japaneseText, voiceRomaji: res.romaji, ...(jaAudio ? { voiceJapaneseAudioDataUrl: jaAudio } : {}) })
      say(jaAudio ? 'Translated + Japanese voice ready.' : 'Translated to Japanese (audio via replay).')
    } catch {
      say('Translation failed — check connection.')
    } finally {
      setTranslating(false)
    }
  }

  const finishVoice = async (audioDataUrl: string) => {
    try { recRef.current?.stop() } catch { /* noop */ }
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
    const transcript = transcriptRef.current.trim()
    update({ hasVoiceNote: true, voiceSeconds: seconds, voiceTranscript: transcript, voiceAudioDataUrl: audioDataUrl })
    if (transcript) {
      await runTranslation(transcript)
    } else {
      say('Voice note attached (no speech detected — type it instead).')
    }
  }

  const stopVoice = () => mrRef.current?.stop()

  const handlePhotos = (files: File[]) => {
    files.slice(0, 3).forEach((file, i) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const compressed = await compressImage(e.target?.result as string)
        const slot = draft.photos.length + i + 1
        const photos = [...draft.photos, { slot, name: file.name, dataUrl: compressed, tag: draft.serialNumber, confidence: 96 }]
        update({ photos: photos.slice(0, 5) })
        addPersistentPhoto({
          id: `UP-${Date.now()}-${i}`, name: file.name, claimId: draft.id, dataUrl: compressed,
          fileSize: `${(file.size / 1048576).toFixed(1)} MB`,
          uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hash: `0x${Math.random().toString(16).slice(2, 8)}...vault`,
          ocrTag: draft.serialNumber, confidence: 96, isUserUploaded: true,
        })
        say(`Photo "${file.name}" attached.`)
      }
      reader.readAsDataURL(file)
    })
  }

  const submit = () => {
    if (!draft.equipmentType || !draft.faultSummary) { say('Equipment + fault summary required.'); return }
    patchDraft({ status: 'pending_approval' })
    logAuditEvent({
      actor: getSession()?.name ?? 'Depot crew',
      action: 'Claim submitted for approval',
      detail: `${draft.equipmentType} (${draft.faultCode}) · ${draft.photos.length} photo(s)${draft.hasVoiceNote ? ' · voice note with Japanese translation' : ''}`,
      kind: 'capture',
      claimId: draft.id,
    })
    // Depot crew files and goes back to tracking; engineers jump straight into approval.
    onSubmit(canApprove(getSession()) ? 'approval' : 'claims')
  }

  return (
    <div className="pb-16 text-white max-w-4xl">
      {toast && <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-[calc(100vw-2rem)] rounded-lg border border-[#2a2a2a] bg-[#111] px-4 py-3 text-xs font-semibold shadow-2xl">{toast}</div>}
      <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">NEW WARRANTY CLAIM</p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">New Warranty Claim</h1>
      <p className="mt-1 text-sm text-[#a1a1aa]">Capture the failure once — RailClaim AI prepares the rest for OEM review.</p>

      {/* Stepper like design: 1 Asset Information → 2 Technician Report */}
      <div className="mt-6 flex items-center gap-3 sm:gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-sky-400/60 bg-sky-400/10 text-xs sm:text-sm font-bold text-sky-300">1</span>
          <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">Asset Information</span>
        </div>
        <div className="h-px min-w-4 flex-1 bg-[#262626]" />
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[#333] bg-[#141414] text-xs sm:text-sm font-bold text-[#a1a1aa]">2</span>
          <span className="text-xs sm:text-sm font-semibold text-[#a1a1aa] whitespace-nowrap">Technician Report</span>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-[#71717a]">Draft <span className="text-white">{draft.id}</span> · auto-saved</p>

      {/* 1 · Asset Information — dropdowns as in reference */}
      <div className="mt-6 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider">1 · Asset Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#a1a1aa]"><span className="mr-1 text-rose-400">*</span>Equipment type</span>
            <select className={inputCls} value={EQUIPMENT_OPTIONS.includes(draft.equipmentType) ? draft.equipmentType : ''} onChange={(e) => update({ equipmentType: e.target.value })}>
              <option value="" disabled>Select equipment</option>
              {EQUIPMENT_OPTIONS.map((o) => <option key={o} value={o} className="bg-black">{o}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#a1a1aa]"><span className="mr-1 text-rose-400">*</span>OEM</span>
            <select className={inputCls} value={OEM_OPTIONS.some((o) => draft.manufacturer.includes(o.split(' ')[0])) ? draft.manufacturer : ''} onChange={(e) => update({ manufacturer: e.target.value })}>
              <option value="" disabled>Select OEM</option>
              {OEM_OPTIONS.map((o) => <option key={o} value={o} className="bg-black">{o}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#a1a1aa]"><span className="mr-1 text-rose-400">*</span>Train number</span>
            <input className={inputCls} placeholder="e.g. Metro-104" value={draft.trainset} onChange={(e) => update({ trainset: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#a1a1aa]">Model</span>
            <input className={inputCls} placeholder="e.g. MB-5300" value={draft.model} onChange={(e) => update({ model: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#a1a1aa]">Serial number</span>
            <input className={inputCls + ' font-mono'} placeholder="Nameplate serial" value={draft.serialNumber} onChange={(e) => update({ serialNumber: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#a1a1aa]">Failure date</span>
            <input className={inputCls} type="date" value={draft.faultDate} onChange={(e) => update({ faultDate: e.target.value })} />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-[#a1a1aa]">Error code</span>
            <input className={inputCls + ' font-mono'} placeholder="e.g. TMC-402" value={draft.faultCode} onChange={(e) => update({ faultCode: e.target.value })} />
          </label>
        </div>
      </div>

      {/* 2 · Technician Report — fault + voice + photos */}
      <div className="mt-6 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider">2 · Technician Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className={inputCls} placeholder="Depot" value={draft.depot} onChange={(e) => update({ depot: e.target.value })} />
          <input className={inputCls} placeholder="Classification" value={draft.classification} onChange={(e) => update({ classification: e.target.value })} />
          <input className={inputCls} placeholder="Component ID" value={draft.componentId} onChange={(e) => update({ componentId: e.target.value })} />
          <input className={inputCls} placeholder="Fault summary" value={draft.faultSummary} onChange={(e) => update({ faultSummary: e.target.value })} />
        </div>
        <textarea className={inputCls} rows={3} placeholder="Fault summary / symptom *" value={draft.faultSummary} onChange={(e) => update({ faultSummary: e.target.value })} />
      </div>

      {/* Voice note: OG voice + Japanese translated voice */}
      <div className="mt-6 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider">Voice note → Japanese</h2>
          {draft.hasVoiceNote
            ? <span className="text-xs font-mono text-emerald-400">ATTACHED</span>
            : <span className="text-xs font-mono text-[#71717a]">OPTIONAL</span>}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {!recording
            ? <button onClick={startVoice} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black font-bold" title="Record">●</button>
            : <button onClick={stopVoice} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white font-bold animate-pulse" title="Stop">■</button>}
          <div>
            <p className="font-mono text-xl font-bold">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</p>
            <p className="text-xs text-[#a1a1aa]">{recording ? 'Recording + transcribing…' : 'Speak in any language — we transcribe + translate.'}</p>
          </div>
        </div>

        {/* Original voice */}
        <div className="mt-4 rounded-lg border border-[#262626] bg-black p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa]">① Original voice (technician)</p>
          {audioUrl
            ? <audio controls src={audioUrl} className="mt-2 h-9 w-full" />
            : <p className="mt-2 text-xs text-[#71717a]">No recording yet — hit ● or type below.</p>}
          <textarea className={inputCls + ' mt-3'} rows={2} placeholder="Original message (auto-transcribed, editable)"
            value={draft.voiceTranscript ?? ''} onChange={(e) => update({ voiceTranscript: e.target.value, hasVoiceNote: true })} />
        </div>

        {/* Japanese translated voice */}
        <div className="mt-3 rounded-lg border border-white/15 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa]">② Japanese translation (for OEM)</p>
            <button
              onClick={() => runTranslation(draft.voiceTranscript ?? '')}
              disabled={translating || !(draft.voiceTranscript ?? '').trim()}
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {translating ? 'Translating…' : draft.voiceJapanese ? '↻ Re-translate' : 'Translate to Japanese'}
            </button>
          </div>
          {translating
            ? <p className="mt-2 text-xs text-neutral-400">Translating to Japanese + generating voice…</p>
            : draft.voiceJapanese
              ? <>
                <p className="mt-2 text-lg font-bold leading-relaxed">{draft.voiceJapanese}</p>
                {draft.voiceRomaji && <p className="mt-1 font-mono text-xs italic text-neutral-400">{draft.voiceRomaji}</p>}
                {jaAudioUrl
                  ? <audio controls src={jaAudioUrl} className="mt-2 h-9 w-full" />
                  : <button onClick={() => draft.voiceJapanese && speakJapanese(draft.voiceJapanese)} className="mt-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black">🔊 Replay Japanese</button>}
              </>
              : <p className="mt-2 text-xs text-[#71717a]">Japanese text + voice appear here after recording stops (or hit Translate).</p>}
        </div>
      </div>

      {/* Photos */}
      <div className="mt-6 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider">Photos ({draft.photos.length})</h2>
          <button onClick={() => fileRef.current?.click()} className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black">Upload photos</button>
        </div>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handlePhotos(Array.from(e.target.files))} />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {draft.photos.map((p) => <img key={p.slot + p.name} src={p.dataUrl} alt={p.name} className="aspect-video w-full rounded-lg border border-[#262626] object-cover" />)}
          {draft.photos.length === 0 && <p className="col-span-2 sm:col-span-3 text-xs text-[#71717a]">No photos yet — nameplate, fault screen, depot context.</p>}
        </div>
      </div>

      <button onClick={submit} className="mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-extrabold text-black hover:bg-neutral-200">
        Submit for approval →
      </button>
    </div>
  )
}
