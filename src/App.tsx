import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { VoiceTranslatorModal } from './components/VoiceTranslatorModal'
import Landing from './screens/Landing'
import Login from './screens/Login'
import { getSession, logout, type AuthUser } from './lib/auth'
import Dashboard from './screens/Dashboard'
import Claims from './screens/Claims'
import Capture from './screens/Capture'
import EvidenceStorage from './screens/EvidenceStorage'
import Pipeline from './screens/Pipeline'
import Review from './screens/Review'
import OemOutput from './screens/OemOutput'
import AuditTrail from './screens/AuditTrail'
import Analytics from './screens/Analytics'
import type { ViewId } from './types'

// The one true spine: create → process → review → dispatch → back to work.
const SPINE: ViewId[] = ['capture', 'pipeline', 'review', 'oem']
const KNOWN: ViewId[] = [...SPINE, 'dashboard', 'claims', 'evidence', 'analytics', 'audit', 'landing', 'login']

function viewFromHash(): ViewId {
  const raw = window.location.hash.replace(/^#\/?/, '')
  if (!raw) return 'landing'
  return (KNOWN as string[]).includes(raw) ? (raw as ViewId) : 'dashboard'
}

export default function App() {
  const [view, setView] = useState<ViewId>(viewFromHash)
  const [running, setRunning] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState<'1' | '2' | '3'>('1')
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(() => getSession())

  useEffect(() => {
    const sync = () => setView(viewFromHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const navigate = useCallback((next: ViewId, scenario?: '1' | '2' | '3') => {
    if (scenario) setSelectedScenarioId(scenario)
    setView(next)
    window.location.hash = `/${next}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /** Advance along the capture→dispatch spine; land on Dashboard afterwards. */
  const advance = useCallback(() => {
    const i = SPINE.indexOf(view)
    const nextView = i === -1 || i === SPINE.length - 1 ? 'dashboard' : SPINE[i + 1]
    navigate(nextView)
  }, [view, navigate])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
    setView('landing')
    window.location.hash = '/landing'
  }, [])

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
        <AnimatePresence mode="wait">
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Landing
              onEnter={navigate}
              onSelectScenario={(id) => {
                setSelectedScenarioId(id)
                navigate('capture')
              }}
              onOpenVoiceTranslator={() => setVoiceModalOpen(true)}
            />
          </motion.div>
        </AnimatePresence>

        <VoiceTranslatorModal
          isOpen={voiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
        />
      </div>
    )
  }

  // ── Frontend-only auth gate: everything except landing needs login ──
  if (!user) {
    return <Login onLogin={(u) => { setUser(u); navigate('dashboard') }} />
  }

  return (
    <div className="min-h-screen bg-black text-white flex select-none">
      <Sidebar
        current={view}
        onNavigate={navigate}
        running={running}
        onOpenVoiceTranslator={() => setVoiceModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-black">
        <Topbar
          currentView={view}
          running={running}
          onNavigate={navigate}
          onOpenVoiceTranslator={() => setVoiceModalOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        <main className="px-6 md:px-8 py-8 w-full max-w-[1400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {view === 'dashboard' && <Dashboard onNavigate={navigate} />}
              {view === 'claims' && (
                <Claims
                  onNavigate={navigate}
                  onSelectClaim={() => navigate('review')}
                />
              )}
              {view === 'capture' && (
                <Capture
                  onAnalyse={() => navigate('pipeline')}
                  onNavigate={navigate}
                  selectedScenarioId={selectedScenarioId}
                  onSelectScenario={setSelectedScenarioId}
                />
              )}
              {view === 'evidence' && <EvidenceStorage onNavigate={navigate} />}
              {view === 'pipeline' && (
                <Pipeline onRunningChange={setRunning} onContinue={() => navigate('review')} />
              )}
              {view === 'review' && <Review onContinue={advance} />}
              {view === 'oem' && <OemOutput onContinue={advance} />}
              {view === 'analytics' && <Analytics onNavigate={navigate} />}
              {view === 'audit' && <AuditTrail onBack={() => navigate('dashboard')} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <VoiceTranslatorModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </div>
  )
}
