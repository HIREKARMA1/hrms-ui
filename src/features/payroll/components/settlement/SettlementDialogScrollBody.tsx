/**
 * Scrollable settlement dialog body: exit form, lines, summary, and timeline.
 * Used inside SettlementDetailPanel centered dialog.
 */

import { Button } from '@/components/ui/button'

import type { PayrollEmployee } from '../../types/payroll'
import type { FinalSettlement } from '../../types/finalSettlement'
import type { useSettlementEditor } from '../../hooks/useSettlementEditor'
import { promptManualSettlementLine } from '../../utils/promptManualSettlementLine'
import { SettlementExitForm } from './SettlementExitForm'
import { SettlementLinesSection } from './SettlementLinesSection'
import { SettlementSummaryBlock, SettlementTimelineBlock } from './SettlementPanelSections'

type SettlementDialogScrollBodyProps = {
  draft: FinalSettlement
  readOnly: boolean
  dateError: string | null
  pickEmployees: PayrollEmployee[]
  editor: ReturnType<typeof useSettlementEditor>
  onPatch: (patch: Partial<FinalSettlement>) => void
  onRecalculate: () => void
}

export function SettlementDialogScrollBody({
  draft,
  readOnly,
  dateError,
  pickEmployees,
  editor,
  onPatch,
  onRecalculate,
}: SettlementDialogScrollBodyProps) {
  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm">
      <SettlementExitForm
        draft={draft}
        employees={pickEmployees}
        readOnly={readOnly}
        dateError={dateError}
        onPatch={onPatch}
      />
      {!readOnly ? (
        <Button type="button" variant="outline" size="sm" onClick={onRecalculate}>
          Recalculate
        </Button>
      ) : null}
      <SettlementLinesSection
        title="Earnings"
        lines={draft.earningsLines}
        readOnly={readOnly}
        onAdd={() => promptManualSettlementLine(editor.addManualLine.bind(null, 'earnings'))}
        onRemove={(id) => editor.removeLine('earnings', id)}
      />
      <SettlementLinesSection
        title="Deductions"
        lines={draft.deductionLines}
        readOnly={readOnly}
        showTds
        tds={draft.tds}
        onTdsChange={editor.setTds}
        onAdd={() => promptManualSettlementLine(editor.addManualLine.bind(null, 'deductions'))}
        onRemove={(id) => editor.removeLine('deductions', id)}
      />
      <SettlementSummaryBlock draft={draft} />
      <SettlementTimelineBlock draft={draft} />
    </div>
  )
}
