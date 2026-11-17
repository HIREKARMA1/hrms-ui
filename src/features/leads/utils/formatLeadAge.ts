export function formatLeadAge(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const days = Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000))
  if (days < 1) return 'Updated today'
  if (days === 1) return 'Updated yesterday'
  if (days < 30) return `${days}d since update`
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}