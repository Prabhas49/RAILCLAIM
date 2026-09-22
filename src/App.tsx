import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import Landing from './screens/Landing'
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

const ORDER: ViewId[] = ['claims', 'capture', 'evidence', 'pipeline', 'review', 'oem', 'analytics', 'audit']

function viewFromHash(): ViewId {
  const raw = window.location.hash.replace(/^#\/?/, '')
  if (!raw) return 'landing' // Default to landing or dashboard
  return (ORDER as string[]).concat('dashboard', 'landing').includes(raw) ? (raw as ViewId) : 'dashboard'
}

export default function App() {
  const [view, setView] = useState<ViewId>(viewFromHash)
  const [running, setRunning] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState<'1' | '2' | '3'>('1')

  useEffect(() => {
    const sync = () => setView(viewFromHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const navigate = useCallback((next: ViewId, scenario?: '1' | '2' | '3') => {
    if (scenario) {
      setSelectedScenarioId(scenario)
    }
    setView(next)
    window.location.hash = `/${next}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const next = useCallback(() => {
    const i = ORDER.indexOf(view)
    navigate(i === -1 ? 'capture' : ORDER[Math.min(i + 1, ORDER.length - 1)])
  }, [view, navigate])

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-[#00c2ff] selection:text-black">
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
            />
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex select-none">
      <Sidebar current={view} onNavigate={navigate} running={running} />

      <div className="flex min-w-0 flex-1 flex-col bg-black">
        <Topbar currentView={view} running={running} onNavigate={navigate} />

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
              {view === 'claims' && <Claims onNavigate={navigate} onSelectClaim={() => navigate('review')} />}
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
              {view === 'review' && <Review onContinue={next} />}
              {view === 'oem' && <OemOutput onContinue={next} />}
              {view === 'analytics' && <Analytics onNavigate={navigate} />}
              {view === 'audit' && <AuditTrail onBack={() => navigate('dashboard')} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
