// app/api/cron/video-scripts/route.ts
// Generates short-form video scripts (TikTok/Reels) for 2EZ TEK and emails them weekly.
import { NextResponse } from 'next/server'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VIDEO_TOPICS = [
  { hook: 'Your treadmill belt is slipping — here is what that actually means', equipment: 'treadmill', issue: 'belt slipping' },
  { hook: 'Why your elliptical is making that grinding noise', equipment: 'elliptical', issue: 'grinding noise' },
  { hook: 'NordicTrack error code? Do this before calling for help', equipment: 'treadmill', issue: 'error code' },
  { hook: 'The #1 thing that kills treadmill motors in Texas summer', equipment: 'treadmill', issue: 'motor overheating' },
  { hook: 'Your Peloton resistance is not working — here is why', equipment: 'bike', issue: 'resistance failure' },
  { hook: 'Signs your gym equipment needs professional service', equipment: 'general', issue: 'maintenance signs' },
  { hook: 'How commercial gyms keep equipment running 24/7', equipment: 'commercial', issue: 'preventative maintenance' },
  { hook: 'Treadmill incline is stuck? Here is what our techs check first', equipment: 'treadmill', issue: 'incline not working' },
  { hook: 'Why apartment gym equipment breaks so fast', equipment: 'commercial', issue: 'high-use wear' },
  { hook: 'Life Fitness vs Precor — which breaks down less?', equipment: 'commercial', issue: 'brand comparison' },
  { hook: 'How to tell if your treadmill motor is failing', equipment: 'treadmill', issue: 'motor failure signs' },
  { hook: 'ProForm console is dead — is it the fuse or the board?', equipment: 'treadmill', issue: 'console dead' },
]

const VIDEO_SYSTEM = `You are a social media content strategist for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth, TX with 500+ five-star reviews.

You write punchy, engaging short-form video scripts (60 seconds / under 150 words) for TikTok and Instagram Reels. The videos position 2EZ TEK technicians as the go-to experts.

Script structure:
1. HOOK (3-5 sec): Attention-grabbing statement or question — must stop the scroll
2. BODY (30-40 sec): Educational content — what causes the issue, what to look for, what NOT to do
3. CTA (5-10 sec): "Call 2EZ TEK at 972-807-7232 or visit 2eztek.com"

Rules:
- Write like a real technician talking directly to camera — casual, confident, knowledgeable
- Use short punchy sentences. No filler.
- Include 1-2 specific technical details that prove expertise
- End with a clear CTA to call 2EZ TEK
- Caption section: 3-sentence Instagram/TikTok caption with relevant hashtags
- Return ONLY valid JSON, no extra text`

type VideoScript = {
  title: string
  hook: string
  body: string
  cta: string
  caption: string
  hashtags: string
}

async function generateVideoScript(topic: typeof VIDEO_TOPICS[0]): Promise<VideoScript> {
  const userMessage = `Generate a 60-second short-form video script for this topic.

Hook: "${topic.hook}"
Equipment: ${topic.equipment}
Issue: ${topic.issue}

Return ONLY valid JSON:
{
  "title": "short video title",
  "hook": "3-5 second hook line",
  "body": "30-40 second educational script (paragraph format for teleprompter)",
  "cta": "5-10 second call to action",
  "caption": "Instagram/TikTok caption (3 sentences)",
  "hashtags": "10-15 relevant hashtags"
}`

  const outputText = await callClaude({
    system: VIDEO_SYSTEM,
    userMessage,
    maxTokens: 1024,
    temperature: 0.7,
  })

  return JSON.parse(cleanJsonOutput(outputText))
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Generate 3 scripts per week run
    const shuffled = [...VIDEO_TOPICS].sort(() => Math.random() - 0.5).slice(0, 3)
    const scripts: VideoScript[] = []

    for (const topic of shuffled) {
      try {
        const script = await generateVideoScript(topic)
        scripts.push(script)
        await new Promise((r) => setTimeout(r, 400))
      } catch (err) {
        console.error('Video script generation failed:', topic.hook, err)
      }
    }

    if (scripts.length === 0) {
      return NextResponse.json({ success: true, message: 'No scripts generated', count: 0 })
    }

    // Email scripts to team
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Weekly Video Scripts Ready: ${scripts.length} TikTok/Reels scripts for filming`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:660px">
              <h2 style="color:#0891B2">Weekly Short-Form Video Scripts</h2>
              <p>${scripts.length} scripts are ready to film. Each is ~60 seconds and designed for TikTok and Instagram Reels.</p>
              <p style="color:#666;font-size:13px">Tip: Film vertically, hold phone steady, use natural lighting. Show the actual equipment when possible.</p>
              <hr/>

              ${scripts.map((s, i) => `
                <div style="margin:28px 0;padding:22px;border-radius:12px;background:#f9f9f9;border:1px solid #e5e5e5">
                  <h3 style="margin:0 0 16px;color:#0891B2">Script ${i + 1}: ${s.title}</h3>

                  <div style="margin-bottom:14px;padding:12px;background:#fff3cd;border-radius:8px;border:1px solid #ffc107">
                    <strong style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#856404">🎬 HOOK (0-5 sec)</strong>
                    <p style="margin:6px 0 0;font-size:15px;font-weight:bold">${s.hook}</p>
                  </div>

                  <div style="margin-bottom:14px;padding:12px;background:#fff;border-radius:8px;border:1px solid #e5e5e5">
                    <strong style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#666">📣 BODY (5-50 sec)</strong>
                    <p style="margin:8px 0 0;white-space:pre-wrap;color:#333">${s.body}</p>
                  </div>

                  <div style="margin-bottom:14px;padding:12px;background:#e0f9ff;border-radius:8px;border:1px solid #b2e8f7">
                    <strong style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#0891B2">📞 CTA (50-60 sec)</strong>
                    <p style="margin:6px 0 0;font-weight:bold;color:#0891B2">${s.cta}</p>
                  </div>

                  <div style="padding:12px;background:#f0fff0;border-radius:8px;border:1px solid #b7ddb7">
                    <strong style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#2d6a2d">📱 CAPTION + HASHTAGS</strong>
                    <p style="margin:6px 0 0;color:#333">${s.caption}</p>
                    <p style="margin:6px 0 0;color:#666;font-size:13px">${s.hashtags}</p>
                  </div>
                </div>
              `).join('')}

              <hr/>
              <p style="color:#999;font-size:12px">Auto-generated by 2EZ TEK Video Script Engine (Claude Sonnet). Runs weekly on Thursdays.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, count: scripts.length })
  } catch (error: any) {
    console.error('VIDEO SCRIPTS ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
