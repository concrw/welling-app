import { getMessages } from '../i18n'

const CLIENT_ID = '461247177054-8ffqs924s1kbr5bkq4md1snmkq4ieibe.apps.googleusercontent.com'
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'
const STORAGE_KEY = 'gcal_token'

export interface RoutineEvent {
  name: string
  time: string // HH:MM
  desc: string
  groupName: string
}

function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

function saveToken(token: string) {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isConnected(): boolean {
  return !!getToken()
}

export function connectGoogle(): Promise<string> {
  return new Promise((resolve, reject) => {
    const redirectUri = window.location.origin
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: SCOPES,
      prompt: 'select_account',
    })
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    const popup = window.open(url, 'gcal_auth', 'width=500,height=600,left=200,top=100')
    if (!popup) {
      reject(new Error(getMessages().lib.popupBlocked))
      return
    }

    const timer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(timer)
          reject(new Error(getMessages().lib.loginWindowClosed))
          return
        }
        const hash = popup.location.hash
        if (hash && hash.includes('access_token')) {
          clearInterval(timer)
          popup.close()
          const tokenParams = new URLSearchParams(hash.replace('#', ''))
          const token = tokenParams.get('access_token')
          if (token) {
            saveToken(token)
            resolve(token)
          } else {
            reject(new Error(getMessages().lib.tokenNotReceived))
          }
        }
      } catch {
        // cross-origin 접근 오류는 무시 (팝업이 구글 도메인일 때)
      }
    }, 300)
  })
}

function toRFC3339(time: string): { start: string; end: string } {
  const today = new Date()
  const [h, m] = time.split(':').map(Number)
  const start = new Date(today)
  start.setHours(h, m, 0, 0)
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + 30)
  // Google Calendar API requires RFC3339 with timezone offset
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const startStr = `${dateStr}T${pad(h)}:${pad(m)}:00+09:00`
  const endH = Math.floor((h * 60 + m + 30) / 60) % 24
  const endM = (m + 30) % 60
  const endStr = `${dateStr}T${pad(endH)}:${pad(endM)}:00+09:00`
  return { start: startStr, end: endStr }
}

async function createEvent(token: string, event: RoutineEvent): Promise<void> {
  const { start, end } = toRFC3339(event.time || '09:00')
  const body = {
    summary: `[Welling] ${event.name}`,
    description: event.desc ? `${event.groupName} · ${event.desc}` : event.groupName,
    start: { dateTime: start, timeZone: 'Asia/Seoul' },
    end: { dateTime: end, timeZone: 'Asia/Seoul' },
    recurrence: ['RRULE:FREQ=DAILY'],
    colorId: '2', // Sage
  }
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json()
    if (err.error?.code === 401) {
      clearToken()
      throw new Error('AUTH_EXPIRED')
    }
    throw new Error(err.error?.message || getMessages().lib.eventCreateFailed)
  }
}

export interface CalendarEventSummary {
  summary: string
  start: string
}

export async function fetchTodayEvents(): Promise<CalendarEventSummary[]> {
  const token = getToken()
  if (!token) throw new Error('NOT_CONNECTED')

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const timeMin = `${dateStr}T00:00:00+09:00`
  const timeMax = `${dateStr}T23:59:59+09:00`

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
  })
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json()
    if (err.error?.code === 401) {
      clearToken()
      throw new Error('AUTH_EXPIRED')
    }
    throw new Error(err.error?.message || getMessages().lib.eventFetchFailed)
  }
  const data = await res.json()
  const items = (data.items ?? []) as Array<{ summary?: string; start?: { dateTime?: string; date?: string } }>
  return items
    .filter((item) => item.summary)
    .map((item) => ({
      summary: item.summary as string,
      start: item.start?.dateTime ?? item.start?.date ?? '',
    }))
}

export async function syncRoutinesToCalendar(events: RoutineEvent[]): Promise<{ success: number; failed: number }> {
  const token = getToken()
  if (!token) throw new Error('NOT_CONNECTED')

  let success = 0
  let failed = 0
  for (const ev of events) {
    try {
      await createEvent(token, ev)
      success++
    } catch (e) {
      if ((e as Error).message === 'AUTH_EXPIRED') throw e
      failed++
    }
  }
  return { success, failed }
}
