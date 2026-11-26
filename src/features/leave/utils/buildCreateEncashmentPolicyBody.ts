import type { CreateEncashmentPolicyBody } from '../api/leaveApi.types'
import { parsePolicyDecimal, parsePolicyWholeDays } from './buildLeavePolicyApiBody'

export type EncashmentPolicyForm = {
  leaveTypeId: string
  ratePerDay: string
  currency: string
  minDays: string
  maxDaysPerRequest: string
  maxDaysPerYear: string
  effectiveFrom: string
  effectiveTo: string
  isActive: boolean
}

export function buildCreateEncashmentPolicyBody(form: EncashmentPolicyForm): CreateEncashmentPolicyBody | null {
  if (!form.leaveTypeId.trim() || !form.effectiveFrom.trim()) return null
  const rate = parsePolicyDecimal(form.ratePerDay)
  if (rate === 'invalid' || rate === null) return null
  const minDays = parsePolicyWholeDays(form.minDays)
  if (minDays === 'invalid' || minDays === null) return null
  const maxRequest = parsePolicyWholeDays(form.maxDaysPerRequest)
  if (maxRequest === 'invalid' || maxRequest === null || maxRequest < 1) return null
  const currency = form.currency.trim().toUpperCase()
  if (!currency) return null

  const body: CreateEncashmentPolicyBody = {
    leaveTypeId: form.leaveTypeId,
    ratePerDay: rate,
    currency,
    minDays,
    maxDaysPerRequest: maxRequest,
    effectiveFrom: form.effectiveFrom.trim(),
    isActive: form.isActive,
  }

  const maxYear = parsePolicyWholeDays(form.maxDaysPerYear)
  if (maxYear !== 'invalid' && maxYear !== null) body.maxDaysPerYear = maxYear

  const to = form.effectiveTo.trim()
  if (to) body.effectiveTo = to

  return body
}