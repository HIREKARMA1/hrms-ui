/**
 * Gateway status, connection test, sync, and add-device actions for biometric settings.
 */
import { Loader2, Plus, RefreshCw, Wifi } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type BiometricSettingsGatewayToolbarProps = {
  connectionFetching: boolean
  connectionOk: boolean | undefined
  canSync: boolean
  syncLoading: boolean
  canConfigureDevices: boolean
  onTestConnection: () => void
  onSyncAll: () => void
  onAddDevice: () => void
}

export function BiometricSettingsGatewayToolbar({
  connectionFetching,
  connectionOk,
  canSync,
  syncLoading,
  canConfigureDevices,
  onTestConnection,
  onSyncAll,
  onAddDevice,
}: BiometricSettingsGatewayToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-secondary">Gateway</span>
      {connectionFetching ? (
        <Badge variant="secondary">Testing…</Badge>
      ) : (
        <Badge variant={connectionOk ? 'success' : 'warning'}>
          {connectionOk ? 'Healthy' : 'Check required'}
        </Badge>
      )}
      <Button type="button" variant="outline" size="sm" className="gap-1" onClick={onTestConnection}>
        <Wifi className="h-3.5 w-3.5" />
        Test connection
      </Button>
      {canSync ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={syncLoading}
          onClick={onSyncAll}
        >
          {syncLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Sync punches
        </Button>
      ) : null}
      {canConfigureDevices ? (
        <Button type="button" size="sm" className="gap-1" onClick={onAddDevice}>
          <Plus className="h-3.5 w-3.5" />
          Add device
        </Button>
      ) : null}
    </div>
  )
}