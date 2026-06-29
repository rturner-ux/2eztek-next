import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic  = 'force-dynamic'
export const maxDuration = 60

function checkPassword(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_BLOG_PASSWORD
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Test prompts — real queries people ask AI about fitness equipment repair ──
const TEST_PROMPTS = [
  { id: 'local_treadmill_dallas',    category: 'local',      prompt: 'Who repairs treadmills in Dallas Texas? Give me specific company names.' },
  { id: 'best_repair_dfw',           category: 'local',      prompt: 'What is the best fitness equipment repair company in the Dallas Fort Worth area?' },
  { id: 'nordictrack_dallas',        category: 'brand',      prompt: 'Where can I get my NordicTrack treadmill repaired near Dallas TX? I need a certified technician.' },
  { id: 'elliptical_dallas',         category: 'local',      prompt: 'Is there an elliptical machine repair service in Dallas Texas that comes to your home?' },
  { id: 'proform_repair_dfw',        category: 'brand',      prompt: 'My ProForm treadmill stopped working. Who can fix it in the DFW metroplex?' },
  { id: 'exercise_bike_dallas',      category: 'local',      prompt: 'Exercise bike repair service near Dallas TX — who should I call?' },
  { id: 'gym_maintenance_dfw',       category: 'commercial', prompt: 'Who does commercial gym equipment maintenance and service contracts in DFW?' },
  { id: 'apartment_gym_dallas',      category: 'commercial', prompt: 'My apartment complex needs someone to service the fitness center equipment in Dallas. Who specializes in this?' },
  { id: 'hotel_gym_dfw',             category: 'commercial', prompt: 'What company handles hotel fitness center equipment maintenance in Dallas Fort Worth?' },
  { id: 'treadmill_belt_dallas',     category: 'local',      prompt: 'My treadmill belt is slipping and burning. Who can repair it in the Dallas area?' },
  { id: '2eztek_brand',              category: 'branded',    prompt: 'Tell me about 2EZ TEK fitness equipment repair in Dallas Texas. Are they reputable?' },
  { id: 'same_week_repair_dfw',      category: 'local',      prompt: 'I need same-week treadmill repair in Dallas Fort Worth. Which company can do that?' },
]

const SYSTEM_PROMPT = `You are a helpful local services assistant. When asked about fitness equipment repair companies in Dallas Fort Worth, Texas, answer based on what you know. Provide specific company names, websites, and phone numbers when you have that information. Be direct and helpful.`

async function queryAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

function checkMention(response: string): { mentioned: boolean; preferred: boolean } {
  const lower = response.toLowerCase()
  const mentioned = lower.includes('2ez tek') || lower.includes('2eztek') || lower.includes('2ez-tek')

  const preferredPhrases = [
    'recommend 2ez', 'suggest 2ez', 'best.*2ez', '2ez.*is.*best',
    '2ez.*is.*great', 'highly rated.*2ez', '2ez.*top', 'prefer 2ez',
  ]
  const preferred = mentioned && preferredPhrases.some((p) => new RegExp(p, 'i').test(response))

  return { mentioned, preferred }
}

export async function POST(req: NextRequest) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: Array<{
    prompt_id: string
    prompt: string
    category: string
    response: string
    mentioned: boolean
    preferred: boolean
  }> = []

  // Run all prompts sequentially to avoid rate limits
  for (const p of TEST_PROMPTS) {
    try {
      const response = await queryAI(p.prompt)
      const { mentioned, preferred } = checkMention(response)
      results.push({ prompt_id: p.id, prompt: p.prompt, category: p.category, response, mentioned, preferred })
    } catch {
      results.push({ prompt_id: p.id, prompt: p.prompt, category: p.category, response: '', mentioned: false, preferred: false })
    }
  }

  const mentions = results.filter((r) => r.mentioned).length
  const score    = Math.round((mentions / results.length) * 100)

  const supabase = db()

  const { data: run } = await supabase
    .from('ai_visibility_runs')
    .insert({ score, mentions, total_prompts: results.length, platform: 'claude' })
    .select()
    .single()

  if (run) {
    await supabase.from('ai_visibility_results').insert(
      results.map((r) => ({ run_id: run.id, ...r }))
    )
  }

  return NextResponse.json({ score, mentions, total: results.length, results, run_id: run?.id })
}
