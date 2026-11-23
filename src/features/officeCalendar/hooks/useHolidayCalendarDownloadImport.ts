/**

 * Download / import actions for Office Calendar → Holiday Management toolbar.

 */

import { useCallback, useRef, useState } from 'react'



import {

  useDownloadHolidayCalendarMutation,

  useImportHolidayCalendarMutation,

} from '@/features/leave/api/holidayCalendarApi'

import type { HolidayImportResult } from '@/features/leave/types/api/holidayCalendar.types'

import { HOLIDAY_IMPORT_MAX_BYTES } from '@/features/leave/types/api/holidayCalendar.types'

import type { HolidayCalendarDownloadFormat } from '@/features/leave/types/api/holidayCalendar.types'

import { getApiErrorMessage } from '@/services/api/errors'



import { useCanDownloadHolidayCalendar } from './useCanDownloadHolidayCalendar'

import { useCanImportHolidayCalendar } from './useCanImportHolidayCalendar'

import { useOfficeCalendarToast } from './useOfficeCalendarToast'

import { downloadHolidayCalendarFile } from '../utils/downloadHolidayCalendarFile'



export function useHolidayCalendarDownloadImport(holidayYear: number) {

  const { showToast } = useOfficeCalendarToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const canDownload = useCanDownloadHolidayCalendar()

  const canImport = useCanImportHolidayCalendar()

  const [downloadMutation, { isLoading: downloading }] = useDownloadHolidayCalendarMutation()

  const [importMutation, { isLoading: importing }] = useImportHolidayCalendarMutation()

  const [importReport, setImportReport] = useState<HolidayImportResult | null>(null)



  const runDownload = useCallback(

    async (format: HolidayCalendarDownloadFormat) => {

      if (!canDownload) {

        showToast('You need holidays:read to download the holiday calendar.')

        return

      }

      try {

        const result = await downloadMutation({ year: holidayYear, format }).unwrap()

        downloadHolidayCalendarFile(result.blob, result.fileName)

        const count = result.totalHolidays

        showToast(

          count !== undefined

            ? `Holiday calendar ${format.toUpperCase()} downloaded (${count} holidays).`

            : `Holiday calendar ${format.toUpperCase()} downloaded.`,

        )

      } catch (error) {

        showToast(getApiErrorMessage(error, 'Holiday calendar download failed.'))

      }

    },

    [canDownload, downloadMutation, holidayYear, showToast],

  )



  const openImportPicker = useCallback(() => {

    if (!canImport) {

      showToast('You need holidays:create to import holidays.')

      return

    }

    fileInputRef.current?.click()

  }, [canImport, showToast])



  const onImportFile = useCallback(

    async (file: File | null) => {

      if (!file) return

      if (!file.name.toLowerCase().endsWith('.xlsx')) {

        showToast('Import requires an .xlsx file.')

        return

      }

      if (file.size > HOLIDAY_IMPORT_MAX_BYTES) {

        showToast('File exceeds the 2MB import limit.')

        return

      }

      try {

        const result = await importMutation({ file }).unwrap()

        setImportReport(result)

        const { imported, failed, duplicates } = result.summary

        if (result.status === 'COMPLETED' || (imported > 0 && failed === 0 && duplicates === 0)) {

          showToast(`Imported ${imported} holiday row(s).`)

        } else {

          showToast(`Import finished: ${imported} imported, ${failed + duplicates} skipped.`)

        }

      } catch (error) {

        showToast(getApiErrorMessage(error, 'Holiday import failed.'))

      }

      if (fileInputRef.current) fileInputRef.current.value = ''

    },

    [importMutation, showToast],

  )



  return {

    canDownload,

    canImport,

    downloading,

    importing,

    fileInputRef,

    importReport,

    clearImportReport: () => setImportReport(null),

    runDownload,

    openImportPicker,

    onImportFile,

  }

}
