/** Backend permission for listing leave requests (GET /leaves). */
export const LEAVES_READ_PERMISSION = 'leaves:read' as const

/** Backend permission for applying leave for self (POST /leaves). */
export const LEAVES_CREATE_PERMISSION = 'leaves:create' as const
