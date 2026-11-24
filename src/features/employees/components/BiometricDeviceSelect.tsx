import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBiometricDeviceList } from '@/features/biometric/hooks/useBiometricDevices'

type BiometricDeviceSelectProps = {
  value: string
  onChange: (deviceCode: string) => void
  disabled?: boolean
  id?: string
  /** Allow clearing the selection (profile unlink). */
  allowEmpty?: boolean
}

/**
 * Dropdown of active onboarded HRMS biometric devices.
 * Value is `deviceCode` (the employee `deviceId` FK).
 */
export function BiometricDeviceSelect({
  value,
  onChange,
  disabled = false,
  id,
  allowEmpty = false,
}: BiometricDeviceSelectProps) {
  const { data, isLoading, isError, error } = useBiometricDeviceList({
    isActive: true,
    limit: 100,
    page: 1,
  })
  const items = data?.items ?? []

  if (isLoading) {
    return (
      <Select disabled value={value || undefined}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Loading devices…" />
        </SelectTrigger>
      </Select>
    )
  }

  if (isError) {
    return (
      <div className="space-y-1">
        <Select disabled value={value || undefined}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Could not load devices" />
          </SelectTrigger>
        </Select>
        <p className="text-xs text-destructive">
          {error && 'status' in error
            ? 'Failed to load biometric devices. Check biometric:manage_devices permission.'
            : 'Failed to load biometric devices.'}
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="space-y-1">
        <Select disabled value={value || undefined}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="No devices registered" />
          </SelectTrigger>
        </Select>
        <p className="text-xs text-amber-700">
          Register a device under Attendance → Biometric settings first.
        </p>
      </div>
    )
  }

  return (
    <Select
      value={value || undefined}
      onValueChange={(next) => onChange(next === '__none__' ? '' : next)}
      disabled={disabled}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select biometric device" />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty ? (
          <SelectItem value="__none__">Not linked</SelectItem>
        ) : null}
        {items.map((device) => (
          <SelectItem key={device.id} value={device.deviceCode}>
            {device.deviceName
              ? `${device.deviceName} (${device.deviceCode})`
              : device.deviceCode}
          </SelectItem>
        ))}
        {value && !items.some((d) => d.deviceCode === value) ? (
          <SelectItem value={value}>{value} (current)</SelectItem>
        ) : null}
      </SelectContent>
    </Select>
  )
}
