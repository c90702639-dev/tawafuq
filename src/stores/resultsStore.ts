import { create } from 'zustand'
import type { SessionScores, PartnerData, SessionDoc } from '@/types'
import { fetchSession, subscribeToSession } from '@/lib/firebase'
import type { Unsubscribe } from 'firebase/firestore'

interface ResultsState {
  scores:       SessionScores | null
  partnerA:     PartnerData | null
  partnerB:     PartnerData | null
  isLoading:    boolean
  error:        string | null
  _unsub:       Unsubscribe | null

  // Actions
  loadResults:      (sessionId: string) => Promise<void>
  subscribeResults: (sessionId: string) => void
  unsubscribe:      () => void
  reset:            () => void
}

const initialState = {
  scores:    null,
  partnerA:  null,
  partnerB:  null,
  isLoading: false,
  error:     null,
  _unsub:    null,
}

function applyDoc(doc: SessionDoc) {
  return {
    scores:   doc.scores   ?? null,
    partnerA: doc.partnerA ?? null,
    partnerB: (doc.partnerB as PartnerData) ?? null,
    isLoading: false,
  }
}

export const useResultsStore = create<ResultsState>()((set, get) => ({
  ...initialState,

  /**
   * One-time fetch — used on direct navigation to results page.
   */
  loadResults: async (sessionId: string) => {
    set({ isLoading: true, error: null })
    try {
      const doc = await fetchSession(sessionId)
      if (!doc) throw new Error('SESSION_NOT_FOUND')
      set(applyDoc(doc))
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'LOAD_FAILED',
      })
    }
  },

  /**
   * Real-time subscription — used on the Waiting page so results
   * unlock automatically when both partners finish.
   */
  subscribeResults: (sessionId: string) => {
    // Clean up any existing subscription first
    get()._unsub?.()

    const unsub = subscribeToSession(
      sessionId,
      (doc) => set(applyDoc(doc)),
      (err) => set({ error: err.message, isLoading: false }),
    )

    set({ _unsub: unsub })
  },

  unsubscribe: () => {
    get()._unsub?.()
    set({ _unsub: null })
  },

  reset: () => {
    get()._unsub?.()
    set(initialState)
  },
}))
