import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useOptionalRbacSession } from '../hooks/useRbacSession'

type AccessDeniedPageProps = {
  featureLabel?: string
}

export function AccessDeniedPage({
  featureLabel = 'this resource',
}: AccessDeniedPageProps) {
  const rbac = useOptionalRbacSession()
  const home = rbac?.routePrefix ?? '/'

  return (
    <div className="mx-auto flex w-full max-w-lg items-center justify-center py-16">
      <Card className="w-full border-border-soft shadow-sm">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-[#EF4444]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view {featureLabel}. Backend
            authorization remains the source of truth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to={home}>Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
