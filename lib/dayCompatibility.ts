import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { getGraphToken } from './msGraph'

// Real incident (2026-09-30): Robby blocked Mon-Wed off entirely for a
// commercial job, I cleared the calendar for those days by hand, but
// nothing in the automated booking paths (inbox-monitor, service-request
// auto-approve) knew those days were supposed to stay empty -- so when a
// customer replied to a reschedule email suggesting Wednesday, inbox-monitor
// booked her right back into the gap I'd just cleared. This table is the
// actual persisted constraint every booking path now checks, instead of the
// blackout only existing as one-off scripts.
let blockedDatesCache: { dates: Set<string>; fetchedAt: number } | null = null
const BLOCKED_DATES_CACHE_MS = 60_000

export async function isDateBlocked(dateIso: string): Promise<boolean> {
  const now = Date.now()
  if (!blockedDatesCache || now - blockedDatesCache.fetchedAt > BLOCKED_DATES_CACHE_MS) {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      const { data } = await supabase.from('blocked_dates').select('blocked_date')
      blockedDatesCache = { dates: new Set((data || []).map((d: { blocked_date: string }) => d.blocked_date)), fetchedAt: now }
    } catch {
      // If the table doesn't exist yet or the query fails, fail open (don't
      // block bookings) rather than break scheduling entirely -- this is a
      // belt-and-suspenders check, not the only thing standing between a
      // booking and reality.
      blockedDatesCache = { dates: new Set(), fetchedAt: now }
    }
  }
  return blockedDatesCache.dates.has(dateIso)
}

const BASE_LAT = 32.970
const BASE_LNG = -96.836

// Hard backstop on job count, regardless of how the time budget math works
// out -- a sanity ceiling in case duration estimates run systematically low.
// Tunable without a code change via Vercel env vars.
const MAX_JOBS_PER_DAY = parseInt(process.env.MAX_JOBS_PER_DAY || '8', 10)

// The real constraint: how many minutes of actual working day a technician
// has, and how fast they can realistically move between jobs in DFW traffic
// (a mix of highway and surface streets, not point-to-point as the crow
// flies). Both tunable via env vars.
const WORKDAY_MINUTES = parseInt(process.env.WORKDAY_MINUTES || '540', 10) // 8am-5pm
const AVG_SPEED_MPH = parseFloat(process.env.AVG_SPEED_MPH || '32')

function travelMinutesForMiles(miles: number): number {
  return Math.round((miles / AVG_SPEED_MPH) * 60)
}

function eventDurationMinutes(event: { start?: { dateTime?: string }; end?: { dateTime?: string } }): number {
  if (!event.start?.dateTime || !event.end?.dateTime) return 60
  const diffMinutes = (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / 60000
  return diffMinutes > 0 ? diffMinutes : 60
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function cleanAddress(raw: string): string {
  const zipMatch = raw.match(/^(.+\b\d{5}\b)/)
  if (zipMatch) return zipMatch[1].trim()
  return raw.split(',').slice(0, 3).join(',').trim()
}

export type Coords = { lat: number; lng: number }

export async function geocodeCoords(address: string): Promise<Coords | null> {
  const cleaned = cleanAddress(address)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(cleaned)}&benchmark=2020&format=json`
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      const match = data?.result?.addressMatches?.[0]
      if (match) return { lat: parseFloat(match.coordinates.y), lng: parseFloat(match.coordinates.x) }
    }
  } catch { /* fall through */ }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleaned + ', Texas, USA')}&format=json&limit=1&countrycodes=us`,
      { signal: controller.signal, headers: { 'User-Agent': '2EZTEK-ServiceApp/1.0 (support@2eztek.com)', 'Accept-Language': 'en' } }
    )
    clearTimeout(timeout)
    const results = await res.json()
    if (results?.length) return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
  } catch { /* silent */ }

  return null
}

export type DayCompatibilityResult = {
  compatible: boolean
  reason?: 'full' | 'distance' | 'blocked'
  conflictingEvent?: { subject?: string; location?: string; distanceMiles: number }
  dayEventCount?: number
}

export type DayConflict = {
  eventAId: string
  eventBId: string
  eventASubject?: string
  eventBSubject?: string
  distanceMiles: number
}

// Full pairwise scan of every event on one calendar day, regardless of how
// each event got there (website booking, Square sync, admin save, or a
// human dragging things around directly in Outlook). checkDayCompatibility
// above only protects the moment a booking is created through this app's own
// code; this is the safety net that catches everything else, including
// manual Outlook edits no application code ever sees.
export async function findGeographicConflicts(
  events: Array<{ id: string; subject?: string; location?: string }>
): Promise<DayConflict[]> {
  const coordsCache = new Map<string, Coords | null>()
  for (const e of events) {
    if (e.location && !coordsCache.has(e.location)) {
      coordsCache.set(e.location, await geocodeCoords(e.location))
    }
  }

  const conflicts: DayConflict[] = []
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i]
      const b = events[j]
      if (!a.location || !b.location) continue
      const ca = coordsCache.get(a.location)
      const cb = coordsCache.get(b.location)
      if (!ca || !cb) continue
      const dist = haversine(ca.lat, ca.lng, cb.lat, cb.lng)
      if (dist > 20) {
        conflicts.push({
          eventAId: a.id,
          eventBId: b.id,
          eventASubject: a.subject,
          eventBSubject: b.subject,
          distanceMiles: Math.round(dist),
        })
      }
    }
  }
  return conflicts
}

// Shared with app/api/service-request/route.ts's original check (kept
// separate there to avoid touching already-working code) -- flags whether
// `newAddress` fits on `dateIso`'s schedule. Two independent gates:
// (1) it must be within 20 miles of at least one appointment already on the
//     calendar that day (or the day must be empty) -- a lone job on the
//     other side of DFW is a bad pairing regardless of how much spare time
//     is left;
// (2) the day's real time budget -- sum of every existing job's actual
//     scheduled duration, plus estimated travel time to/from the nearest
//     existing job, plus this job's own estimated duration -- must fit
//     inside one workday. A single big job (several hours) can fill a day
//     on its own even with zero other appointments; this no longer treats
//     every booking as an interchangeable 1-hour slot.
// `excludeSubjectContains` (customer name/email) keeps a customer's own
// existing event on that date from being compared against itself.
export async function checkDayCompatibility(
  dateIso: string,
  newAddress: string,
  excludeSubjectContains?: string,
  newJobDurationMinutes = 60,
  precomputedNewCoords?: Coords | null
): Promise<DayCompatibilityResult> {
  if (await isDateBlocked(dateIso)) return { compatible: false, reason: 'blocked' }

  const token = await getGraphToken()
  if (!token) return { compatible: true }

  const calEmail = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'
  try {
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${calEmail}/calendarView` +
      `?startDateTime=${dateIso}T00:00:00&endDateTime=${dateIso}T23:59:59` +
      `&$select=subject,location,start,end&$top=20`,
      { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="Central Standard Time"' } }
    )
    if (!res.ok) return { compatible: true }
    const data = await res.json()
    const events: Array<{ subject?: string; location?: { displayName?: string }; start?: { dateTime?: string }; end?: { dateTime?: string } }> = data.value || []
    const excludeKey = excludeSubjectContains?.toLowerCase()
    const otherEvents = excludeKey
      ? events.filter((e) => !String(e.subject || '').toLowerCase().includes(excludeKey))
      : events
    if (otherEvents.length === 0) return { compatible: true, dayEventCount: 0 }

    if (otherEvents.length >= MAX_JOBS_PER_DAY) {
      return { compatible: false, reason: 'full', dayEventCount: otherEvents.length }
    }

    const usedMinutes = otherEvents.reduce((sum, e) => sum + eventDurationMinutes(e), 0)

    // Reuse the caller's already-geocoded coords when checking the same
    // address against many dates at once (the availability grid) -- avoids
    // firing off a redundant geocode request per date for an address that
    // hasn't changed.
    const newCoords = precomputedNewCoords !== undefined ? precomputedNewCoords : await geocodeCoords(newAddress)
    if (!newCoords) {
      // Can't verify geography -- fall back to a pure time-budget check.
      if (usedMinutes + newJobDurationMinutes > WORKDAY_MINUTES) {
        return { compatible: false, reason: 'full', dayEventCount: otherEvents.length }
      }
      return { compatible: true, dayEventCount: otherEvents.length }
    }

    let nearestDistance = Infinity
    let nearestConflict: { subject?: string; location?: string; distanceMiles: number } | undefined
    for (const event of otherEvents) {
      const loc = event.location?.displayName
      if (!loc) continue
      const existingCoords = await geocodeCoords(loc)
      if (!existingCoords) continue
      const dist = haversine(newCoords.lat, newCoords.lng, existingCoords.lat, existingCoords.lng)
      if (dist < nearestDistance) nearestDistance = dist
      if (dist > 20 && (!nearestConflict || dist < nearestConflict.distanceMiles)) {
        nearestConflict = { subject: event.subject, location: loc, distanceMiles: Math.round(dist) }
      }
    }

    if (nearestDistance === Infinity) return { compatible: true, dayEventCount: otherEvents.length } // nothing geocodable to compare against

    if (nearestDistance > 20) {
      return { compatible: false, reason: 'distance', conflictingEvent: nearestConflict, dayEventCount: otherEvents.length }
    }

    // Geographically fine -- now check whether there's actually enough time
    // left in the day once travel to the nearest existing job is counted.
    const travelMinutes = travelMinutesForMiles(nearestDistance)
    if (usedMinutes + travelMinutes + newJobDurationMinutes > WORKDAY_MINUTES) {
      return { compatible: false, reason: 'full', dayEventCount: otherEvents.length }
    }

    return { compatible: true, dayEventCount: otherEvents.length }
  } catch {
    return { compatible: true }
  }
}

// checkDayCompatibility above only answers "does this day have room in
// aggregate" (distance to the nearest job + total time budget) -- it was
// never a literal calendar check, so a request could pass it and still get
// placed directly on top of an existing appointment's exact time. That's
// exactly what happened booking Jason Burrow (Northlake, auto-approved for
// 8:00 AM) on the same morning Barbara Matamoros already had 8:00 AM in
// Dallas: the day "had room" by the aggregate math, but 8:00 AM itself did
// not. This does the literal check checkDayCompatibility skips -- scans a
// requested time window in 15-minute steps and returns the first start time
// with no real overlap against anything already on the calendar that day.
export async function findLiteralOpenSlot(
  dateIso: string,
  windowStartTime: string,
  windowEndTime: string,
  durationMinutes: number,
  excludeSubjectContains?: string
): Promise<string | null> {
  if (await isDateBlocked(dateIso)) return null

  const token = await getGraphToken()
  if (!token) return windowStartTime

  const calEmail = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'
  try {
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${calEmail}/calendarView` +
      `?startDateTime=${dateIso}T00:00:00&endDateTime=${dateIso}T23:59:59` +
      `&$select=subject,start,end&$top=20`,
      { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="Central Standard Time"' } }
    )
    if (!res.ok) return windowStartTime
    const data = await res.json()
    const events: Array<{ subject?: string; start?: { dateTime?: string }; end?: { dateTime?: string } }> = data.value || []
    const excludeKey = excludeSubjectContains?.toLowerCase()
    const otherEvents = excludeKey
      ? events.filter((e) => !String(e.subject || '').toLowerCase().includes(excludeKey))
      : events

    const windowStartMs = new Date(`${dateIso}T${windowStartTime}`).getTime()
    const windowEndMs = new Date(`${dateIso}T${windowEndTime}`).getTime()
    const STEP_MS = 15 * 60000

    for (let startMs = windowStartMs; startMs + durationMinutes * 60000 <= windowEndMs; startMs += STEP_MS) {
      const endMs = startMs + durationMinutes * 60000
      const clear = !otherEvents.some((e) => {
        if (!e.start?.dateTime || !e.end?.dateTime) return false
        const evStart = new Date(e.start.dateTime).getTime()
        const evEnd = new Date(e.end.dateTime).getTime()
        return evStart < endMs && evEnd > startMs
      })
      if (clear) {
        const d = new Date(startMs)
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`
      }
    }
    return null
  } catch {
    return windowStartTime
  }
}

// Cheap, rule-based duration guess for live checks that fire as the customer
// fills out the booking form -- can't afford an AI call on every keystroke
// settle the way the real triage step (at actual submission) can. Good
// enough to catch the "this is obviously a big job" cases that matter most
// for the day's time budget; the AI estimate at submission time is what
// actually gets saved.
export function estimateDurationMinutes(serviceType: string, details: string): number {
  const text = `${serviceType} ${details}`.toLowerCase()
  let minutes = 60
  if (/assembl|install/.test(text)) minutes = 150
  else if (/maintenance|tune.?up/.test(text)) minutes = 75
  if (/multiple|several|fleet|commercial|\band\b.*\band\b/.test(text)) minutes += 60
  return minutes
}

export type DateSuggestion = { dateIso: string; reason: 'nearby_job' | 'open'; distanceMiles: number | null }

// Called only when checkDayCompatibility rejects a date -- scans forward for
// a day that actually works, preferring one where a job is already scheduled
// near this address (an easy add-on to an existing trip) over a day that's
// simply empty. Skips days that are already time-budget-full without
// geocoding anything, so the cost only falls on days worth evaluating.
export async function suggestAlternativeDates(
  newAddress: string,
  fromDateIso: string,
  maxSuggestions = 3,
  daysToScan = 14,
  newJobDurationMinutes = 60
): Promise<DateSuggestion[]> {
  const token = await getGraphToken()
  if (!token) return []

  const calEmail = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'
  const newCoords = await geocodeCoords(newAddress)

  const candidates: Array<{ dateIso: string; minDistance: number | null; count: number }> = []
  const start = new Date(fromDateIso + 'T00:00:00')

  for (let i = 1; i <= daysToScan; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (d.getDay() === 0) continue // Sunday -- matches the booking form's own date picker

    const candidateIso = d.toISOString().slice(0, 10)
    if (await isDateBlocked(candidateIso)) continue
    try {
      const res = await fetch(
        `https://graph.microsoft.com/v1.0/users/${calEmail}/calendarView` +
        `?startDateTime=${candidateIso}T00:00:00&endDateTime=${candidateIso}T23:59:59` +
        `&$select=location,start,end&$top=20`,
        { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="Central Standard Time"' } }
      )
      if (!res.ok) continue
      const data = await res.json()
      const events: Array<{ location?: { displayName?: string }; start?: { dateTime?: string }; end?: { dateTime?: string } }> = data.value || []
      if (events.length >= MAX_JOBS_PER_DAY) continue

      const usedMinutes = events.reduce((sum, e) => sum + eventDurationMinutes(e), 0)
      if (usedMinutes + newJobDurationMinutes > WORKDAY_MINUTES) continue // already full on time alone

      if (events.length === 0 || !newCoords) {
        candidates.push({ dateIso: candidateIso, minDistance: null, count: events.length })
        continue
      }

      // One representative event is enough to gauge "is this day in the same
      // area" -- the compatibility check already keeps each day's jobs
      // clustered, so checking every single one adds cost without much
      // signal.
      const loc = events[0].location?.displayName
      const coords = loc ? await geocodeCoords(loc) : null
      const minDistance = coords ? haversine(newCoords.lat, newCoords.lng, coords.lat, coords.lng) : null

      if (minDistance !== null) {
        const travelMinutes = travelMinutesForMiles(minDistance)
        if (usedMinutes + travelMinutes + newJobDurationMinutes > WORKDAY_MINUTES) continue // doesn't actually fit once travel is counted
      }

      candidates.push({ dateIso: candidateIso, minDistance, count: events.length })
    } catch {
      continue
    }

    // Stop early once there are enough good, nearby-job candidates -- no
    // need to keep scanning and geocoding further into the future.
    const nearbyCount = candidates.filter((c) => c.minDistance !== null && c.minDistance <= 20).length
    if (nearbyCount >= maxSuggestions) break
  }

  candidates.sort((a, b) => {
    const aNearby = a.minDistance !== null && a.minDistance <= 20
    const bNearby = b.minDistance !== null && b.minDistance <= 20
    if (aNearby && !bNearby) return -1
    if (!aNearby && bNearby) return 1
    if (aNearby && bNearby) return a.minDistance! - b.minDistance!
    return a.count - b.count
  })

  return candidates.slice(0, maxSuggestions).map((c) => ({
    dateIso: c.dateIso,
    reason: c.minDistance !== null && c.minDistance <= 20 ? 'nearby_job' : 'open',
    distanceMiles: c.minDistance !== null ? Math.round(c.minDistance) : null,
  }))
}

function formatDateLabel(dateIso: string, lang: 'en' | 'es' = 'en'): string {
  const d = new Date(dateIso + 'T12:00:00')
  return d.toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export type DateRecommendation = {
  chosenDateOk: boolean
  reason?: 'full' | 'distance' | 'blocked'
  betterDate?: {
    dateIso: string
    distanceMiles: number | null
    nearbyJob: boolean
    explanation: string
  }
}

// Called live as the customer picks a date on the booking form, before they
// ever submit -- the goal is to steer them toward the most efficient day up
// front so an admin doesn't have to manually reschedule later. Explains the
// *why* (routing efficiency, technician already in the area, real time
// budget for the day) rather than just reporting a mileage number.
export async function recommendDate(
  newAddress: string,
  chosenDateIso: string,
  jobDurationMinutes = 60,
  lang: 'en' | 'es' = 'en'
): Promise<DateRecommendation> {
  const check = await checkDayCompatibility(chosenDateIso, newAddress, undefined, jobDurationMinutes)
  const chosenLabel = formatDateLabel(chosenDateIso, lang)

  if (!check.compatible) {
    const [best] = await suggestAlternativeDates(newAddress, chosenDateIso, 1, 14, jobDurationMinutes)
    if (!best) return { chosenDateOk: false, reason: check.reason }

    const betterLabel = formatDateLabel(best.dateIso, lang)
    const explanation = lang === 'es'
      ? (() => {
          const problemText = check.reason === 'full'
            ? `${chosenLabel} no tiene suficiente tiempo disponible una vez que se consideran los trabajos existentes, el traslado entre ellos y esta visita`
            : `el ${chosenLabel} nuestro técnico ya está comprometido con un trabajo al otro lado de DFW`
          const whyBetter = best.reason === 'nearby_job'
            ? `ya tenemos un trabajo programado cerca de su dirección ese día, así que agrupar su visita con ese viaje significa menos tiempo de traslado para el técnico y generalmente un servicio más rápido y confiable para usted`
            : `está completamente libre en nuestro horario, así que no hay riesgo de conflicto de ruta`
          return `${problemText}. Le sugerimos ${betterLabel} en su lugar: ${whyBetter}.`
        })()
      : (() => {
          const problemText = check.reason === 'full'
            ? `${chosenLabel} doesn't have enough time left once existing jobs, travel between them, and this visit are all accounted for`
            : `on ${chosenLabel} our technician is already committed to a job on the opposite side of DFW from you`
          const whyBetter = best.reason === 'nearby_job'
            ? `we already have a job scheduled near your address that day, so grouping your visit with that trip means less drive time for the technician and usually faster, more reliable service for you`
            : `it's completely open on our schedule, so there's no risk of a routing conflict`
          return `${problemText}. We'd suggest ${betterLabel} instead: ${whyBetter}.`
        })()

    return {
      chosenDateOk: false,
      reason: check.reason,
      betterDate: {
        dateIso: best.dateIso,
        distanceMiles: best.distanceMiles,
        nearbyJob: best.reason === 'nearby_job',
        explanation,
      },
    }
  }

  // Chosen date already works. Still worth a soft nudge if it's a "cold"
  // pick (nothing else scheduled that day) while a date within the same
  // week already has a job close by -- clustering there is more efficient
  // and cuts the odds we'd want to move things around later for routing.
  if (!check.dayEventCount) {
    const [best] = await suggestAlternativeDates(newAddress, chosenDateIso, 1, 5, jobDurationMinutes)
    if (best && best.reason === 'nearby_job' && best.distanceMiles !== null && best.distanceMiles <= 10) {
      const betterLabel = formatDateLabel(best.dateIso, lang)
      const explanation = lang === 'es'
        ? `${chosenLabel} está bien, pero si su horario es flexible, el ${betterLabel} ya tiene un trabajo programado a unas ${best.distanceMiles} millas de usted. Reservar el mismo día que un trabajo cercano generalmente significa un servicio más rápido ya que el técnico ya está en la zona.`
        : `${chosenLabel} works fine, but if your schedule is flexible, ${betterLabel} already has a job scheduled about ${best.distanceMiles} miles from you. Booking the same day as a nearby job usually means a faster turnaround since the technician is already in the area.`
      return {
        chosenDateOk: true,
        betterDate: {
          dateIso: best.dateIso,
          distanceMiles: best.distanceMiles,
          nearbyJob: true,
          explanation,
        },
      }
    }
  }

  return { chosenDateOk: true }
}
