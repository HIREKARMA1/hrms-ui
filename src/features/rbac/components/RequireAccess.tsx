import type { ReactNode } from 'react'

import { useFeatureAccess } from '../hooks/useFeatureAccess'
import type { FeatureAccessKey } from '../types/features'
import { AccessDeniedPage } from './AccessDeniedPage'

type RequireAccessProps = {
  feature: FeatureAccessKey
  featureLabel?: string
  children: ReactNode
}

export function RequireAccess({
  feature,
  featureLabel,
  children,
}: RequireAccessProps) {
  const { canAccess } = useFeatureAccess()

  if (!canAccess(feature)) {
    return <AccessDeniedPage featureLabel={featureLabel ?? feature} />
  }

  return <>{children}</>
}
