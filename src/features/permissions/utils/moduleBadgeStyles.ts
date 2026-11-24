const MODULE_BADGE_STYLES = [
  'bg-[#F0EDFF] text-[#5938DB]',
  'bg-emerald-50 text-emerald-700',
  'bg-sky-50 text-sky-700',
  'bg-amber-50 text-amber-700',
  'bg-rose-50 text-rose-700',
  'bg-violet-50 text-violet-700',
  'bg-teal-50 text-teal-700',
  'bg-indigo-50 text-indigo-700',
] as const

function hashModule(moduleKey: string) {
  let hash = 0
  for (let i = 0; i < moduleKey.length; i += 1) {
    hash = (hash * 31 + moduleKey.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getModuleBadgeClass(moduleKey: string) {
  const index = hashModule(moduleKey) % MODULE_BADGE_STYLES.length
  return MODULE_BADGE_STYLES[index]
}

export function formatModuleLabel(moduleKey: string) {
  return moduleKey
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatPermissionDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
