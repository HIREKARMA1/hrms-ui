/**
 * POST/PATCH /leave-types bodies aligned with the live strict schemas
 * (no requiresApproval; integer maxAllowedDays; optional description).
 */

import type { CreateLeaveTypeBody, UpdateLeaveTypeBody } from '../api/leaveApi.types'

export type MaxDaysParse = number | null | 'invalid' | 'decimal'

export function parseLeaveTypeMaxDays(raw: string): MaxDaysParse {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (!/^\d+$/.test(trimmed)) {
    if (/^\d*\.\d+$/.test(trimmed)) return 'decimal'
    return 'invalid'
  }
  const n = Number(trimmed)
  return Number.isSafeInteger(n) && n >= 0 ? n : 'invalid'
}

export function maxDaysFieldError(parsed: MaxDaysParse): string | null {
  if (parsed === 'decimal') return 'Use a whole number of days (no decimals).'
  if (parsed === 'invalid') return 'Enter a valid number of days or leave the field empty.'
  return null
}

type FormSlice = {
  code: string
  name: string
  description: string
  isPaid: boolean
  isActive: boolean
  maxAllowedDays: string
}

export function buildLeaveTypeCreateBody(form: FormSlice): CreateLeaveTypeBody | null {
  const code = form.code.trim().toUpperCase()
  const name = form.name.trim()
  if (!code || !name) return null
  const maxAllowedDays = parseLeaveTypeMaxDays(form.maxAllowedDays)
  if (maxAllowedDays === 'invalid' || maxAllowedDays === 'decimal') return null

  const body: CreateLeaveTypeBody = {
    code,
    name,
    isPaid: form.isPaid,
    isActive: form.isActive,
  }
  const description = form.description.trim()
  if (description) body.description = description
  if (maxAllowedDays !== null) body.maxAllowedDays = maxAllowedDays
  return body
}

export function buildLeaveTypeUpdateBody(form: FormSlice): UpdateLeaveTypeBody | null {
  const name = form.name.trim()
  if (!name) return null
  const maxAllowedDays = parseLeaveTypeMaxDays(form.maxAllowedDays)
  if (maxAllowedDays === 'invalid' || maxAllowedDays === 'decimal') return null

  const body: UpdateLeaveTypeBody = {
    name,
    isPaid: form.isPaid,
    isActive: form.isActive,
  }
  const description = form.description.trim()
  if (description) body.description = description
  if (maxAllowedDays !== null) body.maxAllowedDays = maxAllowedDays
  return body
}