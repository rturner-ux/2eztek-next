export async function getGraphToken(): Promise<string | null> {
  const tenantId     = process.env.AZURE_TENANT_ID
  const clientId     = process.env.AZURE_CLIENT_ID
  const clientSecret = process.env.AZURE_CLIENT_SECRET
  if (!tenantId || !clientId || !clientSecret) return null

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     clientId,
        client_secret: clientSecret,
        scope:         'https://graph.microsoft.com/.default',
      }),
    }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.access_token || null
}

export async function createAppointmentEvent(opts: {
  customerName: string
  customerPhone?: string
  customerEmail?: string
  address?: string
  equipment?: string
  issue?: string
  appointmentDate: string   // YYYY-MM-DD
  appointmentTime?: string  // e.g. "9:00 AM" or "afternoon"
  technicianName?: string
}): Promise<string | null> {
  const token = await getGraphToken()
  if (!token) return null

  const calEmail = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'

  // Parse appointment time into a start hour (default 9 AM)
  let startHour = 9
  if (opts.appointmentTime) {
    const t = opts.appointmentTime.toLowerCase()
    if (t.includes('pm')) {
      const h = parseInt(t)
      startHour = h === 12 ? 12 : h + 12
    } else if (t.includes('am')) {
      startHour = parseInt(t) || 9
    } else if (t.includes('afternoon')) {
      startHour = 13
    } else if (t.includes('morning')) {
      startHour = 9
    }
  }
  const startTime = `${String(startHour).padStart(2, '0')}:00:00`
  const endTime   = `${String(startHour + 2).padStart(2, '0')}:00:00`

  const dateLabel = new Date(opts.appointmentDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const bodyLines = [
    `DATE: ${dateLabel}`,
    opts.appointmentTime ? `TIME: ${opts.appointmentTime}` : '',
    opts.technicianName  ? `TECH: ${opts.technicianName}`  : '',
    '',
    `CUSTOMER: ${opts.customerName}`,
    opts.customerPhone ? `PHONE: ${opts.customerPhone}` : '',
    opts.customerEmail ? `EMAIL: ${opts.customerEmail}` : '',
    opts.address       ? `ADDRESS: ${opts.address}`     : '',
    '',
    opts.equipment ? `EQUIPMENT: ${opts.equipment}` : '',
    opts.issue     ? `ISSUE: ${opts.issue}`         : '',
  ].filter(l => l !== undefined)

  const attendees: Array<{ emailAddress: { address: string; name: string }; type: string }> = []
  if (opts.customerEmail) {
    attendees.push({
      emailAddress: { address: opts.customerEmail, name: opts.customerName },
      type: 'required',
    })
  }

  try {
    // Skip creating a duplicate if this customer already has an event on
    // this date -- repeated Comm Hub saves/sends for the same appointment
    // shouldn't each create a fresh calendar entry.
    const viewRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${calEmail}/calendarView?startDateTime=${opts.appointmentDate}T00:00:00&endDateTime=${opts.appointmentDate}T23:59:59&$select=id,subject`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'outlook.timezone="Central Standard Time"',
        },
      }
    )
    if (viewRes.ok) {
      const viewData = await viewRes.json()
      const nameKey = opts.customerName.toLowerCase()
      const existing = (viewData.value || []).find((e: any) =>
        String(e.subject || '').toLowerCase().includes(nameKey)
      )
      if (existing) {
        console.log('OUTLOOK: existing appointment event found, skipping duplicate:', existing.id)
        return existing.id as string
      }
    }
  } catch (err) {
    console.error('OUTLOOK APPT DUPLICATE CHECK ERROR:', err)
  }

  try {
    const res = await fetch(`https://graph.microsoft.com/v1.0/users/${calEmail}/calendar/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: `2EZ TEK: ${opts.equipment || 'Service'} | ${opts.customerName}`,
        body: { contentType: 'text', content: bodyLines.join('\n') },
        start: { dateTime: `${opts.appointmentDate}T${startTime}`, timeZone: 'Central Standard Time' },
        end:   { dateTime: `${opts.appointmentDate}T${endTime}`,   timeZone: 'Central Standard Time' },
        location: { displayName: opts.address || 'Dallas Fort Worth, TX' },
        showAs: 'busy',
        ...(attendees.length > 0 && { attendees }),
      }),
    })
    if (!res.ok) {
      console.error('OUTLOOK APPT EVENT ERROR:', res.status, await res.text())
      return null
    }
    const data = await res.json()
    return data.id || null
  } catch (err) {
    console.error('OUTLOOK APPT EVENT ERROR:', err)
    return null
  }
}

export async function createOutlookContact(opts: {
  name: string
  phone?: string
  email?: string
  address?: string
}): Promise<string | null> {
  const token = await getGraphToken()
  if (!token) return null

  const userEmail = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'

  try {
    // Skip creating a duplicate if a contact with this email already exists
    if (opts.email) {
      const searchRes = await fetch(
        `https://graph.microsoft.com/v1.0/users/${userEmail}/contacts?$filter=${encodeURIComponent(
          `emailAddresses/any(a:a/address eq '${opts.email.replace(/'/g, "''")}')`
        )}&$select=id`,
        { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } }
      )
      if (searchRes.ok) {
        const searchData = await searchRes.json()
        const existing = searchData.value?.[0]?.id
        if (existing) return existing
      }
    }

    const nameParts = opts.name.trim().split(/\s+/)
    const givenName = nameParts[0] || opts.name
    const surname = nameParts.slice(1).join(' ') || undefined

    const contact: Record<string, any> = { givenName, displayName: opts.name }
    if (surname) contact.surname = surname
    if (opts.phone) contact.mobilePhone = opts.phone
    if (opts.email) contact.emailAddresses = [{ address: opts.email, name: opts.name }]
    if (opts.address) contact.homeAddress = { street: opts.address }

    const res = await fetch(`https://graph.microsoft.com/v1.0/users/${userEmail}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    })
    if (!res.ok) {
      console.error('OUTLOOK CONTACT CREATE ERROR:', res.status, await res.text())
      return null
    }
    const data = await res.json()
    return data.id || null
  } catch (err) {
    console.error('OUTLOOK CONTACT ERROR:', err)
    return null
  }
}

export async function postTeamsNotification(webhookUrl: string, card: object): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    })
  } catch (err) {
    console.error('TEAMS WEBHOOK ERROR:', err)
  }
}

export async function createOutlookTask(opts: {
  title: string
  body: string
  dueDateIso?: string
  importance?: 'low' | 'normal' | 'high'
}): Promise<void> {
  const token = await getGraphToken()
  if (!token) return

  const userEmail = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'

  try {
    // Find or create the "2EZ TEK" task list
    const listsRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userEmail}/todo/lists`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!listsRes.ok) return

    const listsData = await listsRes.json()
    const lists: Array<{ id: string; displayName: string }> = listsData.value || []
    let listId = lists.find((l) => l.displayName === '2EZ TEK')?.id

    if (!listId) {
      const createRes = await fetch(
        `https://graph.microsoft.com/v1.0/users/${userEmail}/todo/lists`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName: '2EZ TEK' }),
        }
      )
      if (!createRes.ok) return
      const created = await createRes.json()
      listId = created.id
    }

    if (!listId) return

    const task: Record<string, any> = {
      title: opts.title,
      importance: opts.importance || 'normal',
      body: { contentType: 'text', content: opts.body },
    }

    if (opts.dueDateIso) {
      task.dueDateTime = {
        dateTime: `${opts.dueDateIso}T17:00:00.000`,
        timeZone: 'Central Standard Time',
      }
    }

    const taskRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userEmail}/todo/lists/${listId}/tasks`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      }
    )

    if (!taskRes.ok) {
      const err = await taskRes.text()
      console.error('OUTLOOK TASK CREATE ERROR:', taskRes.status, err)
    } else {
      console.log('OUTLOOK TASK: created:', opts.title)
    }
  } catch (err) {
    console.error('OUTLOOK TASK ERROR:', err)
  }
}
