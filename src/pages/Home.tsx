import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Card, ErrorMessage } from '@/components/ui'
import { useSessionStore } from '@/stores/sessionStore'
import { t } from '@/lib/i18n'

type Mode = 'landing' | 'create' | 'join'

export default function Home() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const [mode, setMode]       = useState<Mode>('landing')
  const [nickname, setNickname] = useState('')
  const [sessionCode, setSessionCode] = useState(params.get('session') ?? '')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const { initAsPartnerA, initAsPartnerB } = useSessionStore()

  const handleCreate = async () => {
    if (!nickname.trim()) return
    setLoading(true)
    setError(null)
    try {
      const sessionId = await initAsPartnerA(nickname.trim())
      navigate(`/session/${sessionId}/quiz?partner=A`)
    } catch {
      setError(t('error.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!nickname.trim() || !sessionCode.trim()) return
    setLoading(true)
    setError(null)
    try {
      await initAsPartnerB(sessionCode.trim(), nickname.trim())
      navigate(`/session/${sessionCode.trim()}/quiz?partner=B`)
    } catch (err) {
      const msg = err instanceof Error && err.message === 'SESSION_NOT_FOUND'
        ? t('error.session.notfound')
        : t('error.generic')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell showHeader={false}>
      <div className="min-h-screen flex flex-col items-center justify-center py-12 space-y-8" dir="rtl">

        {/* Hero */}
        {mode === 'landing' && (
          <div className="text-center space-y-6 animate-fade-in">
            {/* Logo */}
            <div className="space-y-1">
              <h1 className="font-arabic text-display-ar font-bold text-brand-rose leading-none">
                توافق
              </h1>
              <p className="font-arabic text-sm text-brand-ink-muted tracking-wide">
                Tawafuq
              </p>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <p className="font-arabic text-h1-ar font-medium text-brand-ink leading-snug">
                {t('home.hero.title')}
              </p>
              <p className="font-arabic text-body-ar text-brand-ink-muted max-w-xs mx-auto leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
              {['الزواج', 'القيم', 'الحب', 'الأطفال', 'الطموح', 'نمط الحياة'].map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full bg-brand-cream-dark text-brand-ink-muted font-arabic text-xs border border-brand-sand"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="space-y-3 w-full max-w-xs mx-auto pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setMode('create')}
              >
                {t('home.cta.create')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => setMode('join')}
              >
                {t('home.cta.join')}
              </Button>
            </div>
          </div>
        )}

        {/* Create session */}
        {mode === 'create' && (
          <Card className="w-full max-w-sm animate-slide-up" padding="lg">
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-arabic text-h2-ar font-medium text-brand-ink">
                  ابدأ جلسة جديدة
                </h2>
                <p className="font-arabic text-sm text-brand-ink-muted">
                  ستتلقى رابطاً تشاركه مع شريكك بعد تسجيل اسمك
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="nickname-create" className="font-arabic text-sm font-medium text-brand-ink">
                  {t('home.name.label')}
                </label>
                <input
                  id="nickname-create"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder={t('home.name.placeholder')}
                  maxLength={30}
                  className="w-full rounded-2xl border-2 border-brand-sand bg-white px-4 py-3 font-arabic text-brand-ink placeholder:text-brand-ink-faint focus:border-brand-rose focus:outline-none transition-colors text-right"
                  dir="rtl"
                  autoFocus
                />
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setMode('landing'); setError(null) }}>
                  رجوع
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={!nickname.trim()}
                  onClick={handleCreate}
                >
                  {t('home.name.submit')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Join session */}
        {mode === 'join' && (
          <Card className="w-full max-w-sm animate-slide-up" padding="lg">
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-arabic text-h2-ar font-medium text-brand-ink">
                  انضم إلى جلسة
                </h2>
                <p className="font-arabic text-sm text-brand-ink-muted">
                  أدخل اسمك ورمز الجلسة الذي أرسله لك شريكك
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="nickname-join" className="font-arabic text-sm font-medium text-brand-ink">
                    {t('home.name.label')}
                  </label>
                  <input
                    id="nickname-join"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t('home.name.placeholder')}
                    maxLength={30}
                    className="w-full rounded-2xl border-2 border-brand-sand bg-white px-4 py-3 font-arabic text-brand-ink placeholder:text-brand-ink-faint focus:border-brand-rose focus:outline-none transition-colors text-right"
                    dir="rtl"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="session-code" className="font-arabic text-sm font-medium text-brand-ink">
                    رمز الجلسة
                  </label>
                  <input
                    id="session-code"
                    type="text"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    placeholder="مثال: abc12xyz"
                    maxLength={8}
                    className="w-full rounded-2xl border-2 border-brand-sand bg-white px-4 py-3 font-mono text-brand-ink placeholder:text-brand-ink-faint focus:border-brand-rose focus:outline-none transition-colors text-center tracking-widest"
                  />
                </div>
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setMode('landing'); setError(null) }}>
                  رجوع
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={!nickname.trim() || sessionCode.trim().length !== 8}
                  onClick={handleJoin}
                >
                  {t('home.name.submit')}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
