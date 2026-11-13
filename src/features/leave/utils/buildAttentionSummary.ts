/**
 * Single source of truth for HR Overview attention counts and copy.
 */

import type { LucideIcon } from 'lucide-react'
import { BadgeIndianRupee, CalendarClock, Sun, Wallet } from 'lucide-react'

import type { LeaveSnapshot } from '../services/leaveService'
import type { HrOverviewNavigateOpts } from '../context/hrOverviewNavigate'
import { LOW_BALANCE_THRESHOLD_DAYS, LOW_BALANCE_TYPE_CODES, lowBalanceAttentionSentence } from '../constants/hrOverviewConstants'
import type { LeaveRequest } from '../types/leaveRequest'
import { activeEmployees } from './employmentStatus'
import { addDays } from './leaveDates'
import { leaveTodayIso } from './leaveToday'
import { isHrActionRequest, isOverdueRequest, requestHasCoverageWarning, sortHrActionRequests, waitingDaysForRequest } from './attentionHrQueue'
import { ledgerBalanceForType, pendingDaysForType } from './calculateBalance'
import { isYearEndDue } from './yearEndDue'

export type AttentionSeverity = 'danger' | 'warning' | 'success'

export type AttentionWaitingRow = {
  request: LeaveRequest
  employeeName: string
  department: string
  waitingDays: number
  overdue: boolean
  escalated: boolean
  coverageWarning: boolean
}

export type AttentionOtherItem = {
  key: string
  count: number
  sentence: string
  urgency: 'warning' | 'info'
  tab: 'Requests' | 'Balances' | 'Accruals & Year-End'
  opts?: HrOverviewNavigateOpts
  icon: LucideIcon
  actionLabel?: string
}

export type AttentionSummary = {
  severity: AttentionSeverity
  waitingCount: number
  overdueCount: number
  oldestWaitingDays: number
  waitingRows: AttentionWaitingRow[]
  otherItems: AttentionOtherItem[]
  otherCategoryCount: number
  bannerItemCount: number
  summarySentence: string
  headline: string
}

export function buildAttentionSummary(snapshot: LeaveSnapshot): AttentionSummary {
  const today = leaveTodayIso()
  const queue = sortHrActionRequests(snapshot.requests.filter((row) => isHrActionRequest(snapshot, row)), snapshot)
  const waitingRows: AttentionWaitingRow[] = queue.map((request) => {
    const emp = snapshot.employees.find((item) => item.id === request.employeeId)
    return {
      request,
      employeeName: emp?.name ?? request.employeeId,
      department: emp?.department ?? '—',
      waitingDays: waitingDaysForRequest(request.appliedOn, today),
      overdue: isOverdueRequest(snapshot, request, today),
      escalated: request.escalated,
      coverageWarning: requestHasCoverageWarning(snapshot, request),
    }
  })
  const overdueCount = waitingRows.filter((row) => row.overdue).length
  const oldestWaitingDays = waitingRows.reduce((max, row) => Math.max(max, row.waitingDays), 0)
  const otherItems = buildOtherItems(snapshot)
  const hasWaiting = waitingRows.length > 0
  const hasOther = otherItems.length > 0
  const severity: AttentionSeverity = overdueCount > 0 ? 'danger' : hasWaiting || hasOther ? 'warning' : 'success'
  const bannerItemCount = (hasWaiting ? 1 : 0) + otherItems.length
  return {
    severity,
    waitingCount: waitingRows.length,
    overdueCount,
    oldestWaitingDays,
    waitingRows,
    otherItems,
    otherCategoryCount: otherItems.length,
    bannerItemCount,
    summarySentence: buildSummarySentence(waitingRows.length, overdueCount, otherItems.length, severity),
    headline: severity === 'success' ? "You're all caught up" : `${bannerItemCount} items need your attention`,
  }
}

function lowBalanceCount(snapshot: LeaveSnapshot): number {
  let count = 0
  for (const emp of activeEmployees(snapshot.employees)) {
    const low = LOW_BALANCE_TYPE_CODES.some((code) => {
      const bal = ledgerBalanceForType(snapshot.ledger, emp.id, code) - pendingDaysForType(snapshot.requests, emp.id, code)
      return bal < LOW_BALANCE_THRESHOLD_DAYS
    })
    if (low) count += 1
  }
  return count
}

function buildOtherItems(snapshot: LeaveSnapshot): AttentionOtherItem[] {
  const items: AttentionOtherItem[] = []
  const enc = snapshot.encashments.filter((item) => item.status === 'Pending approval' || item.status === 'Pending payout').length
  if (enc > 0) {
    items.push({ key: 'enc', count: enc, sentence: 'Encashment requests need a decision.', urgency: 'info', tab: 'Requests', opts: { segment: 'encashment' }, icon: BadgeIndianRupee })
  }
  const coLimit = addDays(leaveTodayIso(), 14)
  const co = snapshot.compOffLots.filter((lot) => lot.status === 'Available' && lot.expiresOn <= coLimit).length
  if (co > 0) {
    items.push({ key: 'co', count: co, sentence: 'Comp-off lots expire within 14 days.', urgency: 'info', tab: 'Requests', opts: { segment: 'compoff' }, icon: Sun })
  }
  const bal = lowBalanceCount(snapshot)
  if (bal > 0) {
    items.push({ key: 'bal', count: bal, sentence: lowBalanceAttentionSentence(), urgency: 'info', tab: 'Balances', icon: Wallet })
  }
  if (!snapshot.accrualRuns.includes(leaveTodayIso().slice(0, 7))) {
    items.push({ key: 'acc', count: 1, sentence: "This month's accrual has not been run.", urgency: 'warning', tab: 'Accruals & Year-End', opts: { accrualConfirm: true }, icon: CalendarClock, actionLabel: 'Run accrual' })
  }
  if (isYearEndDue(snapshot.settings)) {
    items.push({ key: 'ye', count: 1, sentence: 'Year-end is within the last 30 days of the leave year.', urgency: 'info', tab: 'Accruals & Year-End', icon: CalendarClock })
  }
  return items
}

function buildSummarySentence(waiting: number, overdue: number, other: number, severity: AttentionSeverity): string {
  if (severity === 'success') return 'Nothing needs your action right now.'
  let text = ''
  if (waiting > 0) {
    text = `${waiting} leave request${waiting === 1 ? '' : 's'} are waiting for you`
    if (overdue > 0) text += ` and ${overdue} ${overdue === 1 ? 'is' : 'are'} overdue`
    text += '.'
  }
  if (other > 0) text += `${text ? ' ' : ''}${other} other item${other === 1 ? '' : 's'} need a look.`
  return text.trim()
}
