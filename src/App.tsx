import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { Dashboard } from './screens/Dashboard'
import { Capture } from './screens/Capture'
import { Pipeline } from './screens/Pipeline'
import { Review } from './screens/Review'
import { OemOutput } from './screens/OemOutput'
import { AuditTrail } from './screens/AuditTrail'
import type { ViewId } from './types'

/** Ordered the way a claim actually flows, so "next" is always meaningful. */
const ORDER: ViewId[] = ['capture', 'pipeline', 'review', 'oem', 'audit']

function viewFromHash(): ViewId {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return (ORDER as string[]).concat('dashboard').includes(raw) ? (raw as ViewId) : 'dashboard'
}

export default function App() {
  const [view, setView] = useState<ViewId>(viewFromHash)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const sync = () => setView(viewFromHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const navigate = useCallback((next: ViewId) => {
    setView(next)
    window.location.hash = `/${next}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const next = useCallback(() => {
    const i = ORDER.indexOf(view)
    navigate(i === -1 ? 'capture' : ORDER[Math.min(i + 1, ORDER.length - 1)])
  }, [view, navigate])

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar current={view} onNavigate={navigate} running={running} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar view={view} running={running} />

        <main className="flex-1 px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === 'dashboard' && <Dashboard onNavigate={navigate} />}
              {view === 'capture' && <Capture onAnalyse={() => navigate('pipeline')} />}
              {view === 'pipeline' && (
                <Pipeline
                  onRunningChange={setRunning}
                  onContinue={() => navigate('review')}
                />
              )}
              {view === 'review' && <Review onContinue={next} />}
              {view === 'oem' && <OemOutput onContinue={next} />}
              {view === 'audit' && <AuditTrail onBack={() => navigate('dashboard')} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
