import { useMemo } from 'react'



import { useOptionalFeatureAccess } from './useFeatureAccess'



/**

 * Calendar event action permissions (UI gating only). Mirrors holiday permission hooks.

 */

export function useCalendarEventPermissions() {

  const { canAccess } = useOptionalFeatureAccess()



  return useMemo(

    () => ({

      canView: canAccess('calendar.events'),

      canCreate: canAccess('calendar.create'),

      canUpdate: canAccess('calendar.update'),

      canDelete: canAccess('calendar.delete'),

    }),

    [canAccess],

  )

}
