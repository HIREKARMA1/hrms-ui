/**
 * Form state and validation helpers for ApiLeaveTypeDialog.
 */

import type { LeaveTypeOption } from '../../../api/leaveMappers'

export type ApiLeaveTypeDialogMode = 'create' | 'edit'

export type LeaveTypeFormState = {
  code: string
  name: string
  description: string
  isPaid: boolean
  isActive: boolean
  maxAllowedDays: string
}

export const LEAVE_TYPE_CODE_MAX_LEN = 12

export const EMPTY_LEAVE_TYPE_FORM: LeaveTypeFormState = {
  code: '',
  name: '',
  description: '',
  isPaid: true,
  isActive: true,
  maxAllowedDays: '',
}

export function normalizeLeaveTypeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9_]/g, '')
    .slice(0, LEAVE_TYPE_CODE_MAX_LEN)
}

export function leaveTypeFormFromOption(type: LeaveTypeOption): LeaveTypeFormState {
  return {
    code: type.code,
    name: type.name,
    description: type.description ?? '',
    isPaid: type.isPaid,
    isActive: type.isActive,
    maxAllowedDays: type.maxAllowedDays != null ? String(type.maxAllowedDays) : '',
  }
}

export function leaveTypeCodeError(code: string, mode: ApiLeaveTypeDialogMode): string | null {
  if (mode === 'edit') return null
  const trimmed = code.trim()
  if (!trimmed) return 'Code is required.'
  if (trimmed.length < 2) return 'Use at least 2 characters (e.g. CL).'
  if (trimmed.length > LEAVE_TYPE_CODE_MAX_LEN) return `Use at most ${LEAVE_TYPE_CODE_MAX_LEN} characters.`
  if (!/^[A-Z0-9_]+$/.test(trimmed)) return 'Only letters, numbers and underscore.'
  return null
}