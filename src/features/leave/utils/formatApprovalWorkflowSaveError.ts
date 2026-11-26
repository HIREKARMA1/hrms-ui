import { getApiErrorMessage } from '@/services/api/errors'



const FALLBACK = 'Could not save the approval workflow. Check the fields and try again.'



export function formatApprovalWorkflowSaveError(error: unknown): string {
  const generic = getApiErrorMessage(error, FALLBACK)

  if (generic === FALLBACK || generic === 'Something went wrong. Please try again.') return FALLBACK

  if (generic.toLowerCase().includes('leave types are inactive')) {
    return 'One or more leave types are inactive. Choose an active leave type in this dialog, or activate the type on the Leave types table.'
  }

  return generic
}
