import type { ApprovalLevel, LeaveStep, LeaveStepKind } from '../types/leaveRequest'
import type {
  ApiApprovalHistoryItem,
  LeaveApprovalHistoryData,
} from '../types/api/leaveApprovalHistory.types'

function mapStepKind(raw?: string): LeaveStepKind {
  const key = (raw ?? '').trim().toUpperCase().replace(/\s+/g, '_')
  if (key.includes('REJECT')) return 'rejection'
  if (key.includes('CANCEL')) return 'cancellation'
  if (key.includes('ESCAL')) return 'escalation'
  if (key.includes('DELEG')) return 'delegation'
  if (key.includes('APPLY') || key.includes('SUBMIT')) return 'applied'
  if (key.includes('APPROV')) return 'approval'
  return 'approval'
}

function resolveLevel(raw?: string): ApprovalLevel | undefined {
  if (!raw) return undefined
  const key = raw.toUpperCase()
  if (key.includes('HR')) return 'HR'
  if (key.includes('MANAGER')) return 'Manager'
  return undefined
}

function resolveActorName(item: ApiApprovalHistoryItem): string {
  const approver = item.approver
  if (approver?.fullName?.trim()) return approver.fullName.trim()
  const parts = [approver?.name].filter(Boolean).join(' ').trim()
  if (parts) return parts
  return (
    item.actorName?.trim() ||
    item.approverName?.trim() ||
    item.actorId?.trim() ||
    'Approver'
  )
}

function resolveAt(item: ApiApprovalHistoryItem, index: number): string {
  const raw = item.at ?? item.actedAt ?? item.createdAt
  if (raw) return raw.slice(0, 10)
  return new Date(Date.now() - index * 86_400_000).toISOString().slice(0, 10)
}

export function mapApiApprovalHistoryItemToStep(
  item: ApiApprovalHistoryItem,
  index: number,
  leaveRequestId: string,
): LeaveStep {
  const kind = mapStepKind(item.kind ?? item.action ?? item.status ?? item.step)
  const id = item.id?.trim() || `history-${leaveRequestId}-${index}`
  return {
    id,
    kind,
    at: resolveAt(item, index),
    actorId: item.actorId ?? item.approver?.id ?? '',
    actorName: resolveActorName(item),
    level: resolveLevel(item.level ?? item.approvalLevel),
    comment: item.comment?.trim() || item.remarks?.trim() || undefined,
  }
}

export function mapApiApprovalHistoryToSteps(
  data: LeaveApprovalHistoryData,
  leaveRequestId: string,
): LeaveStep[] {
  return data.items.map((item, index) =>
    mapApiApprovalHistoryItemToStep(item, index, leaveRequestId),
  )
}