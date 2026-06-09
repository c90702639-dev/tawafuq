import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          rose:    '#C17B7B',
          'rose-light': '#F5E6E6',
          'rose-dark':  '#9B5A5A',
          cream:   '#FBF6F0',
          'cream-dark': '#F0E8DF',
          sand:    '#E8DDD3',
          ink:     '#2C2C2A',
          'ink-muted': '#5F5E5A',
          'ink-faint': '#9C9A92',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        latin:  ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        'display-ar': ['3.5rem',  { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'h1-ar':      ['2.25rem', { lineHeight: '1.3'  }],
        'h2-ar':      ['1.5rem',  { lineHeight: '1.4'  }],
        'h3-ar':      ['1.125rem',{ lineHeight: '1.5'  }],
        'body-ar':    ['1rem',    { lineHeight: '1.75' }],
        'sm-ar':      ['0.875rem',{ lineHeight: '1.6'  }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card':   '0 2px 16px 0 rgba(44,44,42,0.08)',
        'card-lg':'0 8px 32px 0 rgba(44,44,42,0.12)',
        'brand':  '0 4px 20px 0 rgba(193,123,123,0.30)',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out both',
        'slide-up':      'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-rtl':  'slideInRtl 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':      'scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-soft':    'pulseSoft 2s ease-in-out infinite',
        'spin-slow':     'spin 3s linear infinite',
        'reveal':        'reveal 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRtl: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        reveal: {
          '0%':   { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backgroundImage: {
        'texture-cream': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}

export default config
