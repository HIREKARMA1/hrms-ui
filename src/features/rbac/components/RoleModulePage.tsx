import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Can } from './Can'
import { useRbacSession } from '../hooks/useRbacSession'
import { ToastBanner, useToast } from '@/hooks/useToast'

function titleFromPath(pathname: string, routePrefix: string) {
  const rest = pathname.replace(routePrefix, '').replace(/^\//, '')
  if (!rest) return 'Dashboard'
  return rest
    .split('/')
    .filter(Boolean)
    .map((part) =>
      part
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    )
    .join(' · ')
}

export function RoleModulePage() {
  const { pathname } = useLocation()
  const { roleLabel, routePrefix, session } = useRbacSession()
  const { message, toast } = useToast()
  const title = useMemo(
    () => titleFromPath(pathname, routePrefix),
    [pathname, routePrefix],
  )

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <ToastBanner message={message} />
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{roleLabel}</Badge>
          <Badge variant="outline">{session.roleCode}</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">{title}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Role-scoped module preview. Wire this screen to backend APIs when
          available. UI actions do not call real services.
        </p>
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>Module workspace</CardTitle>
          <CardDescription>
            Navigation target: <span className="font-medium text-navy">{pathname}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Can>
            <Button
              type="button"
              onClick={() =>
                toast('Action recorded as UI preview only. Backend auth required.')
              }
            >
              Primary action
            </Button>
          </Can>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast('Secondary action is UI-only.')}
          >
            Secondary action
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
