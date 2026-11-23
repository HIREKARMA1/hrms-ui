/**
 * Loading placeholder blocks matching payroll card and table layout.
 * Used by PayrollPage while payrollService fetch is in progress.
 */

import { Card, CardContent } from '@/components/ui/card'

export function PayrollSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading payroll">
      <div className="h-20 animate-pulse rounded-2xl bg-hrms-muted-bg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="h-28 animate-pulse p-5">
              <div className="h-4 w-24 rounded bg-hrms-muted-bg" />
              <div className="mt-4 h-8 w-32 rounded bg-hrms-muted-bg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="h-64 animate-pulse p-5">
          <div className="h-full rounded bg-hrms-muted-bg" />
        </CardContent>
      </Card>
    </div>
  )
}
