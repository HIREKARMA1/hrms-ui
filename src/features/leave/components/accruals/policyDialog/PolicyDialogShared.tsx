import type { ReactNode } from 'react'
import { ToggleRight } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import { LEAVE_DIALOG_INPUT } from '../../shared/leaveUi'

export const POLICY_DIALOG_INPUT = cn(
  LEAVE_DIALOG_INPUT,
  'placeholder:text-hrms-text-secondary/80 disabled:cursor-not-allowed disabled:bg-hrms-muted-bg/60',
)

export function PolicyFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-hrms-text-secondary">{title}</h3>
      {children}
    </section>
  )
}

export function PolicyPreviewStrip({ label, name, detail }: { label: string; name: string; detail: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-hrms-border bg-hrms-muted-bg/50 px-4 py-3">
      <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-hrms-primary px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-white">
        {label}
      </span>
      <span className="text-sm font-medium text-hrms-navy">{name}</span>
      <span className="ml-auto text-xs text-hrms-text-secondary">{detail}</span>
    </div>
  )
}

export function PolicyToggleRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <p className="flex items-start gap-3 rounded-xl border border-hrms-border bg-white p-4">
      <ToggleRight className="mt-0.5 h-4 w-4 shrink-0 text-hrms-primary" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-hrms-navy">{label}</span>
        <span className="mt-0.5 block text-xs text-hrms-text-secondary">{description}</span>
      </span>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </p>
  )
}

export function PolicySaveErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
      {message}
    </p>
  )
}