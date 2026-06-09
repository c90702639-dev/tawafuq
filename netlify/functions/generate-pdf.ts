import type { Handler, HandlerEvent } from '@netlify/functions'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { SessionDoc } from '../../src/types/index'

// ─── Firebase Admin init ──────────────────────────────────────────────────────
function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

// ─── Category labels ──────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  marriage:    'الزواج والمستقبل',
  personality: 'الشخصية والقيم',
  lifestyle:   'نمط الحياة والعادات',
  love:        'لغة الحب',
  kids:        'الأطفال والعائلة',
  ambitions:   'الطموحات والأهداف',
}

// ─── Score color ──────────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 80) return '#2E7D52'
  if (score >= 60) return '#C17B7B'
  if (score >= 40) return '#BA7517'
  return '#A32D2D'
}

// ─── HTML template for the PDF ────────────────────────────────────────────────
function buildPdfHtml(data: SessionDoc, sessionId: string): string {
  const scores    = data.scores!
  const nicknameA = data.partnerA.nickname
  const nicknameB = (data.partnerB as { nickname?: string })?.nickname ?? 'الشريك الثاني'
  const answersA  = data.partnerA.answers ?? {}
  const answersB  = (data.partnerB as { answers?: Record<string, string> })?.answers ?? {}

  const categoryRows = Object.entries(scores.breakdown)
    .map(([cat, val]) => {
      const color = scoreColor(val as number)
      return `
        <div class="cat-row">
          <span class="cat-label">${CATEGORY_LABELS[cat] ?? cat}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${val}%; background:${color}"></div>
          </div>
          <span class="cat-score" style="color:${color}">${val}٪</span>
        </div>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', sans-serif; background: #FBF6F0; color: #2C2C2A; direction: rtl; }

  .page {
    width: 794px; min-height: 1123px; padding: 60px;
    background: #FBF6F0; margin: 0 auto;
  }

  /* Cover */
  .cover { text-align: center; padding: 80px 40px; background: #2C2C2A;
    border-radius: 24px; margin-bottom: 48px; }
  .cover-app  { color: #C17B7B; font-size: 14px; letter-spacing: 4px; margin-bottom: 16px; }
  .cover-score { color: white; font-size: 72px; font-weight: 700; line-height: 1; }
  .cover-label { color: #9C9A92; font-size: 14px; margin-top: 8px; margin-bottom: 24px; }
  .cover-names { color: white; font-size: 22px; font-weight: 600; }
  .cover-archetype { color: #C17B7B; font-size: 28px; font-weight: 700; margin-top: 16px; }
  .cover-desc { color: #9C9A92; font-size: 13px; margin-top: 8px; max-width: 320px; margin-inline: auto; line-height: 1.7; }

  /* Section */
  .section { background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px;
    border: 1px solid #E8DDD3; }
  .section-title { font-size: 16px; font-weight: 700; color: #2C2C2A; margin-bottom: 20px;
    padding-bottom: 12px; border-bottom: 1px solid #F0E8DF; }

  /* Empathy */
  .empathy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .empathy-card { background: #FBF6F0; border-radius: 12px; padding: 20px; text-align: center; }
  .empathy-name  { font-size: 13px; color: #5F5E5A; margin-bottom: 8px; }
  .empathy-score { font-size: 36px; font-weight: 700; color: #5F5E5A; }
  .empathy-label { font-size: 11px; color: #9C9A92; margin-top: 4px; }

  /* Category bars */
  .cat-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .cat-label { width: 160px; font-size: 13px; color: #2C2C2A; flex-shrink: 0; }
  .bar-track { flex: 1; height: 8px; background: #F0E8DF; border-radius: 99px; overflow: hidden; }
  .bar-fill  { height: 100%; border-radius: 99px; }
  .cat-score { width: 36px; text-align: left; font-size: 12px; font-weight: 600; }

  /* Footer */
  .footer { text-align: center; margin-top: 40px; color: #9C9A92; font-size: 11px; }
  .session-id { font-family: monospace; letter-spacing: 2px; }
</style>
</head>
<body>
<div class="page">

  <!-- Cover -->
  <div class="cover">
    <p class="cover-app">توافق</p>
    <p class="cover-score">${scores.overall}٪</p>
    <p class="cover-label">نسبة التوافق</p>
    <p class="cover-names">${nicknameA} &amp; ${nicknameB}</p>
    <p class="cover-archetype">${scores.coupleNickname}</p>
  </div>

  <!-- Empathy -->
  <div class="section">
    <p class="section-title">مدى معرفة كل منكما للآخر</p>
    <div class="empathy-grid">
      <div class="empathy-card">
        <p class="empathy-name">${nicknameA}</p>
        <p class="empathy-score" style="color:${scoreColor(scores.empathyA)}">${scores.empathyA}٪</p>
        <p class="empathy-label">توقّع إجابات شريكه</p>
      </div>
      <div class="empathy-card">
        <p class="empathy-name">${nicknameB}</p>
        <p class="empathy-score" style="color:${scoreColor(scores.empathyB)}">${scores.empathyB}٪</p>
        <p class="empathy-label">توقّع إجابات شريكه</p>
      </div>
    </div>
  </div>

  <!-- Category breakdown -->
  <div class="section">
    <p class="section-title">التفصيل حسب المحور</p>
    ${categoryRows}
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>تقرير توافق الأزواج — <span class="session-id">${sessionId}</span></p>
    <p style="margin-top:4px">tawafuq.netlify.app</p>
  </div>

</div>
</body>
</html>`
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
    const snap = await db.collection('sessions').doc(sessionId).get()

    if (!snap.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Session not found' }) }
    }

    const data = snap.data() as SessionDoc
    if (!data.scores) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Scores not computed yet' }) }
    }

    // Dynamically import Puppeteer — keeps cold-start impact minimal
    const puppeteer = await import('puppeteer-core')
    const chromium  = await import('@sparticuz/chromium')

    const browser = await puppeteer.default.launch({
      args:            chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath:  await chromium.default.executablePath(),
      headless:        true,
    })

    const page = await browser.newPage()
    await page.setContent(buildPdfHtml(data, sessionId), { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format:            'A4',
      printBackground:   true,
      margin:            { top: '0', right: '0', bottom: '0', left: '0' },
    })

    await browser.close()

    return {
      statusCode: 200,
      headers:    {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="tawafuq-${sessionId}.pdf"`,
      },
      body:       Buffer.from(pdf).toString('base64'),
      isBase64Encoded: true,
    }
  } catch (err) {
    console.error('[generate-pdf] error:', err)
    return {
      statusCode: 500,
      body:       JSON.stringify({ error: 'PDF generation failed' }),
    }
  }
}
