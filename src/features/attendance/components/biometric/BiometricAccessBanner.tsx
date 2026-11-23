import { Card, CardContent } from '@/components/ui/card'

import { useBiometricPermissions } from '@/features/biometric/hooks'

export function BiometricAccessBanner() {
  const perms = useBiometricPermissions()
  if (perms.canListDevices) return null

  return (
    <Card className="border-border-soft bg-muted-bg shadow-sm">
      <CardContent className="py-4 text-sm text-text-secondary">
        TimeWatch device management requires{' '}
        <strong className="text-navy">biometric:manage_devices</strong>. Sync needs{' '}
        <strong>biometric:sync</strong>.
      </CardContent>
    </Card>
  )
}