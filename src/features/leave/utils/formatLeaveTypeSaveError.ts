/**
 * Maps live /leave-types validation errors into short user-facing copy.
 */

import { getApiErrorMessage } from '@/services/api/errors'

const FALLBACK = 'Could not save the leave type. Check Code, Name, and Max days, then try again.'

function linesFromMessages(messages: string[]): string[] {
  const lines: string[] = []
  const blob = messages.join(' ').toLowerCase()

  if (blob.includes('maxalloweddays') && blob.includes('int')) {
    lines.push('Max days per request must be a whole number (for example 1 or 5), or leave the field empty.')
  }
  if (blob.includes('requiresapproval') || blob.includes('unrecognized key')) {
    lines.push('Approval rules are managed by the server and cannot be set from this screen.')
  }
  if (blob.includes('description') && blob.includes('null')) {
    lines.push('Description must be text or left empty.')
  }
  if (blob.includes('code') && (blob.includes('unique') || blob.includes('already'))) {
    lines.push('That code is already in use. Choose a different code.')
  }

  return lines
}

export function formatLeaveTypeSaveError(error: unknown): string {
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