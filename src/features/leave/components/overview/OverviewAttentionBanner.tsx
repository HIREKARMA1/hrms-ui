/**

 * Severity banner at the top of the Overview attention section.

 */



import { AlertTriangle, CheckCircle2 } from 'lucide-react'



import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'



import type { AttentionSummary } from '../../utils/buildAttentionSummary'

import type { HrOverviewNavigate } from '../../context/hrOverviewNavigate'

import { OV_FOCUS } from './overviewVisual'



const SHELL: Record<AttentionSummary['severity'], string> = {

  danger: 'border-[#EF444440] bg-[#EF44440F]',

  warning: 'border-[#F59E0B40] bg-[#F59E0B1A]',

  success: 'border-[#E2E6EF] bg-white',

}



const ICON_TILE: Record<AttentionSummary['severity'], string> = {

  danger: 'bg-[#EF44440F] text-[#EF4444]',

  warning: 'bg-[#F59E0B1F] text-[#F59E0B]',

  success: 'bg-[#16A34A1A] text-[#16A34A]',

}



const ICON: Record<AttentionSummary['severity'], typeof AlertTriangle> = {

  danger: AlertTriangle,

  warning: AlertTriangle,

  success: CheckCircle2,

}



type Props = {

  summary: AttentionSummary

  displayName: string

  onNavigate: HrOverviewNavigate

}



export function OverviewAttentionBanner({ summary, onNavigate }: Props) {

  const Icon = ICON[summary.severity]

  const caughtUp = summary.severity === 'success'

  const alsoLine =

    caughtUp && summary.otherItems.length === 0 ? 'Everything else is up to date.' : null



  return (

    <div

      role="status"

      className={cn('relative overflow-hidden rounded-xl border border-l-[3px] py-3 pr-4 pl-[13px]', SHELL[summary.severity])}
      style={{
        borderLeftColor:
          summary.severity === 'success'
            ? '#16A34A'
            : summary.severity === 'danger'
              ? '#EF4444'
              : '#F59E0B',
      }}

    >

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex gap-3">

          <span

            className={cn(

              'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]',

              ICON_TILE[summary.severity],

            )}

          >

            <Icon className="h-[18px] w-[18px]" aria-hidden />

          </span>

          <div>

            <h2 className="text-[15px] font-bold text-[#17213A]">{summary.headline}</h2>

            <p className="mt-0.5 text-[13px] text-[#667085]">

              {summary.summarySentence}

              {alsoLine ? ` ${alsoLine}` : null}

            </p>

          </div>

        </div>

        {summary.waitingCount > 0 ? (

          <Button

            type="button"

            size="sm"

            className={cn('h-[38px] rounded-[10px] bg-[#5938DB] text-[13.5px] hover:bg-[#7055EB]', OV_FOCUS)}

            onClick={() => onNavigate('Requests', { segment: 'action' })}

          >

            Review requests

          </Button>

        ) : null}

      </div>

    </div>

  )

}
