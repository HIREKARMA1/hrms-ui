/**
 * "How is this leave given?" card grid for the leave type editor.
 */

import { cn } from '@/lib/utils'

import { EARNING_MODEL_CARDS } from '../../../constants/earningModelCards'
import type { LeaveEarningModel } from '../../../types/leaveEarningModel'
import { LEAVE_MOTION } from '../../shared/leaveUi'

type EarningModelPickerProps = {
  value: LeaveEarningModel
  onChange: (model: LeaveEarningModel) => void
}

export function EarningModelPicker({ value, onChange }: EarningModelPickerProps) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="mb-2 text-sm font-semibold text-hrms-navy">How is this leave given?</legend>
      {EARNING_MODEL_CARDS.map((card) => {
        const Icon = card.icon
        const active = card.id === value
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onChange(card.id)}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 text-left',
              LEAVE_MOTION,
              active ? 'border-hrms-primary bg-hrms-lavender/50' : 'border-hrms-border hover:bg-hrms-row-hover',
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-hrms-primary" aria-hidden />
            <span>
              <span className="block text-sm font-medium text-hrms-navy">{card.title}</span>
              <span className="mt-0.5 block text-xs text-hrms-text-secondary">{card.sentence}</span>
            </span>
          </button>
        )
      })}
    </fieldset>
  )
}
