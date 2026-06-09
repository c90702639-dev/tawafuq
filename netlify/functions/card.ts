import type { Handler, HandlerEvent } from '@netlify/functions'
import type { ShareCardPayload } from '../../src/types/index'

// ─── Score color ──────────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 80) return '#2E7D52'
  if (score >= 60) return '#C17B7B'
  if (score >= 40) return '#BA7517'
  return '#A32D2D'
}

// ─── Conic gradient for score ring ───────────────────────────────────────────
function conicGradient(score: number, color: string): string {
  const deg = Math.round(score * 3.6)
  return `conic-gradient(${color} ${deg}deg, #3a3a38 0deg)`
}

// ─── HTML for the 9:16 share card ────────────────────────────────────────────
function buildCardHtml(payload: ShareCardPayload): string {
  const { nicknameA, nicknameB, overallScore, coupleNickname } = payload
  const ringColor = scoreColor(overallScore)
  const gradient  = conicGradient(overallScore, ringColor)

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px; height: 1920px;
    font-family: 'Cairo', sans-serif;
    background: #FBF6F0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    direction: rtl; overflow: hidden;
  }

  .card {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: space-between;
    padding: 120px 80px;
    background: linear-gradient(160deg, #2C2C2A 0%, #2C2C2A 55%, #FBF6F0 55%);
  }

  /* Top section (dark) */
  .top {
    display: flex; flex-direction: column; align-items: center;
    gap: 48px; width: 100%;
  }

  .app-name {
    font-size: 32px; font-weight: 700; color: #C17B7B;
    letter-spacing: 8px; text-transform: uppercase;
  }

  /* Score ring */
  .ring-outer {
    width: 340px; height: 340px; border-radius: 50%;
    background: ${gradient};
    display: flex; align-items: center; justify-content: center;
  }
  .ring-inner {
    width: 280px; height: 280px; border-radius: 50%;
    background: #2C2C2A;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px;
  }
  .score-num   { font-size: 80px; font-weight: 800; color: white; line-height: 1; }
  .score-label { font-size: 22px; color: #9C9A92; }

  .names {
    font-size: 36px; font-weight: 600; color: white;
    text-align: center; line-height: 1.4;
  }
  .names span { color: #C17B7B; }

  /* Bottom section (cream) */
  .bottom {
    display: flex; flex-direction: column; align-items: center;
    gap: 24px; width: 100%; padding-top: 80px;
  }

  .archetype-label { font-size: 22px; color: #9C9A92; }
  .archetype-name  { font-size: 72px; font-weight: 800; color: #C17B7B; line-height: 1.1; text-align: center; }

  .divider { width: 120px; height: 2px; background: #E8DDD3; margin: 8px 0; }

  .tagline { font-size: 24px; color: #9C9A92; text-align: center; }

  /* Decorative dots */
  .dots {
    display: flex; gap: 12px; margin-top: 16px;
  }
  .dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: #E8DDD3;
  }
  .dot.active { background: #C17B7B; width: 28px; border-radius: 5px; }
</style>
</head>
<body>
<div class="card">
  <div class="top">
    <p class="app-name">توافق</p>

    <div class="ring-outer">
      <div class="ring-inner">
        <span class="score-num">${overallScore}٪</span>
        <span class="score-label">توافق</span>
      </div>
    </div>

    <p class="names">
      <span>${nicknameA}</span> &amp; <span>${nicknameB}</span>
    </p>
  </div>

  <div class="bottom">
    <p class="archetype-label">لقبكما معاً</p>
    <p class="archetype-name">${coupleNickname}</p>
    <div class="divider"></div>
    <p class="tagline">اكتشفا مدى توافقكما</p>
    <div class="dots">
      <div class="dot"></div>
      <div class="dot active"></div>
      <div class="dot"></div>
    </div>
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

  let payload: ShareCardPayload
  try {
    payload = JSON.parse(event.body ?? '{}') as ShareCardPayload
    if (!payload.sessionId || !payload.nicknameA || !payload.nicknameB) {
      throw new Error('Missing required fields')
    }
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  try {
    const puppeteer = await import('puppeteer-core')
    const chromium  = await import('@sparticuz/chromium')

    const browser = await puppeteer.default.launch({
      args:            chromium.default.args,
      defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 },
      executablePath:  await chromium.default.executablePath(),
      headless:        true,
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 })
    await page.setContent(buildCardHtml(payload), { waitUntil: 'networkidle0' })

    const screenshot = await page.screenshot({
      type:     'png',
      clip:     { x: 0, y: 0, width: 1080, height: 1920 },
      omitBackground: false,
    })

    await browser.close()

    return {
      statusCode: 200,
      headers:    {
        'Content-Type':        'image/png',
        'Content-Disposition': `attachment; filename="tawafuq-${payload.nicknameA}-${payload.nicknameB}.png"`,
      },
      body:       Buffer.from(screenshot).toString('base64'),
      isBase64Encoded: true,
    }
  } catch (err) {
    console.error('[card function] error:', err)
    return {
      statusCode: 500,
      body:       JSON.stringify({ error: 'Card generation failed' }),
    }
  }
}
