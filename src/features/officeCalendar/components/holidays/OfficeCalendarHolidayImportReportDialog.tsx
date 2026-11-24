/**

 * Shows row-level errors after POST /calendar/holidays/import (PARTIAL / failed rows).

 */

import { Button } from '@/components/ui/button'

import {

  Dialog,

  DialogContent,

  DialogDescription,

  DialogFooter,

  DialogHeader,

  DialogTitle,

} from '@/components/ui/dialog'

import type { HolidayImportResult } from '@/features/leave/types/api/holidayCalendar.types'



type OfficeCalendarHolidayImportReportDialogProps = {

  report: HolidayImportResult | null

  onClose: () => void

}



export function OfficeCalendarHolidayImportReportDialog({

  report,

  onClose,

}: OfficeCalendarHolidayImportReportDialogProps) {

  const open = report !== null && report.rows.length > 0

  if (!report) return null

  return (

    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>

      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">

        <DialogHeader>

          <DialogTitle>Import report</DialogTitle>

          <DialogDescription>

            {report.summary.imported} imported · {report.summary.failed} failed ·{' '}

            {report.summary.duplicates} duplicate(s) of {report.summary.totalRows} rows

          </DialogDescription>

        </DialogHeader>

        <ul className="space-y-2 text-sm text-hrms-navy">

          {report.rows.map((row, index) => (

            <li key={`${row.row ?? index}`} className="rounded-lg border border-hrms-border p-2">

              {row.row ? <span className="font-medium">Row {row.row}: </span> : null}

              {(row.errors ?? []).join(' · ') || 'Could not import this row.'}

            </li>

          ))}

        </ul>

        <DialogFooter>

          <Button type="button" onClick={onClose}>

            Close

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  )

}
