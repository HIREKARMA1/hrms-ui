import { Loader2, Pencil, RefreshCw, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { BiometricDevice } from '@/features/biometric/types/api/biometricDevices.types'

type BiometricDeviceTableProps = {
  items: BiometricDevice[]
  loading?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  canSync?: boolean
  syncLoading?: boolean
  deleteLoading?: boolean
  deletingDeviceId?: string | null
  syncingDeviceCode?: string | null
  onEdit: (device: BiometricDevice) => void
  onDelete?: (device: BiometricDevice) => void
  onSyncDevice?: (device: BiometricDevice) => void
}

export function BiometricDeviceTable({
  items,
  loading,
  canUpdate,
  canDelete,
  canSync,
  syncLoading,
  deleteLoading,
  deletingDeviceId,
  syncingDeviceCode,
  onEdit,
  onDelete,
  onSyncDevice,
}: BiometricDeviceTableProps) {
  const showActions = canUpdate || canSync || canDelete
  if (loading && items.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading devices…
      </p>
    )
  }
  if (items.length === 0) {
    return <p className="text-sm text-text-secondary">No onboarded devices yet.</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border-soft">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="border-b border-border-soft bg-app-bg text-text-secondary">
          <tr>
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Device code</th>
            <th className="px-3 py-2 font-medium">Location</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Last sync</th>
            {showActions ? <th className="px-3 py-2 font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((device) => (
            <tr key={device.id} className="border-b border-border-soft last:border-0">
              <td className="px-3 py-2 font-medium text-navy">{device.deviceName}</td>
              <td className="px-3 py-2 font-mono text-xs">{device.deviceCode}</td>
              <td className="px-3 py-2 text-text-secondary">{device.location ?? '—'}</td>
              <td className="px-3 py-2">
                <Badge variant={device.isActive ? 'success' : 'secondary'}>
                  {device.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-3 py-2 text-text-secondary">
                {device.lastSyncedAt
                  ? new Date(device.lastSyncedAt).toLocaleString()
                  : '—'}
              </td>
              {showActions ? (
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {canSync && onSyncDevice ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        disabled={syncLoading && syncingDeviceCode === device.deviceCode}
                        onClick={() => onSyncDevice(device)}
                      >
                        {syncLoading && syncingDeviceCode === device.deviceCode ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        Sync
                      </Button>
                    ) : null}
                    {canUpdate ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => onEdit(device)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    ) : null}
                    {canDelete && onDelete ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-rose-600 hover:text-rose-700"
                        disabled={deleteLoading && deletingDeviceId === device.id}
                        onClick={() => onDelete(device)}
                      >
                        {deleteLoading && deletingDeviceId === device.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
