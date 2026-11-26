import type { CreateEncashmentBody } from '../api/leaveApi.types'
import { parsePolicyYear, parsePositiveWholeDays } from './buildLeavePolicyApiBody'

export type EncashmentRequestForm = {
  leaveTypeId: string
  days: string
  year: string
  reason: string
}

export function buildCreateEncashmentBody(
  employeeId: string,
  form: EncashmentRequestForm,
): CreateEncashmentBody | null {
  if (!employeeId.trim() || !form.leaveTypeId.trim()) return null
  const days = parsePositiveWholeDays(form.days)
  if (days === 'invalid' || days === 'empty') return null
  const body: CreateEncashmentBody = {
    employeeId: employeeId.trim(),
    leaveTypeId: form.leaveTypeId,
    days,
  }
  const year = parsePolicyYear(form.year)
  if (year !== 'empty' && year !== 'invalid') body.year = year
  const reason = form.reason.trim()
  if (reason) body.reason = reason
  return body
}