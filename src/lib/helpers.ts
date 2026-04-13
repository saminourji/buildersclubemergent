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

export function getNextTuesday(after: Date = new Date()): Date {
  const d = new Date(after)
  const day = d.getDay()
  const daysUntilTuesday = (2 - day + 7) % 7 || 7
  d.setDate(d.getDate() + daysUntilTuesday)
  d.setHours(19, 0, 0, 0)
  return d
}
