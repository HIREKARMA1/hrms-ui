/**

 * Shared card wrapper for Payroll Settings sections.

 * Used by each settings subsection component.

 */



import type { ReactNode } from 'react'



import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



type SettingsCardProps = {

  title: string

  children: ReactNode

}



export function SettingsCard({ title, children }: SettingsCardProps) {

  return (

    <Card className="h-fit w-full">

      <CardHeader className="border-b border-hrms-border/80 pb-4">

        <CardTitle className="text-base font-semibold text-hrms-navy">{title}</CardTitle>

      </CardHeader>

      <CardContent className="space-y-4 pt-5">{children}</CardContent>

    </Card>

  )

}

