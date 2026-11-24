/**

 * Download / import buttons on Holiday Management toolbar (live API only).

 */

import type { RefObject } from 'react'
import { FileDown, FileSpreadsheet, Loader2, Upload } from 'lucide-react'



import { Button } from '@/components/ui/button'



type OfficeCalendarHolidayCalendarButtonsProps = {

  canDownload: boolean

  canImport: boolean

  downloading: boolean

  importing: boolean

  fileInputRef: RefObject<HTMLInputElement | null>

  onDownloadPdf: () => void

  onDownloadExcel: () => void

  onImportClick: () => void

  onImportFile: (file: File | null) => void

}



export function OfficeCalendarHolidayCalendarButtons({

  canDownload,

  canImport,

  downloading,

  importing,

  fileInputRef,

  onDownloadPdf,

  onDownloadExcel,

  onImportClick,

  onImportFile,

}: OfficeCalendarHolidayCalendarButtonsProps) {

  if (!canDownload && !canImport) return null

  return (

    <div className="flex flex-wrap items-center gap-2">

      {canDownload ? (

        <>

          <Button

            type="button"

            variant="outline"

            size="sm"

            className="gap-1"

            disabled={downloading}

            onClick={onDownloadPdf}

          >

            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}

            PDF

          </Button>

          <Button

            type="button"

            variant="outline"

            size="sm"

            className="gap-1"

            disabled={downloading}

            onClick={onDownloadExcel}

          >

            <FileSpreadsheet className="h-4 w-4" aria-hidden />

            Excel

          </Button>

        </>

      ) : null}

      {canImport ? (

        <>

          <input

            ref={fileInputRef}

            type="file"

            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

            className="sr-only"

            onChange={(event) => onImportFile(event.target.files?.[0] ?? null)}

          />

          <Button

            type="button"

            variant="outline"

            size="sm"

            className="gap-1"

            disabled={importing}

            onClick={onImportClick}

          >

            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}

            Import

          </Button>

        </>

      ) : null}

    </div>

  )

}
