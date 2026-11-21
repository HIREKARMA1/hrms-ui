import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

import type { EmployeeDeviceLinkFormState } from '../api/employeeMappers'

type EmployeeBiometricLinkEditorProps = {
  value: EmployeeDeviceLinkFormState
  onChange: (next: EmployeeDeviceLinkFormState) => void
  disabled?: boolean
  onSave?: () => void
  saving?: boolean
}

export function EmployeeBiometricLinkEditor({
  value,
  onChange,
  disabled = false,
  onSave,
  saving = false,
}: EmployeeBiometricLinkEditorProps) {
  const set = (key: keyof EmployeeDeviceLinkFormState, next: string) =>
    onChange({ ...value, [key]: next })

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-secondary">
        Links this employee to TimeWatch for attendance reports. Use the device code from Attendance →
        Biometric settings and the user ID from the device.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="emp-device-id">Biometric device ID</Label>
          <Input
            id="emp-device-id"
            value={value.deviceId}
            disabled={disabled}
            placeholder="Device code from HRMS"
            autoComplete="off"
            onChange={(event) => set('deviceId', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-device-user-id">Device user ID</Label>
          <Input
            id="emp-device-user-id"
            value={value.deviceUserId}
            disabled={disabled}
            placeholder="User ID on the device"
            autoComplete="off"
            onChange={(event) => set('deviceUserId', event.target.value)}
          />
        </div>
      </div>
      {onSave ? (
        <Button type="button" disabled={disabled || saving} onClick={onSave}>
          {saving ? 'Saving…' : 'Save biometric link'}
        </Button>
      ) : null}
    </div>
  )
}