/**
 * Create / edit lead with full field list and duplicate warning.
 */

import { useEffect, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  COMPANY_SIZES,
  LEAD_ASSIGNEES,
  LEAD_CATEGORIES,
  LEAD_INDUSTRIES,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
} from '../constants/leadOptions'
import { useLeads } from '../hooks/useLeads'
import type { Lead, LeadInput } from '../types/lead'
import { emptyLeadInput } from '../utils/leadForm'
import { cn } from '@/lib/utils'

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
  const [draft, setDraft] = useState<LeadInput>(emptyLeadInput())
  const [dupWarning, setDupWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(
        initial
          ? leadFormFromLead(initial)
          : {
              ...emptyLeadInput(),
              assignedEmployeeId: defaultAssigneeId ?? null,
            },
      )
      setDupWarning(null)
      setError(null)
    }
  }, [open, initial, defaultAssigneeId])

  useEffect(() => {
    if (!open) return
    const handle = window.setTimeout(async () => {
      if (!draft.email && !draft.phone && !draft.companyName) {
        setDupWarning(null)
        return
      }
      const matches = await checkDuplicates(
        {
          email: draft.email,
          phone: draft.phone,
          companyName: draft.companyName,
        } as Lead,
        initial?.id,
      )
      if (matches.length) {
        setDupWarning(
          `Possible duplicate: ${matches.map((m) => `${m.lead.id} (${m.reasons.join(', ')})`).join('; ')}`,
        )
      } else {
        setDupWarning(null)
      }
    }, 400)
    return () => window.clearTimeout(handle)
  }, [open, draft.email, draft.phone, draft.companyName, checkDuplicates, initial?.id])

  function patch<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit() {
    if (!draft.leadName.trim() || !draft.companyName.trim() || !draft.email.trim()) {
      setError('Lead name, company, and email are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const saved =
        mode === 'edit' && initial
          ? await updateLead(initial.id, draft)
          : await createLead(draft)
      onSaved(saved)
      onOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Save failed')
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
              description="Company defaults apply; each lead gets an auto-generated ID on save."
            />
          </div>
          <PayrollDialogBody className="space-y-4">
            {dupWarning ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {dupWarning}
              </p>
            ) : null}
            {error ? <p className="text-sm text-hrms-danger">{error}</p> : null}
            <Field label="Lead name" id="lead-name">
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
              <Field label="Contact person" id="contact-person">
                <Input
                  id="contact-person"
                  value={draft.contactPerson}
                  onChange={(e) => patch('contactPerson', e.target.value)}
                />
              </Field>
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
              <Field label="Website" id="website">
                <Input
                  id="website"
                  value={draft.website}
                  onChange={(e) => patch('website', e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField label="Industry" value={draft.industry} onChange={(v) => patch('industry', v)}>
                {LEAD_INDUSTRIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Company size"
                value={draft.companySize}
                onChange={(v) => patch('companySize', v)}
              >
                {COMPANY_SIZES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Source" value={draft.source} onChange={(v) => patch('source', v)}>
                {LEAD_SOURCES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Category" value={draft.category} onChange={(v) => patch('category', v)}>
                {LEAD_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Priority" value={draft.priority} onChange={(v) => patch('priority', v as LeadInput['priority'])}>
                {LEAD_PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Status" value={draft.status} onChange={(v) => patch('status', v as LeadInput['status'])}>
                {LEAD_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
            </div>
            <Field label="Assigned to" id="assignee">
              <select
                id="assignee"
                className={selectClass}
                value={draft.assignedEmployeeId ?? ''}
                onChange={(e) => patch('assignedEmployeeId', e.target.value || null)}
              >
                <option value="">Unassigned</option>
                {LEAD_ASSIGNEES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description" id="description">
              <textarea
                id="description"
                rows={3}
                className={`${selectClass} h-auto py-2`}
                value={draft.description}
                onChange={(e) => patch('description', e.target.value)}
              />
            </Field>
            <Field label="Requirements" id="requirements">
              <textarea
                id="requirements"
                rows={3}
                className={`${selectClass} h-auto py-2`}
                value={draft.requirements}
                onChange={(e) => patch('requirements', e.target.value)}
              />
            </Field>
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

function leadFormFromLead(lead: Lead): LeadInput {
  return {
    leadName: lead.leadName,
    companyName: lead.companyName,
    contactPerson: lead.contactPerson,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    industry: lead.industry,
    companySize: lead.companySize,
    source: lead.source,
    category: lead.category,
    priority: lead.priority,
    status: lead.status,
    assignedEmployeeId: lead.assignedEmployeeId,
    assignedEmployeeName: lead.assignedEmployeeName,
    description: lead.description,
    requirements: lead.requirements,
  }
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