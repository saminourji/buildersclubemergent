export function formatClassYear(classYear: number | null): string {
  if (!classYear) return '—'
  if (classYear === 9999) return 'Grad'
  // Stored as year * 10, e.g. 2027.5 => 20275
  if (classYear > 9000) return 'Grad'
  if (classYear > 2100) {
    const year = classYear / 10
    const short = year % 100
    if (short % 1 === 0) return `'${short.toFixed(0)}`
    return `'${short.toFixed(1)}`
  }
  // Legacy: stored as plain year
  return `'${String(classYear).slice(2)}`
}

// Format a date string in Eastern Time (handles EST/EDT automatically)
export function formatET(dateStr: string, fmt: 'full' | 'date' | 'time' | 'short'): string {
  const date = new Date(dateStr)
  const opts: Intl.DateTimeFormatOptions = { timeZone: 'America/New_York' }

  if (fmt === 'full') {
    return new Intl.DateTimeFormat('en-US', {
      ...opts, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(date)
  }
  if (fmt === 'date') {
    return new Intl.DateTimeFormat('en-US', {
      ...opts, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    }).format(date)
  }
  if (fmt === 'time') {
    return new Intl.DateTimeFormat('en-US', {
      ...opts, hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(date)
  }
  // short: "Apr 14"
  return new Intl.DateTimeFormat('en-US', {
    ...opts, month: 'short', day: 'numeric',
  }).format(date)
}

// Given a meeting start date and a minute offset, return formatted time like "7:15 PM"
export function formatAgendaTime(meetingDateStr: string, offsetMinutes: number): string {
  const base = new Date(meetingDateStr)
  base.setMinutes(base.getMinutes() + offsetMinutes)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(base)
}

export function getNextTuesday(after: Date = new Date()): Date {
  const d = new Date(after)
  const day = d.getDay()
  const daysUntilTuesday = (2 - day + 7) % 7 || 7
  d.setDate(d.getDate() + daysUntilTuesday)
  d.setHours(19, 0, 0, 0)
  return d
}
