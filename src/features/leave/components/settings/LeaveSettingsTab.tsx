/**
 * HR leave policy settings with two-column cards and sticky save bar.
 * Rendered on LeavePage when Leave Settings tab is active.
 */

import { LEAVE_SETTINGS_NOTICE } from '../../constants/leaveRules'
import { useLeaveSettingsForm } from '../../hooks/useLeaveSettingsForm'
import { useLeave } from '../../hooks/useLeave'
import { EncashmentRulesCard } from './EncashmentRulesCard'
import { HolidayCalendarCard } from './HolidayCalendarCard'
import { LeaveYearCard } from './LeaveYearCard'
import { SettingsSaveBar } from './SettingsSaveBar'

export function LeaveSettingsTab() {
  const { reload } = useLeave()
  const { draft, setDraft, isDirty, fieldErrors, handleSave, discard } = useLeaveSettingsForm()

  async function onSave() {
    const ok = await handleSave()
    if (ok) {
      await reload()
    }
  }

  return (
    <div className="pb-28">
      <p className="text-sm text-hrms-text-secondary">{LEAVE_SETTINGS_NOTICE}</p>
      <h2 className="mt-4 text-base font-semibold text-hrms-navy">Leave configuration</h2>
      <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <LeaveYearCard draft={draft} onChange={setDraft} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <HolidayCalendarCard draft={draft} onChange={setDraft} />
          <EncashmentRulesCard draft={draft} onChange={setDraft} />
        </div>
      </div>
      <SettingsSaveBar isDirty={isDirty} errors={fieldErrors} onSave={() => void onSave()} onDiscard={discard} />
    </div>
  )
}
