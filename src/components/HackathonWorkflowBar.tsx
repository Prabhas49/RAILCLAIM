import type { ViewId } from '../types'

interface HackathonWorkflowBarProps {
  currentView: ViewId
  onNavigate: (v: ViewId) => void
}

const STAGES: { id: ViewId; label: string; step: string }[] = [
  { id: 'create', label: '1. Create claim', step: '01' },
  { id: 'approval', label: '2. Approval & dispatch', step: '02' },
  { id: 'audit', label: '3. Audit ledger', step: '03' },
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
    <div className="mb-8 rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase text-black tracking-wider">
            SIMPLIFIED FLOW
          </span>
          <span className="font-mono text-xs text-neutral-400 hidden sm:inline">
            Create → Approve → Dispatch
          </span>
        </div>

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
                      ? 'bg-white text-black font-bold'
                      : isPast
                      ? 'bg-[#18181b] text-white font-semibold hover:bg-[#27272a] border border-[#27272a]'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <span>{s.step}</span>
                  <span className="hidden lg:inline">{s.label.replace(/^\d+\.\s*/, '')}</span>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-2 font-mono text-xs self-end md:self-auto">
          {isWorkflowView && currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="rounded-full border border-[#27272a] bg-[#141414] px-3.5 py-1.5 text-white hover:bg-[#222222] transition-colors font-medium"
            >
              ← Prev Step
            </button>
          )}

          {isWorkflowView ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-black hover:bg-neutral-200 transition-colors font-bold shadow-sm"
            >
              <span>{currentIndex === STAGES.length - 1 ? 'Finish & Return to Console' : 'Next Step →'}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-black hover:bg-neutral-200 transition-colors font-bold shadow-sm"
            >
              <span>Start Demo →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
