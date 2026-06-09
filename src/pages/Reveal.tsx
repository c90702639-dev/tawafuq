import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Spinner, ErrorMessage, Badge } from '@/components/ui'
import { AnswerComparison } from '@/components/results'
import { useResultsStore } from '@/stores/resultsStore'
import { CATEGORY_LABELS, t } from '@/lib/i18n'
import type { QuestionCategory, Question } from '@/types'
import questions from '@/data/questions.ar.json'

const ALL_QUESTIONS = questions as Question[]

// Group question IDs by category in display order
const CATEGORY_ORDER: QuestionCategory[] = [
  'marriage', 'personality', 'lifestyle', 'love', 'kids', 'ambitions',
]

export default function Reveal() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate      = useNavigate()

  const { scores, partnerA, partnerB, isLoading, error, loadResults } = useResultsStore()

  const [revealedCount, setRevealedCount] = useState(0)
  const [activeCategory, setActiveCategory] = useState<QuestionCategory | null>(null)

  useEffect(() => {
    if (!sessionId) { navigate('/', { replace: true }); return }
    if (!scores)    loadResults(sessionId)
  }, [sessionId, scores, loadResults, navigate])

  // Animate reveals one by one
  useEffect(() => {
    if (!scores) return
    const total = ALL_QUESTIONS.length
    if (revealedCount >= total) return

    const timer = setTimeout(() => {
      setRevealedCount((c: number) => c + 1)
    }, revealedCount === 0 ? 400 : 200)

    return () => clearTimeout(timer)
  }, [revealedCount, scores])

  if (isLoading || !scores || !partnerA || !partnerB) {
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

  const nicknameA = partnerA.nickname
  const nicknameB = (partnerB as { nickname?: string }).nickname ?? 'الشريك الثاني'

  // Build category → questions map
  const byCategory = CATEGORY_ORDER.reduce<Record<QuestionCategory, Question[]>>(
    (acc, cat) => {
      acc[cat] = ALL_QUESTIONS.filter((q) => q.id.startsWith(cat))
      return acc
    },
    {} as Record<QuestionCategory, Question[]>,
  )

  // Flat ordered list for reveal sequencing
  const orderedQuestions = CATEGORY_ORDER.flatMap((cat) => byCategory[cat])

  return (
    <AppShell>
      <div className="space-y-8 py-4" dir="rtl">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-arabic text-h1-ar font-bold text-brand-ink">
            {t('reveal.title')}
          </h1>
          <p className="font-arabic text-sm text-brand-ink-muted">
            {nicknameA} &amp; {nicknameB}
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
          <button
            className={[
              'flex-shrink-0 px-3 py-1.5 rounded-full font-arabic text-sm border transition-colors',
              activeCategory === null
                ? 'bg-brand-ink text-white border-brand-ink'
                : 'bg-white text-brand-ink-muted border-brand-sand hover:border-brand-rose',
            ].join(' ')}
            onClick={() => setActiveCategory(null)}
          >
            الكل
          </button>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              className={[
                'flex-shrink-0 px-3 py-1.5 rounded-full font-arabic text-sm border transition-colors whitespace-nowrap',
                activeCategory === cat
                  ? 'bg-brand-rose text-white border-brand-rose'
                  : 'bg-white text-brand-ink-muted border-brand-sand hover:border-brand-rose',
              ].join(' ')}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              {CATEGORY_LABELS[cat]?.ar}
            </button>
          ))}
        </div>

        {/* Questions grouped by category */}
        {CATEGORY_ORDER.filter((cat) => activeCategory === null || cat === activeCategory).map((cat) => {
          const catQuestions = byCategory[cat]
          const catLabel     = CATEGORY_LABELS[cat]?.ar ?? cat
          const catScore     = scores.breakdown[cat]

          return (
            <div key={cat} className="space-y-4">
              {/* Category header */}
              <div className="flex items-center justify-between">
                <h2 className="font-arabic text-h3-ar font-medium text-brand-ink">
                  {catLabel}
                </h2>
                <Badge variant={catScore >= 60 ? 'rose' : 'sand'}>
                  {catScore}٪
                </Badge>
              </div>

              {/* Questions in this category */}
              <div className="space-y-4">
                {catQuestions.map((q, i) => {
                  const globalIndex = orderedQuestions.findIndex((oq) => oq.id === q.id)
                  const isRevealed  = globalIndex < revealedCount

                  return (
                    <div
                      key={q.id}
                      className={[
                        'transition-all duration-500',
                        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                      ].join(' ')}
                      style={{ transitionDelay: `${i * 60}ms` }}
                    >
                      <AnswerComparison
                        question={q}
                        answerA={partnerA.answers?.[q.id]}
                        answerB={(partnerB as { answers?: Record<string, string> }).answers?.[q.id]}
                        nicknameA={nicknameA}
                        nicknameB={nicknameB}
                        predictionA={partnerA.predictions?.[q.id]}
                        predictionB={(partnerB as { predictions?: Record<string, string> }).predictions?.[q.id]}
                        revealed={isRevealed}
                        animationDelay={i * 60}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Bottom CTA */}
        <div className="space-y-3 pb-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/session/${sessionId}/share`)}
          >
            {t('share.title')}
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => navigate(`/session/${sessionId}/results`)}
          >
            العودة إلى النتائج
          </Button>
        </div>

      </div>
    </AppShell>
  )
}
