/**
 * Create / edit lead against the live leads API contracts.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { EMPLOYEE_MAX_TAKE, useListEmployeesQuery } from '@/features/employees/api/employeesApi'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { getApiErrorMessage } from '@/services/api/errors'
import { cn } from '@/lib/utils'

import { useListLeadCategoriesQuery } from '../api/leadCategoriesApi'
import { useListLeadSourcesQuery } from '../api/leadSourcesApi'
import { LEAD_PRIORITIES, LEAD_STATUSES } from '../constants/leadOptions'
import { useLeads } from '../hooks/useLeads'
import type { Lead, LeadInput } from '../types/lead'
import { emptyLeadInput, leadToInput } from '../utils/leadForm'
import {
  LEADS_DIALOG_HEADER_BAND,
  LEADS_DIALOG_SHELL,
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

type LeadFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initial?: Lead | null
  onSaved: (lead: Lead) => void
  defaultAssigneeId?: string
}

const selectClass =
  'mt-1 h-10 w-full rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus'

export function LeadFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  onSaved,
  defaultAssigneeId,
}: LeadFormDialogProps) {
  const { createLead, updateLead, checkDuplicates } = useLeads()
  const { canAccess } = useOptionalFeatureAccess()
  const { user } = useAuthenticatedUser()
  const canAssign = canAccess('leads.assign')
  const canListEmployees = Boolean(user?.permissions?.includes('employees:read'))

  const { data: sourcesPage } = useListLeadSourcesQuery({ isActive: true }, { skip: !open })
  const { data: categoriesPage } = useListLeadCategoriesQuery({ isActive: true }, { skip: !open })
  const { data: employeesPage } = useListEmployeesQuery(
    { skip: 0, take: EMPLOYEE_MAX_TAKE },
    { skip: !open || !canAssign || !canListEmployees },
  )

  const sources = sourcesPage?.items ?? []
  const categories = categoriesPage?.items ?? []
  const assignees = useMemo(() => {
    const rows = (employeesPage?.items ?? []).map((item) => ({
      id: item.server.id,
      name: `${item.profile.firstName} ${item.profile.lastName}`.trim() || item.server.employeeCode,
    }))
    if (user?.employeeId && !rows.some((row) => row.id === user.employeeId)) {
      rows.unshift({ id: user.employeeId, name: 'Me' })
    }
    return rows
  }, [employeesPage?.items, user?.employeeId])

  const [draft, setDraft] = useState<LeadInput>(emptyLeadInput())
  const [dupWarning, setDupWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(
        initial
          ? leadToInput(initial)
          : {
              ...emptyLeadInput(),
              assignedEmployeeId: defaultAssigneeId ?? user?.employeeId ?? null,
            },
      )
      setDupWarning(null)
      setError(null)
    }
  }, [open, initial, defaultAssigneeId, user?.employeeId])

  useEffect(() => {
    if (!open) return
    const handle = window.setTimeout(async () => {
      if (!draft.email.trim() && !draft.phone.trim()) {
        setDupWarning(null)
        return
      }
      try {
        const matches = await checkDuplicates(
          {
            email: draft.email,
            phone: draft.phone,
            companyName: draft.companyName,
          },
          initial?.id,
        )
        if (matches.length) {
          setDupWarning(
            `Possible duplicate: ${matches
              .map((m) => `${m.lead.leadName} (${m.reasons.join(', ') || 'match'})`)
              .join('; ')}`,
          )
        } else {
          setDupWarning(null)
        }
      } catch {
        setDupWarning(null)
      }
    }, 400)
    return () => window.clearTimeout(handle)
  }, [open, draft.email, draft.phone, draft.companyName, checkDuplicates, initial?.id])

  function patch<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit() {
    if (!draft.leadName.trim() || !draft.email.trim() || !draft.phone.trim()) {
      setError('Full name, email, and phone are required.')
      return
    }
    if (!draft.sourceId.trim()) {
      setError('Lead source is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload: LeadInput = canAssign
        ? draft
        : { ...draft, assignedEmployeeId: initial?.assignedEmployeeId ?? null }
      const saved =
        mode === 'edit' && initial
          ? await updateLead(initial.id, payload)
          : await createLead(payload)
      onSaved(saved)
      onOpenChange(false)
    } catch (cause) {
      setError(getApiErrorMessage(cause, cause instanceof Error ? cause.message : 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="md"
          className={cn('flex max-h-[min(90vh,760px)] flex-col p-0', LEADS_DIALOG_SHELL)}
        >
          <div className={LEADS_DIALOG_HEADER_BAND}>
            <PayrollDialogHeader
              title={mode === 'create' ? 'Create lead' : `Edit lead — ${initial?.id ?? ''}`}
              description="Contact details, source, and priority. Status and assignment use dedicated API actions."
            />
          </div>
          <PayrollDialogBody className="space-y-4">
            {dupWarning ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {dupWarning}
              </p>
            ) : null}
            {error ? <p className="text-sm text-hrms-danger">{error}</p> : null}
            <Field label="Full name" id="lead-name">
              <Input
                id="lead-name"
                value={draft.leadName}
                onChange={(e) => patch('leadName', e.target.value)}
              />
            </Field>
            <Field label="Company name" id="company-name">
              <Input
                id="company-name"
                value={draft.companyName}
                onChange={(e) => patch('companyName', e.target.value)}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" id="email">
                <Input
                  id="email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => patch('email', e.target.value)}
                />
              </Field>
              <Field label="Phone" id="phone">
                <Input
                  id="phone"
                  value={draft.phone}
                  onChange={(e) => patch('phone', e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Source"
                value={draft.sourceId}
                onChange={(v) => {
                  const match = sources.find((item) => item.id === v)
                  patch('sourceId', v)
                  patch('source', match?.name ?? '')
                }}
              >
                <option value="">
                  {sources.length === 0 ? 'No sources — use Add source first' : 'Select source'}
                </option>
                {sources.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Category"
                value={draft.categoryId ?? ''}
                onChange={(v) => {
                  const match = categories.find((item) => item.id === v)
                  patch('categoryId', v || null)
                  patch('category', match?.name ?? '')
                }}
              >
                <option value="">None</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Priority"
                value={draft.priority}
                onChange={(v) => patch('priority', v as LeadInput['priority'])}
              >
                {LEAD_PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
              {mode === 'edit' ? (
                <SelectField
                  label="Status"
                  value={draft.status}
                  onChange={(v) => patch('status', v as LeadInput['status'])}
                >
                  {LEAD_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </SelectField>
              ) : null}
              <Field label="Estimated value" id="estimated-value">
                <Input
                  id="estimated-value"
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.estimatedValue ?? ''}
                  onChange={(e) => patch('estimatedValue', e.target.value || null)}
                />
              </Field>
              <Field label="Attachment URL" id="attachment-url">
                <Input
                  id="attachment-url"
                  value={draft.attachmentUrl ?? ''}
                  onChange={(e) => patch('attachmentUrl', e.target.value || null)}
                  placeholder="https://…"
                />
              </Field>
            </div>
            {canAssign ? (
              <Field label="Assigned to" id="assignee">
                <select
                  id="assignee"
                  className={selectClass}
                  value={draft.assignedEmployeeId ?? ''}
                  onChange={(e) => patch('assignedEmployeeId', e.target.value || null)}
                >
                  <option value="">
                    {mode === 'create' ? 'Assign to me (default)' : 'Keep current owner'}
                  </option>
                  {assignees.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            {mode === 'create' ? (
              <Field label="Remarks" id="description">
                <textarea
                  id="description"
                  rows={3}
                  className={`${selectClass} h-auto py-2`}
                  value={draft.description}
                  onChange={(e) => patch('description', e.target.value)}
                />
              </Field>
            ) : null}
          </PayrollDialogBody>
          <PayrollDialogFooter>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={saving} onClick={() => void handleSubmit()}>
                {mode === 'create' ? 'Create lead' : 'Save changes'}
              </Button>
            </div>
          </PayrollDialogFooter>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}

function Field({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  const id = `select-${label.replace(/\s/g, '-').toLowerCase()}`
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  )
}
