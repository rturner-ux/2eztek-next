import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ADMIN_PASSWORD = process.argv[2]
const API_URL = 'https://www.2eztek.com/api/admin/blog'

const FILES = [
  'blog-post-ifit-lawsuit.html',
  'blog-post-peloton-lawsuit.html',
  'blog-post-sole-lawsuit.html',
  'blog-post-precor-lawsuit.html',
  'blog-post-gym-equipment-liability.html',
  'blog-post-rogue-assembly.html',
  'blog-post-prx-installation.html',
  'blog-post-peloton-resistance.html',
  'blog-post-peloton-touchscreen.html',
  'blog-post-peloton-clicking.html',
  'blog-post-rogue-wall-mount.html',
]

if (!ADMIN_PASSWORD) {
  console.error('Usage: node scripts/publish-blog-posts.mjs <admin-password>')
  process.exit(1)
}

function parseMeta(raw) {
  const commentMatch = raw.match(/<!--([\s\S]*?)-->/)
  if (!commentMatch) throw new Error('No comment block found')

  const block = commentMatch[1]
  const get = (key) => {
    const m = block.match(new RegExp(`${key}:\\s*(.+)`))
    return m ? m[1].trim() : ''
  }

  const content = raw.slice(raw.indexOf('-->') + 3).trim()

  return {
    title: get('TITLE'),
    slug: get('SLUG'),
    category: get('CATEGORY'),
    seo_title: get('SEO TITLE'),
    seo_description: get('SEO DESC'),
    excerpt: get('EXCERPT'),
    content,
  }
}

async function publishPost(meta) {
  const payload = {
    ...meta,
    hero_image_url: '',
    gallery_images: [],
    published: false,
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': ADMIN_PASSWORD,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  return data
}

async function main() {
  for (const file of FILES) {
    const path = join(__dirname, file)
    const raw = readFileSync(path, 'utf-8')

    let meta
    try {
      meta = parseMeta(raw)
    } catch (err) {
      console.error(`  SKIP ${file}: ${err.message}`)
      continue
    }

    process.stdout.write(`Publishing "${meta.title}"... `)

    try {
      const result = await publishPost(meta)
      if (result.success) {
        console.log(`OK — /blog/${meta.slug}`)
      } else {
        console.log(`FAILED — ${result.message}`)
      }
    } catch (err) {
      console.log(`ERROR — ${err.message}`)
    }
  }
}

main()
