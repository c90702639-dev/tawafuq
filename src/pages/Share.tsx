import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Spinner, ErrorMessage, Divider } from '@/components/ui'
import { ExportButtons } from '@/components/share'
import { useResultsStore } from '@/stores/resultsStore'
import { getArchetype, t } from '@/lib/i18n'
import { scoreToColor } from '@/lib/scoring'

export default function Share() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate      = useNavigate()

  const { scores, partnerA, partnerB, isLoading, error, loadResults } = useResultsStore()

  useEffect(() => {
    if (!sessionId) { navigate('/', { replace: true }); return }
    if (!scores)    loadResults(sessionId)
  }, [sessionId, scores, loadResults, navigate])

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

  const nicknameA  = partnerA?.nickname ?? 'الشريك الأول'
  const nicknameB  = (partnerB as { nickname?: string })?.nickname ?? 'الشريك الثاني'
  const archetype  = getArchetype(scores.overall)
  const ringColor  = scoreToColor(scores.overall)

  return (
    <AppShell>
      <div className="space-y-8 py-4 animate-fade-in" dir="rtl">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-arabic text-h1-ar font-bold text-brand-ink">
            {t('share.title')}
          </h1>
          <p className="font-arabic text-sm text-brand-ink-muted">
            شاركا لحظتكما مع من تحبان
          </p>
        </div>

        {/* Preview card — mirrors the generated share card */}
        <div
          className="rounded-3xl overflow-hidden shadow-card-lg"
          aria-label="معاينة بطاقة المشاركة"
        >
          {/* Card top — brand dark background */}
          <div className="bg-brand-ink px-8 pt-10 pb-6 space-y-6 text-center">

            {/* App name */}
            <p className="font-arabic text-brand-rose text-sm tracking-widest">
              توافق
            </p>

            {/* Score ring (CSS-only preview) */}
            <div className="flex justify-center">
              <div
                className="relative h-28 w-28 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(${ringColor} ${scores.overall * 3.6}deg, #3a3a38 0deg)`,
                }}
              >
                <div className="h-[88px] w-[88px] rounded-full bg-brand-ink flex items-center justify-center">
                  <span className="font-arabic text-2xl font-bold text-white">
                    {scores.overall}٪
                  </span>
                </div>
              </div>
            </div>

            {/* Couple names */}
            <div className="space-y-1">
              <p className="font-arabic text-white text-lg font-medium">
                {nicknameA} &amp; {nicknameB}
              </p>
              <p className="font-arabic text-brand-ink-faint text-sm">
                توافق — اكتشفا مدى توافقكما
              </p>
            </div>
          </div>

          {/* Card bottom — cream background */}
          <div className="bg-brand-cream px-8 py-6 text-center space-y-3">
            <p className="font-arabic text-xs text-brand-ink-muted">لقبكما معاً</p>
            <p className="font-arabic text-3xl font-bold text-brand-rose">
              {scores.coupleNickname}
            </p>
            <p className="font-arabic text-sm text-brand-ink-muted leading-relaxed max-w-[220px] mx-auto">
              {archetype.description}
            </p>

            <Divider className="my-3" />

            {/* Mini category bars */}
            <div className="space-y-1.5 text-right">
              {(Object.entries(scores.breakdown) as [string, number][]).map(([cat, val]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-brand-sand overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-rose"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                  <span className="font-arabic text-xs text-brand-ink-muted w-6 text-left tabular-nums">
                    {val}٪
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export buttons */}
        {sessionId && (
          <ExportButtons
            sessionId={sessionId}
            scores={scores}
            nicknameA={nicknameA}
            nicknameB={nicknameB}
          />
        )}

        {/* Navigate back */}
        <div className="pb-4 text-center">
          <button
            onClick={() => navigate(`/session/${sessionId}/results`)}
            className="font-arabic text-sm text-brand-ink-muted hover:text-brand-ink transition-colors underline underline-offset-2"
          >
            العودة إلى النتائج
          </button>
        </div>

      </div>
    </AppShell>
  )
}
