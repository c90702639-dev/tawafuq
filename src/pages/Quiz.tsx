import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Spinner, ErrorMessage } from '@/components/ui'
import { QuestionCard, PredictionCard, QuizProgress } from '@/components/quiz'
import { useQuizStore } from '@/stores/quizStore'
import { useSessionStore } from '@/stores/sessionStore'
import { t } from '@/lib/i18n'

const MAX_SKIPS = 5

export default function Quiz() {
  const { sessionId }  = useParams<{ sessionId: string }>()
  const [params]       = useSearchParams()
  const navigate       = useNavigate()
  const partnerParam   = params.get('partner') as 'A' | 'B' | null

  const {
    questions,
    currentIndex,
    phase,
    predictionTarget,
    skipsUsed,
    isSubmitting,
    isComplete,
    error,
    loadQuestions,
    answerQuestion,
    answerPrediction,
    skipQuestion,
    submit,
  } = useQuizStore()

  const { nickname, partnerRole } = useSessionStore()

  // Track the currently selected answer before confirming
  const [pendingAnswer, setPendingAnswer]         = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [pendingPrediction, setPendingPrediction] = useState<'A' | 'B' | 'C' | 'D' | null>(null)

  // ─── Guards ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId || !nickname) {
      navigate('/', { replace: true })
      return
    }
    if (questions.length === 0) {
      loadQuestions()
    }
  }, [sessionId, nickname, questions.length, loadQuestions, navigate])

  // ─── On complete → navigate to waiting ────────────────────────────────────
  useEffect(() => {
    if (isComplete && sessionId) {
      navigate(`/session/${sessionId}/waiting`, { replace: true })
    }
  }, [isComplete, sessionId, navigate])

  // ─── Reset quiz store on unmount (prevents stale state on revisit) ─────────
  useEffect(() => {
    return () => { /* intentionally not resetting — preserve answers on navigate */ }
  }, [])

  // ─── Derived ───────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex]
  const role            = partnerRole ?? (partnerParam === 'B' ? 'partnerB' : 'partnerA')
  const allAnswered     = currentIndex >= questions.length

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleConfirmAnswer = () => {
    if (!pendingAnswer || !currentQuestion) return
    answerQuestion(currentQuestion.id, pendingAnswer)
    setPendingAnswer(null)
  }

  const handleConfirmPrediction = () => {
    if (!pendingPrediction || !predictionTarget) return
    answerPrediction(predictionTarget.id, pendingPrediction)
    setPendingPrediction(null)
  }

  const handleSkip = () => {
    if (skipsUsed >= MAX_SKIPS) return
    skipQuestion()
    setPendingAnswer(null)
  }

  const handleSubmit = async () => {
    if (!sessionId) return
    await submit(sessionId, role)
  }

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </AppShell>
    )
  }

  // ─── All questions answered — show submit screen ───────────────────────────
  if (allAnswered) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fade-in" dir="rtl">
          <div className="text-center space-y-3">
            <div className="text-6xl">✓</div>
            <h2 className="font-arabic text-h1-ar font-bold text-brand-ink">
              {t('quiz.done.title')}
            </h2>
            <p className="font-arabic text-body-ar text-brand-ink-muted">
              {t('quiz.done.subtitle')}
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="w-full max-w-xs space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              تأكيد وإرسال إجاباتي
            </Button>
            <p className="font-arabic text-xs text-brand-ink-faint text-center">
              بعد الإرسال لن تتمكن من التعديل
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  // ─── Prediction phase ──────────────────────────────────────────────────────
  if (phase === 'prediction' && predictionTarget) {
    // Derive the other partner's nickname for the prediction prompt
    const partnerNick = nickname === 'أنت' ? 'شريكك' : 'شريكك'

    return (
      <AppShell>
        <div className="space-y-6 py-4" dir="rtl">
          {/* Progress */}
          <QuizProgress
            current={currentIndex + 1}
            total={questions.length}
            skipsUsed={skipsUsed}
            maxSkips={MAX_SKIPS}
          />

          {/* Prediction card */}
          <PredictionCard
            question={predictionTarget}
            partnerNickname={partnerNick}
            selectedPrediction={pendingPrediction}
            onPredict={setPendingPrediction}
          />

          {/* Confirm */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!pendingPrediction}
            onClick={handleConfirmPrediction}
          >
            تأكيد التوقع
          </Button>
        </div>
      </AppShell>
    )
  }

  // ─── Normal quiz phase ─────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="space-y-6 py-4" dir="rtl">
        {/* Progress */}
        <QuizProgress
          current={currentIndex + 1}
          total={questions.length}
          skipsUsed={skipsUsed}
          maxSkips={MAX_SKIPS}
        />

        {/* Question */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={pendingAnswer}
            onAnswer={setPendingAnswer}
            animationKey={currentIndex}
          />
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!pendingAnswer}
            onClick={handleConfirmAnswer}
          >
            {t('quiz.submit')}
          </Button>

          {skipsUsed < MAX_SKIPS && (
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={handleSkip}
            >
              {t('quiz.skip')}
            </Button>
          )}
        </div>

        {error && <ErrorMessage message={error} />}
      </div>
    </AppShell>
  )
}
