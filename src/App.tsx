import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { VoiceTranslatorModal } from './components/VoiceTranslatorModal'
import Landing from './screens/Landing'
import Login from './screens/Login'
import { canApprove, getSession, logout, type AuthUser } from './lib/auth'
import Dashboard from './screens/Dashboard'
import Claims from './screens/Claims'
import CreateClaim from './screens/CreateClaim'
import Approval from './screens/Approval'
import EvidenceStorage from './screens/EvidenceStorage'
import AuditTrail from './screens/AuditTrail'
import Analytics from './screens/Analytics'
import type { ViewId } from './types'

function DeniedCard({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-md py-24 text-center text-white">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">
        Engineer only
      </p>
      <h1 className="mt-2 text-2xl font-extrabold">Not for depot accounts</h1>
      <p className="mt-2 text-sm text-[#a1a1aa]">
        Approval, dispatch, analytics and audit are restricted to engineers.
        Depot crew files claims and tracks evidence.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-neutral-200"
      >
        Back to dashboard
      </button>
    </div>
  )
}

// The one true spine: create → approve/dispatch → audit.
const SPINE: ViewId[] = ['create', 'approval', 'audit']
const KNOWN: ViewId[] = ['dashboard', 'claims', ...SPINE, 'evidence', 'analytics', 'landing', 'login']

function viewFromHash(): ViewId {
  const raw = window.location.hash.replace(/^#\/?/, '')
  if (!raw) return 'landing'
  return (KNOWN as string[]).includes(raw) ? (raw as ViewId) : 'dashboard'
}

export default function App() {
  const [view, setView] = useState<ViewId>(viewFromHash)
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(() => getSession())
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const sync = () => setView(viewFromHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  // Depot crew can file + track claims but never approve/dispatch.
  // Engineer-only views bounce them back to the dashboard.
  const ENGINEER_ONLY: ViewId[] = ['approval', 'analytics', 'audit']

  const navigate = useCallback((next: ViewId) => {
    setUser((u) => {
      if (ENGINEER_ONLY.includes(next) && !canApprove(u)) {
        setView('dashboard')
        window.location.hash = '/dashboard'
        window.scrollTo({ top: 0 })
        return u
      }
      setView(next)
      setMobileNavOpen(false)
      window.location.hash = `/${next}`
      window.scrollTo({ top: 0 })
      return u
    })
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
    setView('landing')
    setMobileNavOpen(false)
    window.location.hash = '/landing'
  }, [])

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
        <AnimatePresence mode="wait">
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          >
            <Landing
              onEnter={navigate}
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
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          current={view}
          onNavigate={navigate}
          onOpenVoiceTranslator={() => setVoiceModalOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile drawer sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="absolute left-0 top-0 bottom-0"
          >
            <Sidebar
              current={view}
              onNavigate={navigate}
              onOpenVoiceTranslator={() => {
                setMobileNavOpen(false)
                setVoiceModalOpen(true)
              }}
              user={user}
              onLogout={handleLogout}
            />
          </motion.div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col bg-black">
        {/* Mobile header with hamburger */}
        <div className="md:hidden sticky top-0 z-50 border-b border-[#1e1e1e] bg-black/90 backdrop-blur-md flex items-center gap-3 px-4 h-14">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="p-2 -ml-2 text-white cursor-pointer"
            aria-label="Open navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span className="font-extrabold tracking-tight text-sm">HASHI SETU</span>
          <button
            type="button"
            onClick={() => navigate('create')}
            className="ml-auto rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black cursor-pointer"
          >
            + Claim
          </button>
        </div>

        <Topbar
          currentView={view}
          onNavigate={navigate}
          onOpenVoiceTranslator={() => setVoiceModalOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        <main className="px-4 sm:px-6 md:px-8 py-6 md:py-8 w-full max-w-[1400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 16, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {view === 'dashboard' && <Dashboard onNavigate={navigate} />}
              {view === 'claims' && <Claims onNavigate={navigate} />}
              {view === 'create' && <CreateClaim onSubmit={navigate} />}
              {view === 'approval' && (canApprove(user) ? (
                <Approval onDone={() => navigate('dashboard')} />
              ) : (
                <DeniedCard onBack={() => navigate('dashboard')} />
              ))}
              {view === 'evidence' && <EvidenceStorage onNavigate={navigate} />}
              {view === 'analytics' && (canApprove(user) ? (
                <Analytics onNavigate={navigate} />
              ) : (
                <DeniedCard onBack={() => navigate('dashboard')} />
              ))}
              {view === 'audit' && (canApprove(user) ? (
                <AuditTrail onBack={() => navigate('dashboard')} />
              ) : (
                <DeniedCard onBack={() => navigate('dashboard')} />
              ))}
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
