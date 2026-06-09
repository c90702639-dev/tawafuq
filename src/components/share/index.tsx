import { useState } from 'react'
import { Button } from '@/components/ui'
import { t } from '@/lib/i18n'
import type { SessionScores } from '@/types'

// ─── ExportButtons ────────────────────────────────────────────────────────────
interface ExportButtonsProps {
  sessionId:  string
  scores:     SessionScores
  nicknameA:  string
  nicknameB:  string
}

export function ExportButtons({ sessionId, scores, nicknameA, nicknameB }: ExportButtonsProps) {
  const [cardLoading, setCardLoading] = useState(false)
  const [pdfLoading,  setPdfLoading]  = useState(false)
  const [cardError,   setCardError]   = useState<string | null>(null)
  const [pdfError,    setPdfError]    = useState<string | null>(null)

  const downloadCard = async () => {
    setCardLoading(true)
    setCardError(null)
    try {
      const res = await fetch('/.netlify/functions/card', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          sessionId,
          nicknameA,
          nicknameB,
          overallScore:   scores.overall,
          coupleNickname: scores.coupleNickname,
        }),
      })
      if (!res.ok) throw new Error('CARD_FAILED')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `tawafuq-${nicknameA}-${nicknameB}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setCardError(t('error.generic'))
    } finally {
      setCardLoading(false)
    }
  }

  const downloadPdf = async () => {
    setPdfLoading(true)
    setPdfError(null)
    try {
      const res = await fetch('/.netlify/functions/generate-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId }),
      })
      if (!res.ok) throw new Error('PDF_FAILED')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `tawafuq-${nicknameA}-${nicknameB}-report.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setPdfError(t('error.generic'))
    } finally {
      setPdfLoading(false)
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `نتائجنا على توافق 💑\n${nicknameA} و${nicknameB} — توافق ${scores.overall}٪\n"${scores.coupleNickname}"\n${window.location.origin}`,
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="space-y-3 w-full" dir="rtl">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={cardLoading}
        onClick={downloadCard}
        aria-label={t('share.download.card')}
      >
        {!cardLoading && (
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <path d="M8 12h8M12 8v8"/>
          </svg>
        )}
        {t('share.download.card')}
      </Button>
      {cardError && <p className="text-red-600 text-sm font-arabic text-center">{cardError}</p>}

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        loading={pdfLoading}
        onClick={downloadPdf}
        aria-label={t('share.download.pdf')}
      >
        {!pdfLoading && (
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
        )}
        {t('share.download.pdf')}
      </Button>
      {pdfError && <p className="text-red-600 text-sm font-arabic text-center">{pdfError}</p>}

      <Button
        variant="ghost"
        size="lg"
        fullWidth
        onClick={shareWhatsApp}
        aria-label={t('share.whatsapp')}
      >
        <svg className="h-5 w-5 flex-shrink-0 text-green-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
        {t('share.whatsapp')}
      </Button>
    </div>
  )
}

// ─── ShareLinkBox ─────────────────────────────────────────────────────────────
interface ShareLinkBoxProps {
  link: string
}

export function ShareLinkBox({ link }: ShareLinkBoxProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = link
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-2xl border border-brand-sand bg-brand-cream p-4 space-y-3" dir="rtl">
      <p className="font-arabic text-sm text-brand-ink-muted">رابط شريكك</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs text-brand-ink font-mono truncate bg-white rounded-xl p-2 border border-brand-sand">
          {link}
        </code>
        <Button variant="secondary" size="sm" onClick={copy} aria-label="نسخ الرابط">
          {copied ? '✓' : 'نسخ'}
        </Button>
      </div>
    </div>
  )
}
