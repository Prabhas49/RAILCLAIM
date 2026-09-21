import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import Dashboard from './screens/Dashboard'
import Capture from './screens/Capture'
import Pipeline from './screens/Pipeline'
import Review from './screens/Review'
import OemOutput from './screens/OemOutput'
import AuditTrail from './screens/AuditTrail'
import type { ViewId } from './types'
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
    setView(next); window.location.hash = `/${next}`; window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  const next = useCallback(() => {
    const i = ORDER.indexOf(view)
    navigate(i === -1 ? 'capture' : ORDER[Math.min(i + 1, ORDER.length - 1)])
  }, [view, navigate])
  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      {/* warm radial glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_800px_600px_at_20%_-10%,rgba(249,115,22,0.08),transparent),radial-gradient(ellipse_600px_400px_at_90%_0%,rgba(99,102,241,0.06),transparent)]" />
      <Sidebar current={view} onNavigate={navigate} running={running} />
      <div className="flex min-w-0 flex-col lg:pl-[280px]">
        <Topbar running={running} />
        <main className="px-4 py-6 sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              {view === 'dashboard' && <Dashboard onNavigate={navigate} />}
              {view === 'capture' && <Capture onAnalyse={() => navigate('pipeline')} />}
              {view === 'pipeline' && <Pipeline onRunningChange={setRunning} onContinue={() => navigate('review')} />}
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
