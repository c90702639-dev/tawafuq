import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { PartnerRole, SessionStatus } from '@/types'
import { createSession, joinSession, fetchSession } from '@/lib/firebase'

interface SessionState {
  sessionId:   string | null
  partnerRole: PartnerRole | null
  nickname:    string
  status:      SessionStatus | null
  shareLink:   string | null

  // Actions
  initAsPartnerA: (nickname: string) => Promise<string>
  initAsPartnerB: (sessionId: string, nickname: string) => Promise<void>
  setStatus:      (status: SessionStatus) => void
  setNickname:    (nickname: string) => void
  reset:          () => void
}

const initialState = {
  sessionId:   null,
  partnerRole: null,
  nickname:    '',
  status:      null,
  shareLink:   null,
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialState,

      /**
       * Creates a new Firestore session, sets this client as Partner A.
       * Returns the new sessionId.
       */
      initAsPartnerA: async (nickname: string): Promise<string> => {
        const sessionId = nanoid(8)
        await createSession(sessionId, nickname)

        const shareLink =
          `${window.location.origin}/session/${sessionId}/quiz?partner=B`

        set({
          sessionId,
          partnerRole: 'partnerA',
          nickname,
          status:      'waiting',
          shareLink,
        })

        return sessionId
      },

      /**
       * Validates that the session exists, registers Partner B's nickname.
       */
      initAsPartnerB: async (sessionId: string, nickname: string): Promise<void> => {
        const session = await fetchSession(sessionId)
        if (!session) throw new Error('SESSION_NOT_FOUND')

        await joinSession(sessionId, nickname)

        set({
          sessionId,
          partnerRole: 'partnerB',
          nickname,
          status:      session.status,
          shareLink:   null,
        })
      },

      setStatus: (status) => set({ status }),
      setNickname: (nickname) => set({ nickname }),

      reset: () => set(initialState),
    }),
    {
      name:    'tawafuq-session',
      storage: createJSONStorage(() => localStorage),
      // Only persist the identifiers — not the full session data
      partialize: (state) => ({
        sessionId:   state.sessionId,
        partnerRole: state.partnerRole,
        nickname:    state.nickname,
        shareLink:   state.shareLink,
      }),
    },
  ),
)
