import { Icon } from './ui/Icon'
import type { ViewId } from '../types'

interface HackathonWorkflowBarProps {
  currentView: ViewId
  onNavigate: (v: ViewId) => void
}

const STAGES: { id: ViewId; label: string; step: string }[] = [
  { id: 'capture', label: '1. Incident Capture', step: '01' },
  { id: 'pipeline', label: '2. Neural Pipeline', step: '02' },
  { id: 'review', label: '3. Verify & Sign-Off', step: '03' },
  { id: 'oem', label: '4. OEM Dispatch', step: '04' },
  { id: 'audit', label: '5. Audit Ledger', step: '05' },
]

export function HackathonWorkflowBar({ currentView, onNavigate }: HackathonWorkflowBarProps) {
  if (currentView === 'landing') return null

  const currentIndex = STAGES.findIndex((s) => s.id === currentView)
  const isWorkflowView = currentIndex !== -1

  const handleNext = () => {
    if (currentIndex < STAGES.length - 1) {
      onNavigate(STAGES[currentIndex + 1].id)
    } else {
      onNavigate('dashboard')
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(STAGES[currentIndex - 1].id)
    } else {
      onNavigate('dashboard')
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Hackathon Jury Badge & Context */}
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-black px-3 py-1 font-mono text-[10px] font-bold uppercase text-white tracking-wider">
            JURY DEMO FLOW
          </span>
          <span className="font-mono text-xs text-neutral-500 hidden sm:inline">
            Autonomous Depot → OEM Claim Lifecycle
          </span>
        </div>

        {/* Center: Stepper (if in a workflow view) */}
        {isWorkflowView && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {STAGES.map((s, idx) => {
              const isCurrent = s.id === currentView
              const isPast = idx < currentIndex
              return (
                <button
                  key={s.id}
                  onClick={() => onNavigate(s.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-black text-white font-bold'
                      : isPast
                      ? 'bg-neutral-100 text-black font-semibold hover:bg-neutral-200'
                      : 'text-neutral-400 hover:text-black'
                  }`}
                >
                  {isPast ? <Icon name="check" className="h-3 w-3" /> : <span>{s.step}</span>}
                  <span className="hidden lg:inline">{s.label.replace(/^\d+\.\s*/, '')}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 font-mono text-xs self-end md:self-auto">
          {isWorkflowView && currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-black hover:bg-neutral-50 transition-colors font-medium"
            >
              ← Prev Step
            </button>
          )}

          {isWorkflowView ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-white hover:bg-neutral-800 transition-colors font-bold shadow-subtle"
            >
              <span>{currentIndex === STAGES.length - 1 ? 'Finish & Return to Console' : 'Next Step →'}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('capture')}
              className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-white hover:bg-neutral-800 transition-colors font-bold shadow-subtle"
            >
              <span>Start 5-Step Demo →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
