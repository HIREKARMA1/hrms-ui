/**
 * Field label with optional "What is this?" tooltip for Leave Settings.
 */

import { Info } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { LEAVE_FIELD_LABEL } from '../../shared/leaveUi'

type SettingsInfoLabelProps = {
  htmlFor?: string
  label: string
  tip?: string
}

export function SettingsInfoLabel({ htmlFor, label, tip }: SettingsInfoLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={htmlFor} className={LEAVE_FIELD_LABEL}>
        {label}
      </label>
      {tip ? (
        <Tooltip>
          <TooltipTrigger type="button" className="rounded-full p-0.5 text-hrms-primary hover:bg-hrms-row-hover" aria-label={`What is ${label}?`}>
            <Info className="h-3.5 w-3.5" aria-hidden />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-left font-normal">
            {tip}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
