import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Card, Spinner } from '@/components/ui'
import { ShareLinkBox } from '@/components/share'
import { useSessionStore } from '@/stores/sessionStore'
import { useResultsStore } from '@/stores/resultsStore'
import { computeSessionScores } from '@/lib/scoring'
import { writeScores } from '@/lib/firebase'
import { t } from '@/lib/i18n'

export default function Waiting() {
  const { sessionId }    = useParams<{ sessionId: string }>()
  const navigate         = useNavigate()
  const { nickname, partnerRole, shareLink } = useSessionStore()
  const { partnerA, partnerB, subscribeResults, unsubscribe } = useResultsStore()

  const scoringTriggered = useRef(false)

  // ─── Guard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId || !nickname) {
      navigate('/', { replace: true })
    }
  }, [sessionId, nickname, navigate])

  // ─── Subscribe to session updates ─────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return
    subscribeResults(sessionId)
    return () => unsubscribe()
  }, [sessionId, subscribeResults, unsubscribe])

  // ─── Auto-trigger scoring + redirect when both partners done ──────────────
  useEffect(() => {
    if (!partnerA?.done || !partnerB?.done || scoringTriggered.current) return
    if (!sessionId) return

    scoringTriggered.current = true

    const triggerScoring = async () => {
      try {
        // Try the Netlify function first (server-side scoring)
        const res = await fetch('/.netlify/functions/score', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ sessionId }),
        })

        if (!res.ok) throw new Error('FUNCTION_FAILED')
      } catch {
        // Fallback: compute client-side and write scores directly
        if (!partnerA?.answers || !partnerB?.answers) return
        const scores = computeSessionScores(
          partnerA.answers,
          partnerB.answers,
          partnerA.predictions ?? {},
          partnerB.predictions ?? {},
        )
        await writeScores(sessionId, scores)
      } finally {
        navigate(`/session/${sessionId}/results`, { replace: true })
      }
    }

    triggerScoring()
  }, [partnerA, partnerB, sessionId, navigate])

  const isPartnerA = partnerRole === 'partnerA'
  const otherDone  = isPartnerA ? partnerB?.done : partnerA?.done

  return (
    <AppShell>
      <div
        className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fade-in"
        dir="rtl"
      >
        {/* Animated waiting indicator */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-28 w-28 rounded-full bg-brand-rose-light animate-pulse-soft" />
          <div className="absolute h-20 w-20 rounded-full bg-brand-rose/20 animate-pulse-soft [animation-delay:300ms]" />
          <div className="h-14 w-14 rounded-full bg-brand-rose flex items-center justify-center shadow-brand">
            <span className="text-2xl">💑</span>
          </div>
        </div>

        {/* Status text */}
        <div className="text-center space-y-2">
          <h2 className="font-arabic text-h1-ar font-bold text-brand-ink">
            {t('waiting.title')}
          </h2>
          <p className="font-arabic text-body-ar text-brand-ink-muted max-w-xs">
            {t('waiting.subtitle')}
          </p>
        </div>

        {/* Partner status */}
        <Card className="w-full max-w-xs" padding="md">
          <div className="space-y-3" dir="rtl">
            {/* This partner */}
            <div className="flex items-center justify-between">
              <span className="font-arabic text-sm text-brand-ink font-medium">
                {nickname}
              </span>
              <span className="flex items-center gap-1.5 text-green-700 font-arabic text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                انتهى
              </span>
            </div>

            <div className="border-t border-brand-sand" />

            {/* Other partner */}
            <div className="flex items-center justify-between">
              <span className="font-arabic text-sm text-brand-ink-muted">
                شريكك
              </span>
              {otherDone ? (
                <span className="flex items-center gap-1.5 text-green-700 font-arabic text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  انتهى
                </span>
              ) : (
                <span className="flex items-center gap-2 text-brand-ink-muted font-arabic text-sm">
                  <Spinner size="sm" />
                  لم ينته بعد
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Share link (Partner A only) */}
        {isPartnerA && shareLink && (
          <div className="w-full max-w-xs space-y-3">
            <p className="font-arabic text-sm text-brand-ink-muted text-center">
              لم تشارك الرابط بعد؟
            </p>
            <ShareLinkBox link={shareLink} />
          </div>
        )}

        {/* Auto-redirect note */}
        <p className="font-arabic text-xs text-brand-ink-faint text-center max-w-[200px]">
          ستنتقل إلى النتائج تلقائياً فور انتهاء شريكك
        </p>
      </div>
    </AppShell>
  )
}
