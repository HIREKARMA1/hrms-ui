/**

 * Browser download for GET /calendar/holidays/download blob.

 */

export function downloadHolidayCalendarFile(blob: Blob, fileName: string): void {

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')

  link.href = url

  link.download = fileName

  document.body.appendChild(link)

  link.click()

  link.remove()

  URL.revokeObjectURL(url)

}
