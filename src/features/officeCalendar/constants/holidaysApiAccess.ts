/** Backend permission for listing holidays (GET /holidays, GET /holidays/{id}). */

export const HOLIDAYS_READ_PERMISSION = 'holidays:read' as const



/** Backend permission for POST /holidays. */

export const HOLIDAYS_CREATE_PERMISSION = 'holidays:create' as const



/** Backend permission for POST /calendar/holidays/import (same as create). */

export const HOLIDAYS_IMPORT_PERMISSION = 'holidays:create' as const



/** Backend permission for GET /calendar/holidays/download. */

export const HOLIDAYS_CALENDAR_DOWNLOAD_PERMISSION = 'holidays:read' as const



/** Backend permission for POST /calendar/holidays/{id}/notify. */

export const HOLIDAYS_NOTIFY_PERMISSION = 'holidays:notify' as const
