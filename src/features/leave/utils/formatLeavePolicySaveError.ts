/**
 * Maps live /leave-policies validation errors into short user-facing copy.
 */

import { getApiErrorMessage } from '@/services/api/errors'

const FALLBACK = 'Could not save the policy. Check the highlighted fields and try again.'

function linesFromMessages(messages: string[]): string[] {
  const lines: string[] = []
  const blob = messages.join(' ').toLowerCase()

  if (blob.includes('leavetypeid')) {
    lines.push('Choose a leave type.')
  }
  if (blob.includes('accrualamount')) {
    lines.push('Accrual amount must be a valid number (0 or greater).')
  }
  if (blob.includes('effectivefrom') || blob.includes('effectiveto')) {
    lines.push('Effective dates must be valid calendar dates (YYYY-MM-DD).')
  }
  if (blob.includes('maxcarryforwarddays')) {
    lines.push('Max carry-forward days must be a whole number of at least 1.')
  }
  if (blob.includes('effectiveyear')) {
    lines.push('Effective year must be a four-digit year (e.g. 2026).')
  }
  if (blob.includes('expirymonths')) {
    lines.push('Expiry months must be a whole number or left as “never”.')
  }
  if (blob.includes('already') || blob.includes('duplicate') || blob.includes('unique')) {
    lines.push('A policy for this leave type and period may already exist.')
  }

  return lines
}

export function formatLeavePolicySaveError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const { status, data } = error as { status: unknown; data?: { message?: string | string[] } }
    if (status === 400 && data?.message) {
      const messages = Array.isArray(data.message) ? data.message : [data.message]
      const lines = linesFromMessages(messages.filter((m): m is string => typeof m === 'string'))
      if (lines.length) return lines.join(' ')
    }
  }
  const generic = getApiErrorMessage(error, FALLBACK)
  if (generic === FALLBACK || generic === 'Something went wrong. Please try again.') return FALLBACK
  return generic
}