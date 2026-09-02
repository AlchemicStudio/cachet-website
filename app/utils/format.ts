/** Binary size, rendered in the active locale (e.g. "109,9 Mo" in fr). */
export function formatBytes(bytes: number, locale: string): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—'
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: units[unit],
    unitDisplay: 'short',
    maximumFractionDigits: value < 10 && unit > 0 ? 1 : 0
  }).format(value)
}

export function formatDate(iso: string, locale: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(d)
}

export function formatNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(n)
}

/** `sha256:ab12…` → `ab12…`; anything unexpected is passed through untouched. */
export function stripDigestAlgo(digest: string): string {
  const i = digest.indexOf(':')
  return i === -1 ? digest : digest.slice(i + 1)
}

export function digestAlgo(digest: string): string {
  const i = digest.indexOf(':')
  return i === -1 ? 'checksum' : digest.slice(0, i).toUpperCase()
}
