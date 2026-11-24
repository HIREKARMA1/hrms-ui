/** Backend permission for listing calendar events (GET /calendar/events). */

export const CALENDAR_READ_PERMISSION = 'calendar:read' as const



/** Backend permission for POST /calendar/events. */

export const CALENDAR_CREATE_PERMISSION = 'calendar:create' as const

/** Backend permission for PATCH /calendar/events/{id}. */
export const CALENDAR_UPDATE_PERMISSION = 'calendar:update' as const

/** Backend permission for DELETE /calendar/events/{id}. */
export const CALENDAR_DELETE_PERMISSION = 'calendar:delete' as const

/** Backend permission for POST /calendar/weekly-offs (replace company policy). */
export const CALENDAR_CONFIGURE_PERMISSION = 'calendar:configure' as const
