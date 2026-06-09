import React from 'react'
import { t } from '@/lib/i18n'

// ─── RTLWrapper ───────────────────────────────────────────────────────────────
// Ensures all content inside is RTL-aware
interface RTLWrapperProps {
  children: React.ReactNode
  className?: string
}

export function RTLWrapper({ children, className = '' }: RTLWrapperProps) {
  return (
    <div dir="rtl" lang="ar" className={['font-arabic', className].join(' ')}>
      {children}
    </div>
  )
}

// ─── PageContainer ────────────────────────────────────────────────────────────
// Max-width centered container for page content
interface PageContainerProps {
  children:   React.ReactNode
  className?: string
  narrow?:    boolean   // 480px max vs 640px
}

export function PageContainer({ children, className = '', narrow = false }: PageContainerProps) {
  return (
    <div
      className={[
        'mx-auto w-full px-4',
        narrow ? 'max-w-sm' : 'max-w-lg',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

// ─── AppShell ──────────────────────────────────────────────────────────────────
// Full-page shell: background, centered layout, brand header
interface AppShellProps {
  children:     React.ReactNode
  showHeader?:  boolean
  className?:   string
}

export function AppShell({ children, showHeader = true, className = '' }: AppShellProps) {
  return (
    <div
      className={[
        'min-h-screen bg-brand-cream bg-texture-cream',
        'flex flex-col',
        className,
      ].join(' ')}
      dir="rtl"
      lang="ar"
    >
      {showHeader && (
        <header className="sticky top-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-sand">
          <PageContainer>
            <div className="h-14 flex items-center justify-between">
              <span
                className="font-arabic text-xl font-bold text-brand-rose"
                aria-label={t('app.name')}
              >
                توافق
              </span>
              <span className="font-arabic text-xs text-brand-ink-muted">
                {t('app.tagline')}
              </span>
            </div>
          </PageContainer>
        </header>
      )}

      <main className="flex-1 py-8">
        <PageContainer>
          {children}
        </PageContainer>
      </main>

      <footer className="py-6 border-t border-brand-sand">
        <PageContainer>
          <p className="font-arabic text-xs text-brand-ink-faint text-center">
            © 2026 توافق — جميع الحقوق محفوظة
          </p>
        </PageContainer>
      </footer>
    </div>
  )
}

// ─── StepIndicator ────────────────────────────────────────────────────────────
interface StepIndicatorProps {
  steps:   string[]
  current: number    // 0-based
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-2" aria-label="مراحل الجلسة" dir="rtl">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div
            className={[
              'h-2 rounded-full transition-all duration-300',
              i === current
                ? 'w-6 bg-brand-rose'
                : i < current
                  ? 'w-2 bg-brand-rose-light'
                  : 'w-2 bg-brand-sand',
            ].join(' ')}
            aria-label={step}
            aria-current={i === current ? 'step' : undefined}
          />
        </React.Fragment>
      ))}
    </div>
  )
}
