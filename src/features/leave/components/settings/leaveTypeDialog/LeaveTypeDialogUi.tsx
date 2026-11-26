/**
 * Presentational blocks for the leave type create/edit dialog.
 */

import type { ComponentType, ReactNode } from 'react'
import { Banknote, ClipboardCheck, ToggleRight } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import type { LeaveTypeFormState } from './leaveTypeDialogForm'

export function LeaveTypePreviewStrip({ code, name }: { code: string; name: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-hrms-border bg-hrms-muted-bg/50 px-4 py-3">
      <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-hrms-primary px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-white">
        {code}
      </span>
      <span className="text-sm font-medium text-hrms-navy">{name}</span>
      <span className="ml-auto text-xs text-hrms-text-secondary">Preview</span>
    </div>
  )
}

export function LeaveTypeFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-hrms-text-secondary">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function LeaveTypePolicyCards({
  form,
  loading,
  onChange,
}: {
  form: LeaveTypeFormState
  loading?: boolean
  onChange: (patch: Partial<LeaveTypeFormState>) => void
}) {
  return (
    <div className="grid gap-3">
      <PolicyToggleCard
        icon={Banknote}
        label="Paid leave"
        description="Included in paid balance and payroll treatment."
        checked={form.isPaid}
        disabled={loading}
        onCheckedChange={(isPaid) => onChange({ isPaid })}
      />
      <PolicyToggleCard
        icon={ToggleRight}
        label="Active"
        description="Inactive types stay in the catalog but cannot be selected on new requests."
        checked={form.isActive}
        disabled={loading}
        onCheckedChange={(isActive) => onChange({ isActive })}
      />
    </div>
  )
}

export function LeaveTypeApprovalReadOnly({ requiresApproval }: { requiresApproval: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-hrms-border/70 bg-hrms-muted-bg/40 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hrms-muted-bg text-hrms-text-muted">
        <ClipboardCheck className="h-4 w-4" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-hrms-navy">Requires approval</p>
        <p className="mt-0.5 text-xs text-hrms-text-secondary">
          {requiresApproval
            ? 'This type currently needs approval before leave is granted (read-only).'
            : 'This type is currently auto-approved (read-only).'}
        </p>
      </div>
    </div>
  )
}

function PolicyToggleCard({
  icon: Icon,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-xl border px-4 py-3 transition-colors',
        checked ? 'border-hrms-primary/25 bg-hrms-lavender/30' : 'border-hrms-border/70 bg-white',
      )}
    >
      <div className="flex min-w-0 gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            checked ? 'bg-hrms-primary/10 text-hrms-primary' : 'bg-hrms-muted-bg text-hrms-text-muted',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-hrms-navy">{label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-hrms-text-secondary">{description}</p>
        </div>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} aria-label={label} className="mt-1 shrink-0" />
    </div>
  )
}