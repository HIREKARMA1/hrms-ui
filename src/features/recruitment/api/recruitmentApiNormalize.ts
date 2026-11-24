/** Shared list/envelope helpers for recruitment RTK Query modules (jobsApi pattern). */

export const RECRUITMENT_PAGE_SIZE = 20
export const RECRUITMENT_MAX_LIMIT = 100

export function clampRecruitmentLimit(limit: number | undefined) {
  return Math.min(Math.max(Math.trunc(limit ?? RECRUITMENT_PAGE_SIZE), 1), RECRUITMENT_MAX_LIMIT)
}

export function clampRecruitmentPage(page: number | undefined) {
  return Math.max(Math.trunc(page ?? 1), 1)
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

export function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

export function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export type RecruitmentPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function normalizeRecruitmentPagination(
  raw: unknown,
  itemCount: number,
): RecruitmentPagination {
  const row = asRecord(raw)
  const page = readNumber(row?.page) || 1
  const limit = readNumber(row?.limit) || RECRUITMENT_PAGE_SIZE
  const total = row?.total !== undefined ? readNumber(row.total) ?? itemCount : itemCount
  const totalPages =
    row?.totalPages !== undefined
      ? readNumber(row.totalPages) ?? 0
      : total === 0
        ? 0
        : Math.ceil(total / limit)
  return { page, limit, total, totalPages }
}

export function unwrapRecruitmentData(raw: unknown): unknown {
  const root = asRecord(raw)
  return root?.data !== undefined ? root.data : raw
}

export function normalizeSkillsArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 50)
}