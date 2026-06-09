import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Firestore,
  DocumentReference,
  Unsubscribe,
} from 'firebase/firestore'
import type { SessionDoc, PartnerData, SessionScores, SessionStatus } from '@/types'

// ─── Firebase config (injected via Vite env vars) ────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// ─── Singleton init ───────────────────────────────────────────────────────────
let app: FirebaseApp
let db: Firestore

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0]
  }
  return app
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}

// ─── Collection reference helpers ────────────────────────────────────────────
function sessionRef(sessionId: string): DocumentReference {
  return doc(getDb(), 'sessions', sessionId)
}

// ─── Session CRUD ─────────────────────────────────────────────────────────────

/**
 * Creates a new session document in Firestore.
 * Called by Partner A when they land on /session/new.
 */
export async function createSession(
  sessionId: string,
  partnerANickname: string,
): Promise<void> {
  const partnerA: PartnerData = {
    nickname:    partnerANickname,
    answers:     {},
    predictions: {},
    done:        false,
  }

  await setDoc(sessionRef(sessionId), {
    createdAt: serverTimestamp(),
    status:    'waiting' satisfies SessionStatus,
    partnerA,
  })
}

/**
 * Fetches a session document once (non-reactive).
 * Returns null if the session does not exist.
 */
export async function fetchSession(sessionId: string): Promise<SessionDoc | null> {
  const snap = await getDoc(sessionRef(sessionId))
  if (!snap.exists()) return null
  return snap.data() as SessionDoc
}

/**
 * Writes Partner B's nickname to an existing session.
 * Called when Partner B lands on the quiz page and enters their name.
 */
export async function joinSession(
  sessionId: string,
  partnerBNickname: string,
): Promise<void> {
  const partnerB: Partial<PartnerData> = {
    nickname:    partnerBNickname,
    answers:     {},
    predictions: {},
    done:        false,
  }
  await updateDoc(sessionRef(sessionId), { partnerB })
}

/**
 * Writes a partner's final answers and predictions to Firestore,
 * then marks them as done.
 * Checks if both partners are done and updates status to 'both_done'.
 */
export async function submitPartnerAnswers(
  sessionId:   string,
  role:        'partnerA' | 'partnerB',
  answers:     PartnerData['answers'],
  predictions: PartnerData['predictions'],
): Promise<void> {
  // Mark this partner as done
  await updateDoc(sessionRef(sessionId), {
    [`${role}.answers`]:     answers,
    [`${role}.predictions`]: predictions,
    [`${role}.done`]:        true,
  })

  // Check if the other partner is also done; if so, update status
  const snap = await getDoc(sessionRef(sessionId))
  if (!snap.exists()) return

  const data = snap.data() as SessionDoc
  const otherRole = role === 'partnerA' ? 'partnerB' : 'partnerA'
  const otherDone = data[otherRole]?.done === true

  if (otherDone) {
    await updateDoc(sessionRef(sessionId), { status: 'both_done' satisfies SessionStatus })
  }
}

/**
 * Writes computed scores back to Firestore.
 * In production this is called by the Netlify score function via Admin SDK.
 * This client-side version is used as a fallback / dev convenience.
 */
export async function writeScores(
  sessionId: string,
  scores:    SessionScores,
): Promise<void> {
  await updateDoc(sessionRef(sessionId), {
    scores,
    'partnerA.nickname': (await getDoc(sessionRef(sessionId))).data()?.partnerA?.nickname,
  })
}

/**
 * Marks a session as revealed (both partners have seen the results).
 */
export async function markRevealed(sessionId: string): Promise<void> {
  await updateDoc(sessionRef(sessionId), { status: 'revealed' satisfies SessionStatus })
}

// ─── Real-time listener ───────────────────────────────────────────────────────

/**
 * Subscribes to real-time updates on a session document.
 * Returns an unsubscribe function — call it in a useEffect cleanup.
 */
export function subscribeToSession(
  sessionId: string,
  onData:    (data: SessionDoc) => void,
  onError?:  (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    sessionRef(sessionId),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as SessionDoc)
      }
    },
    (err) => {
      console.error('[Firebase] onSnapshot error:', err)
      onError?.(err)
    },
  )
}
