/**
 * Navigate to another payroll tab from Settings (in-page, not sidebar).
 */

import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { PayrollPageTabId } from '../../hooks/usePayrollPageTabs'
import { PAYROLL_MOTION } from '../shared/payrollUi'

type PayrollSettingsModuleLinkProps = {
  tab: PayrollPageTabId
  label: string
  onNavigate: (tab: PayrollPageTabId) => void
}

export function PayrollSettingsModuleLink({ tab, label, onNavigate }: PayrollSettingsModuleLinkProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        'h-9 gap-1.5 rounded-lg border-hrms-border bg-hrms-muted-bg/50 text-hrms-primary hover:bg-hrms-lavender',
        PAYROLL_MOTION,
      )}
      onClick={() => onNavigate(tab)}
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Button>
  )
}