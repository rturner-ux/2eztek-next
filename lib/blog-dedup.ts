// Shared duplicate detection for all blog crons.
// Checks slug equality AND meaningful title word overlap so near-duplicates
// ("Treadmill Belt Slipping Dallas" vs "Treadmill Belt Slipping in Dallas Fort Worth") are caught.

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','that','this','what','when','how','your','our','their','its','are',
  'is','it','as','be','we','you','do','not','if','all','can','get','just',
  'have','will','more','than','very','some','about','which','there','here',
])

function keyWords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

export function titlesSimilar(a: string, b: string, threshold = 0.55): boolean {
  const wa = new Set(keyWords(a))
  const wb = keyWords(b)
  if (wa.size === 0 || wb.length === 0) return false
  const overlap = wb.filter(w => wa.has(w)).length
  return overlap / Math.max(wa.size, wb.length) >= threshold
}

export function makeSlugLocal(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function isDuplicateInList(
  title: string,
  existing: Array<{ title?: string | null; slug?: string | null }>,
): boolean {
  const slug = makeSlugLocal(title)
  return existing.some(p =>
    p.slug === slug || titlesSimilar(p.title || '', title),
  )
}
