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
