/**
 * Two-pane Leave Settings with guided sections, history, and unsaved guard.
 */

import { useEffect, useMemo, useState } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'

import type { LeaveSettingsSectionId } from '../../constants/leaveSettingsSections'
import { registerLeaveSettingsGuard } from '../../hooks/leaveSettingsUnsavedBridge'
import { useLeaveSettingsForm } from '../../hooks/useLeaveSettingsForm'
import { useLeave } from '../../hooks/useLeave'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { useLeaveViewer } from '../../hooks/useLeaveViewer'
import { SettingsSaveBar } from './SettingsSaveBar'
import { SettingsSectionMenu } from './SettingsSectionMenu'
import { SettingsHowItWorksCard } from './shared/SettingsHowItWorksCard'
import { SettingsSectionFrame } from './shared/SettingsSectionFrame'
import { LeaveTypesSettingsSection } from './sections/LeaveTypesSettingsSection'
import { GeneralSettingsSection } from './sections/GeneralSettingsSection'
import { ApprovalsSettingsSection } from './sections/ApprovalsSettingsSection'
import { HolidaysSettingsSection } from './sections/HolidaysSettingsSection'
import { EncashmentSettingsSection } from './sections/EncashmentSettingsSection'
import { CoverageSettingsSection } from './sections/CoverageSettingsSection'
import { HistorySettingsSection } from './sections/HistorySettingsSection'

export function LeaveSettingsTab() {
  const { reload } = useLeave()
  const { viewer } = useLeaveViewer()
  const { showToast } = useLeaveToast()
  const { draft, setDraft, saved, dirtyCount, issues, isDirty, handleSave, discard } = useLeaveSettingsForm()
  const [active, setActive] = useState<LeaveSettingsSectionId>('leave-types')
  const [holidayBanner, setHolidayBanner] = useState(true)
  const [saving, setSaving] = useState(false)

  const showHolidayBanner = useMemo(() => holidayBanner, [holidayBanner])

  useEffect(() => {
    registerLeaveSettingsGuard({
      isDirty,
      discard,
      promptConfirm: () => window.confirm('You have unsaved settings changes. Leave without saving?'),
    })
    return () => registerLeaveSettingsGuard(null)
  }, [isDirty, discard])

  async function onSave() {
    setSaving(true)
    const result = await handleSave(viewer.displayName)
    setSaving(false)
    if (!result.ok) {
      if (result.firstErrorSection) setActive(result.firstErrorSection)
      showToast('Fix validation errors before saving.')
      return
    }
    await reload()
    showToast('Settings saved.')
  }

  return (
    <TooltipProvider>
      <div className="pb-28">
        <SettingsHowItWorksCard />
        <div className="mt-4 flex min-w-0 flex-col gap-6 lg:flex-row">
          <SettingsSectionMenu active={active} onSelect={setActive} draft={draft} saved={saved} issues={issues} />
          <section className="min-w-0 flex-1">
            <SettingsSectionFrame sectionId={active}>
              {active === 'leave-types' ? (
                <LeaveTypesSettingsSection
                  draft={draft}
                  saved={saved}
                  onChange={setDraft}
                  onApplied={() => showToast('Applied. Click Save settings to keep it.')}
                />
              ) : null}
              {active === 'general' ? <GeneralSettingsSection draft={draft} onChange={setDraft} /> : null}
              {active === 'approvals' ? (
                <ApprovalsSettingsSection draft={draft} onChange={setDraft} onApplied={() => showToast('Applied. Click Save settings to keep it.')} />
              ) : null}
              {active === 'holidays' ? (
                <HolidaysSettingsSection
                  draft={draft}
                  onChange={(next) => {
                    setDraft(next)
                    setHolidayBanner(false)
                  }}
                  showSampleBanner={showHolidayBanner}
                />
              ) : null}
              {active === 'encashment' ? <EncashmentSettingsSection draft={draft} onChange={setDraft} /> : null}
              {active === 'coverage' ? <CoverageSettingsSection draft={draft} onChange={setDraft} /> : null}
              {active === 'history' ? <HistorySettingsSection /> : null}
            </SettingsSectionFrame>
          </section>
        </div>
        <SettingsSaveBar dirtyCount={dirtyCount} issues={issues} onSave={() => void onSave()} onDiscard={discard} saving={saving} />
      </div>
    </TooltipProvider>
  )
}
