import * as Dialog from '@radix-ui/react-dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { BiometricDevice } from '@/features/biometric/types/api/biometricDevices.types'

export type BiometricDeviceFormState = {
  deviceCode: string
  deviceName: string
  location: string
  isActive: boolean
}

type BiometricDeviceFormDialogProps = {
  open: boolean
  mode: 'register' | 'edit'
  draft: BiometricDeviceFormState
  saving?: boolean
  onDraftChange: (patch: Partial<BiometricDeviceFormState>) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function emptyBiometricDeviceForm(): BiometricDeviceFormState {
  return { deviceCode: '', deviceName: '', location: '', isActive: true }
}

export function formFromDevice(device: BiometricDevice): BiometricDeviceFormState {
  return {
    deviceCode: device.deviceCode,
    deviceName: device.deviceName,
    location: device.location ?? '',
    isActive: device.isActive,
  }
}

export function BiometricDeviceFormDialog({
  open,
  mode,
  draft,
  saving,
  onDraftChange,
  onOpenChange,
  onSubmit,
}: BiometricDeviceFormDialogProps) {
  const title = mode === 'register' ? 'Onboard TimeWatch device' : 'Update device'
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-soft bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-navy">{title}</Dialog.Title>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="bio-device-code">Device code (TimeWatch serial)</Label>
              <Input
                id="bio-device-code"
                value={draft.deviceCode}
                disabled={mode === 'edit'}
                onChange={(e) => onDraftChange({ deviceCode: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bio-device-name">Display name</Label>
              <Input
                id="bio-device-name"
                value={draft.deviceName}
                onChange={(e) => onDraftChange({ deviceName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bio-device-loc">Location</Label>
              <Input
                id="bio-device-loc"
                value={draft.location}
                onChange={(e) => onDraftChange({ location: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border-soft px-3 py-2">
              <Label htmlFor="bio-device-active">Active</Label>
              <Switch
                id="bio-device-active"
                checked={draft.isActive}
                onCheckedChange={(checked) => onDraftChange({ isActive: checked })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={onSubmit}>
              {mode === 'register' ? 'Register' : 'Save'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}