/**
 * Variable Pay page tab hosting Overtime, Bonus, and Incentives segments.
 * Rendered from PayrollPage when Variable Pay main tab is active.
 */

import { BonusTab } from './BonusTab'
import { IncentivesTab } from './IncentivesTab'
import { OvertimeTab } from './OvertimeTab'
import { VariablePaySegment } from './VariablePaySegment'
import { useVariablePaySegment } from '../../hooks/useVariablePaySegment'

export function VariablePayTab() {
  const { segment, setSegment, onKeyDown } = useVariablePaySegment()

  return (
    <div className="flex flex-col gap-3">
      <VariablePaySegment segment={segment} onChange={setSegment} onKeyDown={onKeyDown} />
      <div
        role="tabpanel"
        aria-label={`${segment} variable pay`}
      >
        {segment === 'Overtime' ? <OvertimeTab /> : null}
        {segment === 'Bonus' ? <BonusTab /> : null}
        {segment === 'Incentives' ? <IncentivesTab /> : null}
      </div>
    </div>
  )
}
