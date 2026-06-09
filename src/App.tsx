import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { setLocale } from '@/lib/i18n'

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Home    = lazy(() => import('@/pages/Home'))
const Quiz    = lazy(() => import('@/pages/Quiz'))
const Waiting = lazy(() => import('@/pages/Waiting'))
const Results = lazy(() => import('@/pages/Results'))
const Reveal  = lazy(() => import('@/pages/Reveal'))
const Share   = lazy(() => import('@/pages/Share'))

// ─── Page loading fallback ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Set Arabic RTL as default on mount
  useEffect(() => {
    setLocale('ar')
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing — create or join */}
          <Route path="/" element={<Home />} />

          {/* Session routes */}
          <Route path="/session/:sessionId/quiz"    element={<Quiz />} />
          <Route path="/session/:sessionId/waiting" element={<Waiting />} />
          <Route path="/session/:sessionId/results" element={<Results />} />
          <Route path="/session/:sessionId/reveal"  element={<Reveal />} />
          <Route path="/session/:sessionId/share"   element={<Share />} />

          {/* Legacy / short join link: /join?session=xxx → home with session param */}
          <Route
            path="/join"
            element={<Navigate to="/" replace />}
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
