/**
 * POST /leave-policies/accrual and /carry-forward bodies (strict server schemas).
 */

import type {
  BackendAccrualFrequency,
  CreateAccrualPolicyBody,
  CreateCarryForwardPolicyBody,
} from '../api/leaveApi.types'

export type DecimalParse = number | null | 'invalid'

export function parsePolicyDecimal(raw: string): DecimalParse {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return 'invalid'
  const n = Number(trimmed)
  return Number.isFinite(n) && n >= 0 ? n : 'invalid'
}

export function parsePolicyWholeDays(raw: string): DecimalParse {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (!/^\d+$/.test(trimmed)) return 'invalid'
  const n = Number(trimmed)
  return Number.isSafeInteger(n) && n >= 0 ? n : 'invalid'
}

export function parsePositiveWholeDays(raw: string): number | 'invalid' | 'empty' {
  const trimmed = raw.trim()
  if (!trimmed) return 'empty'
  if (!/^\d+$/.test(trimmed)) return 'invalid'
  const n = Number(trimmed)
  return Number.isSafeInteger(n) && n >= 1 ? n : 'invalid'
}

export function parsePolicyYear(raw: string): number | 'invalid' | 'empty' {
  const trimmed = raw.trim()
  if (!trimmed) return 'empty'
  if (!/^\d{4}$/.test(trimmed)) return 'invalid'
  const n = Number(trimmed)
  return n >= 2000 && n <= 2100 ? n : 'invalid'
}

export type AccrualPolicyForm = {
  leaveTypeId: string
  frequency: BackendAccrualFrequency
  accrualAmount: string
  annualAllocationLimit: string
  maxAccumulatedBalance: string
  effectiveFrom: string
  effectiveTo: string
  isActive: boolean
}

export type CarryForwardPolicyForm = {
  leaveTypeId: string
  enabled: boolean
  maxCarryForwardDays: string
  expiryMonths: string
  expiryNever: boolean
  effectiveYear: string
  isActive: boolean
}

export function buildAccrualPolicyCreateBody(form: AccrualPolicyForm): CreateAccrualPolicyBody | null {
  if (!form.leaveTypeId.trim()) return null
  const amount = parsePolicyDecimal(form.accrualAmount)
  if (amount === 'invalid' || amount === null) return null
  if (!form.effectiveFrom.trim()) return null

  const body: CreateAccrualPolicyBody = {
    leaveTypeId: form.leaveTypeId,
    frequency: form.frequency,
    accrualAmount: amount,
    effectiveFrom: form.effectiveFrom,
    isActive: form.isActive,
  }

  const effectiveTo = form.effectiveTo.trim()
  if (effectiveTo) body.effectiveTo = effectiveTo

  const annual = parsePolicyDecimal(form.annualAllocationLimit)
  if (annual === 'invalid') return null
  if (annual !== null) body.annualAllocationLimit = annual

  const maxBal = parsePolicyDecimal(form.maxAccumulatedBalance)
  if (maxBal === 'invalid') return null
  if (maxBal !== null) body.maxAccumulatedBalance = maxBal

  return body
}

export function buildCarryForwardPolicyCreateBody(form: CarryForwardPolicyForm): CreateCarryForwardPolicyBody | null {
  if (!form.leaveTypeId.trim()) return null
  const maxDays = parsePositiveWholeDays(form.maxCarryForwardDays)
  if (maxDays === 'invalid' || maxDays === 'empty') return null
  const year = parsePolicyYear(form.effectiveYear)
  if (year === 'invalid' || year === 'empty') return null

  const body: CreateCarryForwardPolicyBody = {
    leaveTypeId: form.leaveTypeId,
    enabled: form.enabled,
    maxCarryForwardDays: maxDays,
    effectiveYear: year,
    isActive: form.isActive,
  }

  // Live strict schema: omit expiryMonths when there is no expiry (null is rejected).
  if (!form.expiryNever) {
    const months = parsePolicyWholeDays(form.expiryMonths)
    if (months === 'invalid') return null
    if (months !== null) body.expiryMonths = months
  }

  return body
}