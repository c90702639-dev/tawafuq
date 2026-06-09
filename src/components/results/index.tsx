import { useEffect, useRef, useState } from 'react'
import type { CategoryScores } from '@/types'
import type { Question } from '@/types'
import { CATEGORY_LABELS, t } from '@/lib/i18n'
import { scoreToColor } from '@/lib/scoring'
import { Badge } from '@/components/ui'

// ─── ScoreRing ────────────────────────────────────────────────────────────────
interface ScoreRingProps {
  score:     number      // 0–100
  size?:     number      // SVG diameter in px
  label?:    string
  sublabel?: string
  color?:    string
  animationDelay?: number
}

export function ScoreRing({
  score,
  size = 160,
  label,
  sublabel,
  color,
  animationDelay = 0,
}: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(0)
  const strokeColor = color ?? scoreToColor(score)
  const radius      = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset  = circumference - (displayed / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      const start    = Date.now()
      const duration = 1000
      const tick = () => {
        const elapsed  = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased    = 1 - Math.pow(1 - progress, 3) // ease-out cubic
        setDisplayed(Math.round(eased * score))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, animationDelay)
    return () => clearTimeout(timer)
  }, [score, animationDelay])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F0E8DF"
            strokeWidth={10}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-arabic font-bold text-brand-ink"
            style={{ fontSize: size * 0.22 }}
          >
            {displayed}٪
          </span>
        </div>
      </div>
      {label && (
        <p className="font-arabic text-sm font-medium text-brand-ink text-center">{label}</p>
      )}
      {sublabel && (
        <p className="font-arabic text-xs text-brand-ink-muted text-center">{sublabel}</p>
      )}
    </div>
  )
}

// ─── CategoryBar ──────────────────────────────────────────────────────────────
interface CategoryBarProps {
  scores:    CategoryScores
  animDelay?: number
}

export function CategoryBar({ scores, animDelay = 0 }: CategoryBarProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 },
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="space-y-4" dir="rtl">
      {(Object.keys(scores) as (keyof CategoryScores)[]).map((cat, i) => {
        const pct   = visible ? scores[cat] : 0
        const color = scoreToColor(scores[cat])
        const label = CATEGORY_LABELS[cat]?.ar ?? cat

        return (
          <div key={cat} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm font-arabic">
              <span className="text-brand-ink font-medium">{label}</span>
              <span className="text-brand-ink-muted tabular-nums">{scores[cat]}٪</span>
            </div>
            <div className="h-2 w-full rounded-full bg-brand-cream-dark overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width:            `${pct}%`,
                  backgroundColor:  color,
                  transition:       `width 800ms cubic-bezier(0.16,1,0.3,1) ${animDelay + i * 80}ms`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── AnswerComparison ─────────────────────────────────────────────────────────
interface AnswerComparisonProps {
  question:        Question
  answerA:         string | undefined
  answerB:         string | undefined
  nicknameA:       string
  nicknameB:       string
  predictionA?:    string   // A's prediction about B's answer
  predictionB?:    string   // B's prediction about A's answer
  revealed:        boolean
  animationDelay?: number
}

export function AnswerComparison({
  question,
  answerA,
  answerB,
  nicknameA,
  nicknameB,
  predictionA,
  predictionB,
  revealed,
  animationDelay = 0,
}: AnswerComparisonProps) {
  const matched = answerA !== undefined && answerA === answerB
  const optionText = (key: string) =>
    question.options.find((o) => o.key === key)?.text ?? key

  return (
    <div
      className="rounded-3xl border-2 overflow-hidden bg-white shadow-card"
      style={{
        borderColor:    matched ? '#C17B7B' : '#E8DDD3',
        animationDelay: `${animationDelay}ms`,
      }}
      dir="rtl"
    >
      {/* Question */}
      <div className="px-5 pt-5 pb-3">
        <p className="font-arabic text-sm font-medium text-brand-ink leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* Answers */}
      {revealed && (
        <div className="grid grid-cols-2 gap-px bg-brand-sand">
          {/* Partner A */}
          <div className="bg-white p-4 space-y-1">
            <p className="font-arabic text-xs text-brand-ink-muted">{nicknameA}</p>
            <p className={['font-arabic text-sm font-medium', matched ? 'text-brand-rose' : 'text-brand-ink'].join(' ')}>
              {answerA ? optionText(answerA) : '—'}
            </p>
            {predictionB !== undefined && (
              <Badge variant={predictionB === answerA ? 'green' : 'sand'} className="mt-1 text-xs">
                {predictionB === answerA
                  ? `${nicknameB} توقّع هذا ✓`
                  : `${nicknameB} توقّع غيره`}
              </Badge>
            )}
          </div>

          {/* Partner B */}
          <div className="bg-white p-4 space-y-1">
            <p className="font-arabic text-xs text-brand-ink-muted">{nicknameB}</p>
            <p className={['font-arabic text-sm font-medium', matched ? 'text-brand-rose' : 'text-brand-ink'].join(' ')}>
              {answerB ? optionText(answerB) : '—'}
            </p>
            {predictionA !== undefined && (
              <Badge variant={predictionA === answerB ? 'green' : 'sand'} className="mt-1 text-xs">
                {predictionA === answerB
                  ? `${nicknameA} توقّع هذا ✓`
                  : `${nicknameA} توقّع غيره`}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Match indicator */}
      <div className={['px-5 py-2.5 flex items-center justify-between', matched ? 'bg-brand-rose-light' : 'bg-brand-cream'].join(' ')}>
        <Badge variant={matched ? 'rose' : 'sand'}>
          {matched ? t('reveal.matched') : t('reveal.different')}
        </Badge>
      </div>
    </div>
  )
}
