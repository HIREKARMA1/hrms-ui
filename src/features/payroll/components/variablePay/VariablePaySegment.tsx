/**

 * Secondary segmented control under Variable Pay tab title.

 * Muted track with elevated active segment; supports arrow keys.

 */



import type { KeyboardEvent } from 'react'



import { cn } from '@/lib/utils'



import {

  VARIABLE_PAY_SEGMENTS,

  type VariablePaySegmentId,

} from '../../hooks/useVariablePaySegment'

import { PAYROLL_MOTION } from '../shared/payrollUi'



type VariablePaySegmentProps = {

  segment: VariablePaySegmentId

  onChange: (value: VariablePaySegmentId) => void

  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void

}



export function VariablePaySegment({ segment, onChange, onKeyDown }: VariablePaySegmentProps) {

  return (

    <div

      role="tablist"

      aria-label="Variable pay sections"

      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-hrms-muted-bg p-1"

    >

      {VARIABLE_PAY_SEGMENTS.map((item) => {

        const isActive = segment === item

        return (

          <button

            key={item}

            type="button"

            role="tab"

            aria-selected={isActive}

            onClick={() => onChange(item)}

            onKeyDown={onKeyDown}

            className={cn(

              'shrink-0 rounded-lg px-4 py-2 text-sm font-medium',

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

  )

}

