import type {
  AnswerMap,
  PredictionMap,
  CategoryScores,
  SessionScores,
  QuestionCategory,
} from '@/types'
import { getArchetype } from '@/lib/i18n'

// ─── Category weights (must sum to 1.0) ──────────────────────────────────────
const CATEGORY_WEIGHTS: Record<QuestionCategory, number> = {
  marriage:    0.20,
  personality: 0.20,
  lifestyle:   0.15,
  love:        0.20,
  kids:        0.15,
  ambitions:   0.10,
}

// ─── Question-to-category map ─────────────────────────────────────────────────
// Derived from question IDs (e.g. "marriage_01" → "marriage")
function categoryFromId(questionId: string): QuestionCategory {
  const prefix = questionId.split('_')[0] as QuestionCategory
  return prefix
}

// ─── Core scoring ─────────────────────────────────────────────────────────────

/**
 * Computes a per-category compatibility score (0–100)
 * by comparing two answer maps on matching question IDs.
 */
export function computeCategoryScores(
  answersA: AnswerMap,
  answersB: AnswerMap,
): CategoryScores {
  const categoryTotals: Record<QuestionCategory, { matches: number; total: number }> = {
    marriage:    { matches: 0, total: 0 },
    personality: { matches: 0, total: 0 },
    lifestyle:   { matches: 0, total: 0 },
    love:        { matches: 0, total: 0 },
    kids:        { matches: 0, total: 0 },
    ambitions:   { matches: 0, total: 0 },
  }

  // Only score questions that both partners answered
  const sharedIds = Object.keys(answersA).filter((id) => answersB[id] !== undefined)

  for (const id of sharedIds) {
    const category = categoryFromId(id)
    categoryTotals[category].total++
    if (answersA[id] === answersB[id]) {
      categoryTotals[category].matches++
    }
  }

  const scores = {} as CategoryScores
  for (const cat of Object.keys(categoryTotals) as QuestionCategory[]) {
    const { matches, total } = categoryTotals[cat]
    scores[cat] = total === 0 ? 0 : Math.round((matches / total) * 100)
  }

  return scores
}

/**
 * Computes a weighted overall compatibility score (0–100)
 * from per-category scores.
 */
export function computeOverallScore(breakdown: CategoryScores): number {
  let weighted = 0
  for (const cat of Object.keys(CATEGORY_WEIGHTS) as QuestionCategory[]) {
    weighted += breakdown[cat] * CATEGORY_WEIGHTS[cat]
  }
  return Math.round(weighted)
}

/**
 * Computes the empathy score (0–100) for one partner:
 * how many of their predictions matched the other partner's actual answers.
 */
export function computeEmpathyScore(
  predictions: PredictionMap,   // This partner's predictions about the other
  actualAnswers: AnswerMap,     // The other partner's actual answers
): number {
  const sharedIds = Object.keys(predictions).filter(
    (id) => actualAnswers[id] !== undefined,
  )
  if (sharedIds.length === 0) return 0

  const correct = sharedIds.filter((id) => predictions[id] === actualAnswers[id]).length
  return Math.round((correct / sharedIds.length) * 100)
}

/**
 * Master scoring function — computes all scores for a completed session.
 * This is the single source of truth used by both the client and the
 * Netlify score function.
 */
export function computeSessionScores(
  answersA:     AnswerMap,
  answersB:     AnswerMap,
  predictionsA: PredictionMap,   // A's predictions about B
  predictionsB: PredictionMap,   // B's predictions about A
): SessionScores {
  const breakdown = computeCategoryScores(answersA, answersB)
  const overall   = computeOverallScore(breakdown)
  const empathyA  = computeEmpathyScore(predictionsA, answersB)
  const empathyB  = computeEmpathyScore(predictionsB, answersA)
  const archetype = getArchetype(overall)

  return {
    overall,
    empathyA,
    empathyB,
    breakdown,
    coupleNickname: archetype.label,
  }
}

// ─── Score display helpers ─────────────────────────────────────────────────────

export function scoreToColor(score: number): string {
  if (score >= 80) return '#2E7D52'   // green
  if (score >= 60) return '#C17B7B'   // brand rose
  if (score >= 40) return '#BA7517'   // amber
  return '#A32D2D'                    // red
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'ممتاز'
  if (score >= 75) return 'قوي جداً'
  if (score >= 60) return 'جيد'
  if (score >= 45) return 'متوسط'
  return 'يحتاج حواراً'
}
