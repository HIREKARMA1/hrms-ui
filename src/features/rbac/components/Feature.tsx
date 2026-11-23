import type { ReactNode } from 'react'

import { useOptionalFeatureAccess } from '../hooks/useFeatureAccess'
import type { FeatureAccessKey } from '../types/features'

type FeatureProps = {
  name: FeatureAccessKey
  children: ReactNode
  fallback?: ReactNode
}

/** Conditionally renders children based on UI feature access. */
export function Feature({ name, children, fallback = null }: FeatureProps) {
  const { canAccess } = useOptionalFeatureAccess()
  if (!canAccess(name)) return <>{fallback}</>
  return <>{children}</>
}
