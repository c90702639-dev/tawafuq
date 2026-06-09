import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Card, Divider, Spinner, ErrorMessage } from '@/components/ui'
import { ScoreRing, CategoryBar } from '@/components/results'
import { useResultsStore } from '@/stores/resultsStore'
import { getArchetype, t } from '@/lib/i18n'

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate      = useNavigate()

  const { scores, partnerA, partnerB, isLoading, error, loadResults } = useResultsStore()
  
  // ─── Guard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) { navigate('/', { replace: true }); return }
    if (!scores)    loadResults(sessionId)
  }, [sessionId, scores, loadResults, navigate])

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading || !scores) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <ErrorMessage message={error} />
        </div>
      </AppShell>
    )
  }

  const archetype   = getArchetype(scores.overall)
  const nicknameA   = partnerA?.nickname ?? 'الشريك الأول'
  const nicknameB   = partnerB?.nickname ?? 'الشريك الثاني'

  return (
    <AppShell>
      <div className="space-y-8 py-4 animate-fade-in" dir="rtl">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-arabic text-h1-ar font-bold text-brand-ink">
            {t('results.title')}
          </h1>
          <p className="font-arabic text-sm text-brand-ink-muted">
            {nicknameA} &amp; {nicknameB}
          </p>
        </div>

        {/* Couple nickname card */}
        <div
          className="rounded-3xl bg-brand-ink text-center p-8 space-y-2 shadow-card-lg animate-scale-in"
          style={{ animationDelay: '100ms' }}
        >
          <p className="font-arabic text-sm text-brand-sand">
            {t('results.archetype.label')}
          </p>
          <p className="font-arabic text-4xl font-bold text-brand-rose leading-tight">
            {scores.coupleNickname}
          </p>
          <p className="font-arabic text-sm text-white/70 leading-relaxed max-w-xs mx-auto">
            {archetype.description}
          </p>
          <p className="font-arabic text-xs text-brand-ink-faint pt-1">
            {archetype.labelEn}
          </p>
        </div>

        {/* Score rings */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Card padding="lg">
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-2">
                <ScoreRing
                  score={scores.overall}
                  size={180}
                  label={t('results.compatibility')}
                  animationDelay={300}
                />
              </div>
              <Divider />
              <div>
                <p className="font-arabic text-sm font-medium text-brand-ink-muted text-center mb-5">
                  مدى معرفة كل منكما للآخر
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <ScoreRing
                    score={scores.empathyA}
                    size={120}
                    label={nicknameA}
                    sublabel="توقّع إجابات شريكه"
                    color="#5F5E5A"
                    animationDelay={500}
                  />
                  <ScoreRing
                    score={scores.empathyB}
                    size={120}
                    label={nicknameB}
                    sublabel="توقّع إجابات شريكه"
                    color="#5F5E5A"
                    animationDelay={650}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Category breakdown */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Card padding="lg">
            <h2 className="font-arabic text-h3-ar font-medium text-brand-ink mb-6">
              {t('results.breakdown')}
            </h2>
            <CategoryBar scores={scores.breakdown} animDelay={400} />
          </Card>
        </div>

        {/* CTA */}
        <div className="space-y-3 animate-slide-up pb-4" style={{ animationDelay: '400ms' }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/session/${sessionId}/reveal`)}
          >
            {t('results.reveal.cta')}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/session/${sessionId}/share`)}
          >
            {t('share.title')}
          </Button>
        </div>

      </div>
    </AppShell>
  )
}
