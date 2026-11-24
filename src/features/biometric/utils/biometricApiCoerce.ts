export function coerceOptionalString(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    const trimmed = String(value).trim()
    return trimmed || undefined
  }
  return undefined
}

export function coerceBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === 1) return true
  if (value === 'false' || value === 0) return false
  return fallback
}

export function coerceNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

export function unwrapRecord(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  return {}
}

export function pickItemsArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  const root = unwrapRecord(raw)
  const candidates = [root.items, root.devices, root.data, root.results]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}