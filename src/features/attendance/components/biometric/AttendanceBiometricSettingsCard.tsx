/**
 * TimeWatch device onboarding, gateway test, sync, and catalog (settings tab).
 */
import { Fingerprint } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useAttendanceBiometricSettings } from '../../hooks/useAttendanceBiometricSettings'
import { useBiometricSettingsUiState } from '../../hooks/useBiometricSettingsUiState'
import { BiometricConnectionTestPanel } from './BiometricConnectionTestPanel'
import { BiometricDeviceFormDialog } from './BiometricDeviceFormDialog'
import { BiometricDeviceTable } from './BiometricDeviceTable'
import { BiometricSettingsGatewayToolbar } from './BiometricSettingsGatewayToolbar'
import { BiometricSyncResultDialog } from './BiometricSyncResultDialog'
import { BiometricTimeWatchCatalog } from './BiometricTimeWatchCatalog'

type AttendanceBiometricSettingsCardProps = {
  toast: (message: string) => void
}

export function AttendanceBiometricSettingsCard({ toast }: AttendanceBiometricSettingsCardProps) {
  const bio = useAttendanceBiometricSettings(toast)
  const ui = useBiometricSettingsUiState(bio.runSync, bio.submitRegister, bio.submitUpdate)

  const items = bio.devices.data?.items ?? []

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-navy">
          <Fingerprint className="h-4 w-4 text-brand-500" />
          TimeWatch biometric devices
        </CardTitle>
        <CardDescription>
          Onboard devices, test the HRMS → TimeWatch gateway, and sync punches into HRMS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BiometricSettingsGatewayToolbar
          connectionFetching={bio.connection.isFetching}
          connectionOk={bio.connection.data?.ok}
          canSync={bio.canSync}
          syncLoading={bio.syncLoading}
          canConfigureDevices={bio.perms.canConfigureDevices}
          onTestConnection={() => void bio.runConnectionTest()}
          onSyncAll={() => void ui.openSyncReport()}
          onAddDevice={() => ui.openRegister()}
        />

        <BiometricConnectionTestPanel
          data={bio.connection.data}
          isFetching={bio.connection.isFetching}
          isError={bio.connection.isError}
          error={bio.connection.error}
          onRetry={() => void bio.runConnectionTest()}
        />

        <BiometricDeviceTable
          items={items}
          loading={bio.devices.isLoading || bio.devices.isFetching}
          canUpdate={bio.perms.canConfigureDevices}
          canSync={bio.canSync}
          syncLoading={bio.syncLoading}
          syncingDeviceCode={ui.syncingDeviceCode}
          onEdit={ui.openEdit}
          onSyncDevice={(device) => void ui.openSyncReport(device.deviceCode)}
        />

        <BiometricTimeWatchCatalog
          items={bio.timewatch.data?.items}
          isLoading={bio.timewatch.isLoading}
          isFetching={bio.timewatch.isFetching}
          isError={bio.timewatch.isError}
          error={bio.timewatch.error}
          canOnboard={bio.perms.canConfigureDevices}
          onOnboard={(code) => ui.openRegister(code)}
          onRetry={() => void bio.timewatch.refetch()}
        />
      </CardContent>

      <BiometricDeviceFormDialog
        open={ui.dialogOpen}
        mode={ui.dialogMode}
        draft={ui.draft}
        saving={bio.registerLoading || bio.updateLoading}
        onDraftChange={(patch) => ui.setDraft((state) => ({ ...state, ...patch }))}
        onOpenChange={ui.setDialogOpen}
        onSubmit={() => void ui.handleSubmit()}
      />

      <BiometricSyncResultDialog
        open={ui.syncDialogOpen}
        scopeLabel={ui.syncScopeLabel}
        result={ui.syncResult}
        errorMessage={ui.syncError}
        onOpenChange={ui.setSyncDialogOpen}
      />
    </Card>
  )
}