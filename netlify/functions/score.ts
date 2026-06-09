import type { Handler, HandlerEvent } from '@netlify/functions'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { AnswerMap, PredictionMap, SessionDoc } from '../../src/types/index'

// ─── We import scoring logic directly — shared with client ───────────────────
// NOTE: Because this runs in Node (not a browser bundle), we inline the
// scoring functions here to avoid Vite-only import paths (@/ aliases).

type QuestionCategory = 'marriage' | 'personality' | 'lifestyle' | 'love' | 'kids' | 'ambitions'

const CATEGORY_WEIGHTS: Record<QuestionCategory, number> = {
  marriage:    0.20,
  personality: 0.20,
  lifestyle:   0.15,
  love:        0.20,
  kids:        0.15,
  ambitions:   0.10,
}

const ARCHETYPES = [
  { label: 'توأمان',        minScore: 90 },
  { label: 'أحلام مشتركة', minScore: 75 },
  { label: 'رفقاء درب',    minScore: 60 },
  { label: 'توازن جميل',   minScore: 45 },
  { label: 'تكامل مثير',   minScore: 0  },
]

function categoryFromId(id: string): QuestionCategory {
  return id.split('_')[0] as QuestionCategory
}

function computeCategoryScores(answersA: AnswerMap, answersB: AnswerMap) {
  const totals: Record<QuestionCategory, { matches: number; total: number }> = {
    marriage:    { matches: 0, total: 0 },
    personality: { matches: 0, total: 0 },
    lifestyle:   { matches: 0, total: 0 },
    love:        { matches: 0, total: 0 },
    kids:        { matches: 0, total: 0 },
    ambitions:   { matches: 0, total: 0 },
  }
  const shared = Object.keys(answersA).filter((id) => answersB[id] !== undefined)
  for (const id of shared) {
    const cat = categoryFromId(id)
    totals[cat].total++
    if (answersA[id] === answersB[id]) totals[cat].matches++
  }
  const scores = {} as Record<QuestionCategory, number>
  for (const cat of Object.keys(totals) as QuestionCategory[]) {
    const { matches, total } = totals[cat]
    scores[cat] = total === 0 ? 0 : Math.round((matches / total) * 100)
  }
  return scores
}

function computeOverall(breakdown: Record<QuestionCategory, number>): number {
  let w = 0
  for (const cat of Object.keys(CATEGORY_WEIGHTS) as QuestionCategory[]) {
    w += breakdown[cat] * CATEGORY_WEIGHTS[cat]
  }
  return Math.round(w)
}

function computeEmpathy(predictions: PredictionMap, actual: AnswerMap): number {
  const shared = Object.keys(predictions).filter((id) => actual[id] !== undefined)
  if (shared.length === 0) return 0
  const correct = shared.filter((id) => predictions[id] === actual[id]).length
  return Math.round((correct / shared.length) * 100)
}

function getArchetype(score: number) {
  return ARCHETYPES.find((a) => score >= a.minScore) ?? ARCHETYPES[ARCHETYPES.length - 1]
}

// ─── Firebase Admin init (singleton) ─────────────────────────────────────────
function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId:    process.env.FIREBASE_PROJECT_ID!,
        clientEmail:  process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey:   process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let sessionId: string
  try {
    const body = JSON.parse(event.body ?? '{}')
    sessionId  = body.sessionId
    if (!sessionId) throw new Error('Missing sessionId')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  try {
    const db   = getAdminDb()
    const ref  = db.collection('sessions').doc(sessionId)
    const snap = await ref.get()

    if (!snap.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Session not found' }) }
    }

    const data = snap.data() as SessionDoc

    if (!data.partnerA?.done || !data.partnerB?.done) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Both partners must complete the quiz first' }),
      }
    }

    const answersA     = data.partnerA.answers     ?? {}
    const answersB     = (data.partnerB as { answers?: AnswerMap }).answers ?? {}
    const predictionsA = data.partnerA.predictions ?? {}
    const predictionsB = (data.partnerB as { predictions?: PredictionMap }).predictions ?? {}

    const breakdown    = computeCategoryScores(answersA, answersB)
    const overall      = computeOverall(breakdown)
    const empathyA     = computeEmpathy(predictionsA, answersB)
    const empathyB     = computeEmpathy(predictionsB, answersA)
    const archetype    = getArchetype(overall)

    const scores = {
      overall,
      empathyA,
      empathyB,
      breakdown,
      coupleNickname: archetype.label,
    }

    await ref.update({ scores, status: 'both_done' })

    return {
      statusCode: 200,
      headers:    { 'Content-Type': 'application/json' },
      body:       JSON.stringify({ success: true, scores }),
    }
  } catch (err) {
    console.error('[score function] error:', err)
    return {
      statusCode: 500,
      body:       JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
