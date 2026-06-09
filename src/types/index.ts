// ─── Question Bank ────────────────────────────────────────────────────────────

export type QuestionCategory =
  | 'marriage'
  | 'personality'
  | 'lifestyle'
  | 'love'
  | 'kids'
  | 'ambitions'

export interface AnswerOption {
  key: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface Question {
  id: string
  category: QuestionCategory
  text: string
  options: AnswerOption[]
}

// ─── Partner Data ─────────────────────────────────────────────────────────────

export type PartnerRole = 'partnerA' | 'partnerB'

export type AnswerMap = Record<string, 'A' | 'B' | 'C' | 'D'>
export type PredictionMap = Record<string, 'A' | 'B' | 'C' | 'D'>

export interface PartnerData {
  nickname: string
  answers: AnswerMap
  predictions: PredictionMap   // predictions about the other partner's answers
  done: boolean
}

// ─── Scores ───────────────────────────────────────────────────────────────────

export interface CategoryScores {
  marriage:    number
  personality: number
  lifestyle:   number
  love:        number
  kids:        number
  ambitions:   number
}

export interface SessionScores {
  overall:      number          // 0–100 weighted compatibility
  empathyA:     number          // 0–100: how well A predicted B's answers
  empathyB:     number          // 0–100: how well B predicted A's answers
  breakdown:    CategoryScores
  coupleNickname: string        // Arabic archetype label
}

// ─── Session ──────────────────────────────────────────────────────────────────

export type SessionStatus = 'waiting' | 'both_done' | 'revealed'

export interface Session {
  sessionId:  string
  createdAt:  Date
  status:     SessionStatus
  partnerA:   PartnerData
  partnerB?:  Partial<PartnerData>
  scores?:    SessionScores
}

// ─── Firestore document shape (raw, before deserialization) ───────────────────

export interface SessionDoc {
  createdAt:  { seconds: number; nanoseconds: number }
  status:     SessionStatus
  partnerA:   PartnerData
  partnerB?:  Partial<PartnerData>
  scores?:    SessionScores
}

// ─── Quiz state ───────────────────────────────────────────────────────────────

export type QuizPhase = 'quiz' | 'prediction'

export interface QuizProgress {
  currentIndex:    number        // 0-based index into questions array
  phase:           QuizPhase
  predictionTarget: string | null // questionId being predicted, or null
}

// ─── Couple archetypes ────────────────────────────────────────────────────────

export interface CoupleArchetype {
  label:        string    // Arabic label
  labelEn:      string    // English label
  minScore:     number
  description:  string    // Arabic description shown on results screen
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

export type Locale = 'ar' | 'en'

export interface I18nStrings {
  [key: string]: string
}

// ─── Share / Export ───────────────────────────────────────────────────────────

export interface ShareCardPayload {
  sessionId:      string
  nicknameA:      string
  nicknameB:      string
  overallScore:   number
  coupleNickname: string
}

export interface PdfPayload {
  sessionId:      string
}

// ─── Netlify Function responses ───────────────────────────────────────────────

export interface ScoreFunctionResponse {
  success: boolean
  scores:  SessionScores
}

export interface CardFunctionResponse {
  success: boolean
  url:     string   // temporary signed URL or base64 PNG
}
