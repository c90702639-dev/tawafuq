import type { Question } from '@/types'
import { t } from '@/lib/i18n'
import { ProgressBar } from '@/components/ui'

// ─── QuizProgress ─────────────────────────────────────────────────────────────
interface QuizProgressProps {
  current:  number   // 1-based
  total:    number
  skipsUsed: number
  maxSkips:  number
}

export function QuizProgress({ current, total, skipsUsed, maxSkips }: QuizProgressProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between font-arabic text-sm text-brand-ink-muted">
        <span>
          {t('quiz.question')} {current} {t('quiz.of')} {total}
        </span>
        <span className="text-xs">
          {t('quiz.skip.remaining', { n: String(maxSkips - skipsUsed) })}
        </span>
      </div>
      <ProgressBar value={current} max={total} animated />
    </div>
  )
}

// ─── AnswerOption ─────────────────────────────────────────────────────────────
interface AnswerOptionProps {
  optionKey: 'A' | 'B' | 'C' | 'D'
  text:      string
  selected:  boolean
  onSelect:  () => void
  disabled?: boolean
}

const OPTION_LETTERS: Record<string, string> = { A: 'أ', B: 'ب', C: 'ج', D: 'د' }

export function AnswerOption({ optionKey, text, selected, onSelect, disabled }: AnswerOptionProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'w-full text-right rtl:text-right flex items-center gap-4 p-4 rounded-2xl border-2',
        'font-arabic text-base transition-all duration-200 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rose focus-visible:ring-offset-2',
        selected
          ? 'border-brand-rose bg-brand-rose-light text-brand-ink shadow-brand'
          : 'border-brand-sand bg-white text-brand-ink hover:border-brand-rose hover:bg-brand-cream',
        disabled ? 'pointer-events-none opacity-60' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
          'text-sm font-bold transition-colors duration-200',
          selected ? 'bg-brand-rose text-white' : 'bg-brand-cream-dark text-brand-ink-muted',
        ].join(' ')}
      >
        {OPTION_LETTERS[optionKey]}
      </span>
      <span className="flex-1 leading-relaxed">{text}</span>
    </button>
  )
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────
interface QuestionCardProps {
  question:         Question
  selectedAnswer:   'A' | 'B' | 'C' | 'D' | null
  onAnswer:         (key: 'A' | 'B' | 'C' | 'D') => void
  animationKey:     number  // triggers re-render animation on question change
}

export function QuestionCard({ question, selectedAnswer, onAnswer, animationKey }: QuestionCardProps) {
  return (
    <div
      key={animationKey}
      className="w-full space-y-5 animate-slide-up"
      dir="rtl"
    >
      {/* Question text */}
      <div className="rounded-3xl bg-brand-cream-dark p-6 shadow-card">
        <p className="font-arabic text-h2-ar font-medium text-brand-ink leading-relaxed text-right">
          {question.text}
        </p>
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        {question.options.map((option) => (
          <AnswerOption
            key={option.key}
            optionKey={option.key}
            text={option.text}
            selected={selectedAnswer === option.key}
            onSelect={() => onAnswer(option.key)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── PredictionCard ───────────────────────────────────────────────────────────
interface PredictionCardProps {
  question:           Question
  partnerNickname:    string
  selectedPrediction: 'A' | 'B' | 'C' | 'D' | null
  onPredict:          (key: 'A' | 'B' | 'C' | 'D') => void
}

export function PredictionCard({ question, partnerNickname, selectedPrediction, onPredict }: PredictionCardProps) {
  return (
    <div className="w-full space-y-5 animate-reveal" dir="rtl">
      {/* Header */}
      <div className="rounded-3xl bg-brand-ink p-6 shadow-card-lg text-center space-y-2">
        <p className="font-arabic text-sm text-brand-sand">
          {t('quiz.prediction.title')}
        </p>
        <p className="font-arabic text-xl font-medium text-white">
          ماذا أجاب {partnerNickname}؟
        </p>
        <p className="font-arabic text-sm text-brand-ink-faint leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* Prediction options */}
      <div className="space-y-3">
        {question.options.map((option) => (
          <AnswerOption
            key={option.key}
            optionKey={option.key}
            text={option.text}
            selected={selectedPrediction === option.key}
            onSelect={() => onPredict(option.key)}
          />
        ))}
      </div>
    </div>
  )
}
