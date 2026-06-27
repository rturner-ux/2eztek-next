/**
 * Fetches the most recent customer lead from production, derives 3 blog topics
 * from it, generates each post with AI + Pexels hero image, and saves them as
 * unpublished drafts ready for review in the admin blog page.
 *
 * Usage:
 *   node scripts/generate-lead-blog-posts.mjs <admin-password>
 */

const ADMIN_PASSWORD = process.argv[2]
const SITE = 'https://www.2eztek.com'

if (!ADMIN_PASSWORD) {
  console.error('Usage: node scripts/generate-lead-blog-posts.mjs <admin-password>')
  process.exit(1)
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-admin-password': ADMIN_PASSWORD,
  }
}

async function getMostRecentLead() {
  const res = await fetch(`${SITE}/api/admin/customers`, { headers: headers() })
  const data = await res.json()
  if (!data.success || !data.customers?.length) throw new Error('No customers found or unauthorized')
  return data.customers[0]
}

function parseBrand(brandModel = '') {
  const known = [
    'NordicTrack', 'ProForm', 'Life Fitness', 'LifeFitness', 'Precor', 'Peloton',
    'Bowflex', 'Matrix', 'Cybex', 'StairMaster', 'Schwinn', 'Technogym',
    'TRUE Fitness', 'Nautilus', 'Star Trac', 'FreeMotion', 'Hammer Strength',
    'Sole', 'Horizon', 'Nordictrack',
  ]
  for (const b of known) {
    if (brandModel.toLowerCase().includes(b.toLowerCase())) return b
  }
  return brandModel.split(' ')[0] || 'Fitness Equipment'
}

function parseEquipment(equipmentType = '', brandModel = '') {
  const src = (equipmentType + ' ' + brandModel).toLowerCase()
  if (src.includes('treadmill')) return 'treadmill'
  if (src.includes('elliptical')) return 'elliptical'
  if (src.includes('bike') || src.includes('cycle')) return 'bike'
  if (src.includes('stairmaster') || src.includes('stair')) return 'stairmaster'
  if (src.includes('strength') || src.includes('cable') || src.includes('gym')) return 'strength machine'
  if (src.includes('rower') || src.includes('rowing')) return 'rowing machine'
  return equipmentType || 'fitness equipment'
}

function deriveIssue(details = '', serviceType = '') {
  const src = (details + ' ' + serviceType).toLowerCase()
  if (src.includes('belt') && src.includes('slip')) return 'belt slipping'
  if (src.includes('belt')) return 'walking belt replacement'
  if (src.includes('motor') && src.includes('board')) return 'motor control board failure'
  if (src.includes('motor')) return 'drive motor failure'
  if (src.includes('console') || src.includes('screen') || src.includes('display')) return 'console not working'
  if (src.includes('incline') || src.includes('incline')) return 'incline not working'
  if (src.includes('resistance')) return 'resistance not working'
  if (src.includes('noise') || src.includes('grinding') || src.includes('squeak')) return 'grinding noise'
  if (src.includes('error') || src.includes('code') || src.includes('fault')) return 'error code'
  if (src.includes('power') || src.includes('turn on') || src.includes('dead')) return 'not turning on'
  if (src.includes('pedal')) return 'pedal issue'
  if (src.includes('speed')) return 'speed fluctuation'
  return serviceType || 'repair needed'
}

function buildTopics(lead) {
  const brand = parseBrand(lead.brand_model)
  const equipment = parseEquipment(lead.equipment_type, lead.brand_model)
  const primaryIssue = deriveIssue(lead.details, lead.service_type)

  // Three angles on the same lead:
  // 1. Exact issue the customer had
  // 2. Related upstream cause (what usually causes that issue)
  // 3. Preventive maintenance angle — how to avoid the problem
  const relatedIssue = primaryIssue.includes('belt') ? 'motor control board failure' :
    primaryIssue.includes('console') ? 'belt slipping' :
    primaryIssue.includes('motor') ? 'error code troubleshooting' :
    'belt and motor maintenance'

  return [
    { brand, equipment, issue: primaryIssue },
    { brand, equipment, issue: relatedIssue },
    {
      brand,
      equipment,
      issue: `preventive maintenance tips to extend ${equipment} life`,
    },
  ]
}

async function generatePost(topic) {
  const res = await fetch(`${SITE}/api/admin/blog/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(topic),
  })
  const data = await res.json()
  return data
}

async function main() {
  console.log('Fetching most recent customer lead...')
  const lead = await getMostRecentLead()
  console.log(`Lead: ${lead.name || 'Unknown'} — ${lead.equipment_type || ''} ${lead.brand_model || ''} — "${lead.details || lead.service_type || ''}"`)
  console.log()

  const topics = buildTopics(lead)

  for (let i = 0; i < topics.length; i++) {
    const t = topics[i]
    process.stdout.write(`[${i + 1}/3] Generating: ${t.brand} ${t.equipment} "${t.issue}"... `)
    try {
      const result = await generatePost(t)
      if (result.success) {
        console.log(`OK — /blog/${result.post.slug}`)
      } else {
        console.log(`FAILED — ${result.message}`)
      }
    } catch (err) {
      console.log(`ERROR — ${err.message}`)
    }

    if (i < topics.length - 1) await new Promise(r => setTimeout(r, 4000))
  }

  console.log()
  console.log('Done. Review drafts at https://www.2eztek.com/admin/blog')
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
