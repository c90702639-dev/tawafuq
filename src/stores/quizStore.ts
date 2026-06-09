import { create } from 'zustand'
import type { Question, AnswerMap, PredictionMap, QuizPhase } from '@/types'
import questions from '@/data/questions.ar.json'
import { submitPartnerAnswers } from '@/lib/firebase'

const ALL_QUESTIONS = questions as Question[]
const MAX_SKIPS = 5
// Trigger a prediction round after every Nth regular question
const PREDICTION_INTERVAL = 5

interface QuizState {
  questions:        Question[]
  currentIndex:     number
  phase:            QuizPhase
  predictionTarget: Question | null   // Question being predicted in prediction phase
  answers:          AnswerMap
  predictions:      PredictionMap
  skipsUsed:        number
  isSubmitting:     boolean
  isComplete:       boolean
  error:            string | null

  // Actions
  loadQuestions:   () => void
  answerQuestion:  (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => void
  answerPrediction:(questionId: string, prediction: 'A' | 'B' | 'C' | 'D') => void
  skipQuestion:    () => void
  submit:          (sessionId: string, role: 'partnerA' | 'partnerB') => Promise<void>
  reset:           () => void
}

const initialState = {
  questions:        [],
  currentIndex:     0,
  phase:            'quiz'     as QuizPhase,
  predictionTarget: null,
  answers:          {},
  predictions:      {},
  skipsUsed:        0,
  isSubmitting:     false,
  isComplete:       false,
  error:            null,
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  ...initialState,

  loadQuestions: () => {
    // Questions are already in category order from the JSON file
    set({ questions: ALL_QUESTIONS, currentIndex: 0, phase: 'quiz' })
  },

  answerQuestion: (questionId, answer) => {
    const { currentIndex, questions, answers } = get()

    const newAnswers: AnswerMap = { ...answers, [questionId]: answer }

    // After answering, decide next phase
    const answeredCount = Object.keys(newAnswers).length
    const shouldTriggerPrediction =
      answeredCount % PREDICTION_INTERVAL === 0 &&
      currentIndex < questions.length - 1

    if (shouldTriggerPrediction) {
      // Pick a random already-answered question for the partner to predict
      const answeredIds = Object.keys(newAnswers)
      const targetId    = answeredIds[Math.floor(Math.random() * answeredIds.length)]
      const targetQ     = questions.find((q) => q.id === targetId) ?? null

      set({
        answers:          newAnswers,
        phase:            'prediction',
        predictionTarget: targetQ,
      })
    } else {
      set({
        answers:      newAnswers,
        currentIndex: currentIndex + 1,
        phase:        'quiz',
      })
    }
  },

  answerPrediction: (questionId, prediction) => {
    const { currentIndex, predictions } = get()
    set({
      predictions: { ...predictions, [questionId]: prediction },
      phase:       'quiz',
      predictionTarget: null,
      currentIndex: currentIndex + 1,
    })
  },

  skipQuestion: () => {
    const { skipsUsed, currentIndex } = get()
    if (skipsUsed >= MAX_SKIPS) return
    set({ skipsUsed: skipsUsed + 1, currentIndex: currentIndex + 1 })
  },

  submit: async (sessionId, role) => {
    const { answers, predictions } = get()
    set({ isSubmitting: true, error: null })
    try {
      await submitPartnerAnswers(sessionId, role, answers, predictions)
      set({ isSubmitting: false, isComplete: true })
    } catch (err) {
      set({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'SUBMIT_FAILED',
      })
    }
  },

  reset: () => set(initialState),
}))
