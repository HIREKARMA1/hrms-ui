/**
 * Variable pay policy: segmented sub-views (one card at a time).
 */

import { useState } from 'react'

import { cn } from '@/lib/utils'

import {
  VARIABLE_PAY_POLICY_SEGMENTS,
  VARIABLE_PAY_POLICY_SEGMENT_HINT,
  type VariablePayPolicySegmentId,
} from '../../constants/payrollVariablePayPolicySegments'
import type { PayrollSettings } from '../../types/payrollSettings'
import { PAYROLL_MOTION } from '../shared/payrollUi'
import { BonusRulesCard } from './BonusRulesCard'
import { OvertimeRulesCard } from './OvertimeRulesCard'
import { VariablePayTreatmentCard } from './VariablePayTreatmentCard'

type VariablePayPolicySettingsSectionProps = {
  draft: PayrollSettings
  onChange: (next: PayrollSettings) => void
}

export function VariablePayPolicySettingsSection({ draft, onChange }: VariablePayPolicySettingsSectionProps) {
  const [segment, setSegment] = useState<VariablePayPolicySegmentId>('Overtime')

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Variable pay policy topics"
        className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-hrms-muted-bg p-1"
      >
        {VARIABLE_PAY_POLICY_SEGMENTS.map((item) => {
          const isActive = segment === item
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSegment(item)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-2 text-sm font-medium sm:px-4',
                PAYROLL_MOTION,
                isActive
                  ? 'bg-white font-semibold text-hrms-primary shadow-sm'
                  : 'text-hrms-text-secondary hover:text-hrms-navy',
              )}
            >
              {item}
            </button>
          )
        })}
      </div>
      <p className="text-sm text-hrms-text-secondary">{VARIABLE_PAY_POLICY_SEGMENT_HINT[segment]}</p>
      <div role="tabpanel" aria-label={segment}>
        {segment === 'Overtime' ? <OvertimeRulesCard draft={draft} onChange={onChange} /> : null}
        {segment === 'Bonus' ? <BonusRulesCard draft={draft} onChange={onChange} /> : null}
        {segment === 'Statutory inclusion' ? (
          <VariablePayTreatmentCard draft={draft} onChange={onChange} />
        ) : null}
      </div>
    </div>
  )
}