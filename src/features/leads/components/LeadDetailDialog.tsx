/**
 * Lead detail with notes, status/priority controls, and assignment.
 */

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { EMPLOYEE_MAX_TAKE, useListEmployeesQuery } from '@/features/employees/api/employeesApi'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { getApiErrorMessage } from '@/services/api/errors'
import { cn } from '@/lib/utils'

import { LEAD_PRIORITIES, LEAD_STATUSES } from '../constants/leadOptions'
import { useLeads } from '../hooks/useLeads'
import type { Lead, LeadPriority, LeadStatus } from '../types/lead'
import { formatLeadDate } from '../utils/formatLeadDate'
import { leadCompanyLabel } from '../utils/leadDisplay'
import { LeadPriorityPill } from './LeadPriorityPill'
import { LeadStatusPill } from './LeadStatusPill'
import {
  LEADS_DIALOG_HEADER_BAND,
  LEADS_DIALOG_SHELL,
  LEADS_DIALOG_TAB_ACTIVE,
  LEADS_DIALOG_TAB_IDLE,
} from './shared/leadsUi'
import {
  PayrollDialogBody,
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogFooter,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '@/features/payroll/components/shared/PayrollDialog'

type LeadDetailDialogProps = {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  canEdit?: boolean
  canDelete?: boolean
}

const DETAIL_TABS = ['Details', 'Notes', 'Attachments'] as const
type DetailTab = (typeof DETAIL_TABS)[number]

const selectClass =
  'h-9 rounded-lg border border-hrms-border bg-white px-2 text-sm text-hrms-navy'

export function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: LeadDetailDialogProps) {
  const {
    addNote,
    updateLeadStatus,
    updateLeadPriority,
    assignLead,
    getLeadDetail,
  } = useLeads()
  const { canAccess } = useOptionalFeatureAccess()
  const canAddNotes = canAccess('leads.notes')
  const canAssignLeads = canAccess('leads.assign')
  const { user } = useAuthenticatedUser()
  const canListEmployees = Boolean(user?.permissions?.includes('employees:read'))

  const [tab, setTab] = useState<DetailTab>('Details')
  const [noteText, setNoteText] = useState('')
  const [detail, setDetail] = useState<Lead | null>(lead)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: employeesPage } = useListEmployeesQuery(
    { skip: 0, take: EMPLOYEE_MAX_TAKE },
    { skip: !open || !canAssignLeads || !canListEmployees },
  )

  const assignees = useMemo(() => {
    const rows = (employeesPage?.items ?? []).map((item) => ({
      id: item.server.id,
      name: `${item.profile.firstName} ${item.profile.lastName}`.trim() || item.server.employeeCode,
    }))
    if (user?.employeeId && !rows.some((row) => row.id === user.employeeId)) {
      rows.unshift({ id: user.employeeId, name: 'Me' })
    }
    if (
      detail?.assignedEmployeeId &&
      detail.assignedEmployeeName &&
      !rows.some((row) => row.id === detail.assignedEmployeeId)
    ) {
      rows.unshift({
        id: detail.assignedEmployeeId,
        name: detail.assignedEmployeeName,
      })
    }
    return rows
  }, [
    employeesPage?.items,
    user?.employeeId,
    detail?.assignedEmployeeId,
    detail?.assignedEmployeeName,
  ])

  useEffect(() => {
    setDetail(lead)
  }, [lead])

  useEffect(() => {
    if (!open || !lead?.id) return
    let cancelled = false
    void getLeadDetail(lead.id)
      .then((fresh) => {
        if (!cancelled) setDetail(fresh)
      })
      .catch(() => {
        /* keep list snapshot */
      })
    return () => {
      cancelled = true
    }
  }, [open, lead?.id, getLeadDetail])

  if (!detail) return null

  async function saveNote() {
    if (!noteText.trim()) return
    setBusy(true)
    setError(null)
    try {
      const saved = await addNote(detail!.id, noteText.trim())
      setDetail(saved)
      setNoteText('')
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Failed to add note'))
    } finally {
      setBusy(false)
    }
  }

  async function onStatusChange(status: LeadStatus) {
    if (!canEdit || status === detail!.status) return
    setBusy(true)
    setError(null)
    try {
      setDetail(await updateLeadStatus(detail!.id, status))
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Failed to update status'))
    } finally {
      setBusy(false)
    }
  }

  async function onPriorityChange(priority: LeadPriority) {
    if (!canEdit || priority === detail!.priority) return
    setBusy(true)
    setError(null)
    try {
      setDetail(await updateLeadPriority(detail!.id, priority))
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Failed to update priority'))
    } finally {
      setBusy(false)
    }
  }

  async function onAssignChange(employeeId: string) {
    if (!canAssignLeads || !employeeId || employeeId === detail!.assignedEmployeeId) return
    setBusy(true)
    setError(null)
    try {
      setDetail(await assignLead(detail!.id, employeeId))
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Failed to assign lead'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="md"
          className={cn('flex max-h-[min(90vh,720px)] flex-col p-0', LEADS_DIALOG_SHELL)}
        >
          <div className={LEADS_DIALOG_HEADER_BAND}>
            <PayrollDialogHeader
              title={leadCompanyLabel(detail)}
              description={detail.id}
            >
              <div className="mt-2 flex flex-wrap gap-2">
                <LeadStatusPill status={detail.status} />
                <LeadPriorityPill priority={detail.priority} />
              </div>
            </PayrollDialogHeader>
          </div>
          <div className="flex shrink-0 gap-2 border-b border-hrms-border bg-white px-6 py-3">
            {DETAIL_TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={tab === item ? LEADS_DIALOG_TAB_ACTIVE : LEADS_DIALOG_TAB_IDLE}
              >
                {item}
              </button>
            ))}
          </div>
          <PayrollDialogBody className="space-y-4 text-sm">
            {error ? <p className="text-sm text-hrms-danger">{error}</p> : null}
            {tab === 'Details' ? (
              <div className="space-y-4">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <DetailField label="Email" value={detail.email} />
                  <DetailField label="Phone" value={detail.phone} />
                  <DetailField label="Source" value={detail.source || '—'} />
                  <DetailField label="Category" value={detail.category || '—'} />
                  <DetailField
                    label="Estimated value"
                    value={detail.estimatedValue ?? '—'}
                  />
                  <DetailField
                    label="Owner"
                    value={detail.assignedEmployeeName ?? 'Unassigned'}
                  />
                  <DetailField
                    label="Assigned by"
                    value={
                      detail.assignedByEmployeeName ??
                      detail.createdByEmployeeName ??
                      '—'
                    }
                  />
                  <DetailField label="Updated" value={formatLeadDate(detail.updatedAt)} />
                </dl>
                {(canEdit || canAssignLeads) && (
                  <div className="grid gap-3 rounded-xl border border-hrms-border p-3 sm:grid-cols-3">
                    {canEdit ? (
                      <>
                        <label className="space-y-1 text-xs text-hrms-text-muted">
                          Status
                          <select
                            className={cn(selectClass, 'mt-1 w-full')}
                            value={detail.status}
                            disabled={busy}
                            onChange={(e) => void onStatusChange(e.target.value as LeadStatus)}
                          >
                            {LEAD_STATUSES.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1 text-xs text-hrms-text-muted">
                          Priority
                          <select
                            className={cn(selectClass, 'mt-1 w-full')}
                            value={detail.priority}
                            disabled={busy}
                            onChange={(e) =>
                              void onPriorityChange(e.target.value as LeadPriority)
                            }
                          >
                            {LEAD_PRIORITIES.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </label>
                      </>
                    ) : null}
                    {canAssignLeads ? (
                      <label className="space-y-1 text-xs text-hrms-text-muted">
                        Assign to
                        <select
                          className={cn(selectClass, 'mt-1 w-full')}
                          value={detail.assignedEmployeeId ?? ''}
                          disabled={busy}
                          onChange={(e) => void onAssignChange(e.target.value)}
                        >
                          <option value="">Select employee</option>
                          {assignees.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
            {tab === 'Notes' ? (
              <div className="space-y-3">
                {canAddNotes ? (
                  <div className="flex gap-2">
                    <Input
                      value={noteText}
                      placeholder="Add a note or remark…"
                      onChange={(e) => setNoteText(e.target.value)}
                      disabled={busy}
                    />
                    <Button type="button" disabled={busy} onClick={() => void saveNote()}>
                      Add
                    </Button>
                  </div>
                ) : null}
                <ul className="space-y-2">
                  {detail.notes.length === 0 ? (
                    <li className="text-hrms-text-muted">No notes yet.</li>
                  ) : (
                    detail.notes.map((note) => (
                      <li key={note.id} className="rounded-lg border border-hrms-border p-3">
                        <p className="text-hrms-navy">{note.text}</p>
                        <p className="mt-1 text-xs text-hrms-text-muted">
                          {note.authorName} · {formatLeadDate(note.createdAt)}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : null}
            {tab === 'Attachments' ? (
              <ul className="space-y-2">
                {detail.attachments.length === 0 ? (
                  <li className="text-hrms-text-muted">No attachment URL on this lead.</li>
                ) : (
                  detail.attachments.map((file) => (
                    <li
                      key={file.id}
                      className="flex justify-between rounded-lg border border-hrms-border px-3 py-2"
                    >
                      <a
                        href={file.fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-hrms-primary underline"
                      >
                        {file.fileName}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </PayrollDialogBody>
          <PayrollDialogFooter>
            {canEdit || canDelete ? (
              <div className="flex flex-wrap justify-between gap-2">
                {canDelete ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-hrms-danger"
                    onClick={onDelete}
                  >
                    Delete lead
                  </Button>
                ) : (
                  <span />
                )}
                {canEdit ? (
                  <Button type="button" onClick={onEdit}>
                    Edit lead
                  </Button>
                ) : null}
              </div>
            ) : null}
          </PayrollDialogFooter>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-hrms-text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-hrms-navy">{value}</dd>
    </div>
  )
}
