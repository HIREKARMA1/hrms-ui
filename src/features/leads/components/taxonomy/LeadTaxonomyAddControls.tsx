/**
 * Single Add button for lead source or category (simple name dialog).
 */

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ToastBanner, useToast } from '@/hooks/useToast'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { cn } from '@/lib/utils'

import {
  getLeadCategoryErrorMessage,
  useCreateLeadCategoryMutation,
} from '../../api/leadCategoriesApi'
import {
  getLeadSourceErrorMessage,
  useCreateLeadSourceMutation,
} from '../../api/leadSourcesApi'
import { LeadTaxonomyForm } from './LeadTaxonomyForm'

type LeadTaxonomyAddControlsProps = {
  variant?: 'default' | 'overview'
  className?: string
}

const OVERVIEW_BTN =
  'inline-flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-[#E2E6EF] bg-white px-4 text-sm font-semibold text-[#17213A] transition-colors duration-150 hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2'

export function LeadTaxonomyAddControls({
  variant = 'default',
  className,
}: LeadTaxonomyAddControlsProps) {
  const { canAccess } = useOptionalFeatureAccess()
  const canManageSources = canAccess('leads.sources.manage')
  const canManageCategories = canAccess('leads.categories.manage')
  const { message, toast } = useToast()

  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [createSource, { isLoading: creatingSource }] = useCreateLeadSourceMutation()
  const [createCategory, { isLoading: creatingCategory }] = useCreateLeadCategoryMutation()
  const submitting = creatingSource || creatingCategory

  if (!canManageSources && !canManageCategories) return null

  return (
    <>
      <ToastBanner message={message} />
      <span className={cn(className)}>
        {variant === 'overview' ? (
          <button type="button" className={OVERVIEW_BTN} onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Add source / category
          </button>
        ) : (
          <Button type="button" variant="outline" className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Add source / category
          </Button>
        )}
      </span>

      <LeadTaxonomyForm
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setFormError(null)
        }}
        allowSource={canManageSources}
        allowCategory={canManageCategories}
        submitting={submitting}
        error={formError}
        onSubmit={async ({ kind, name, code }) => {
          setFormError(null)
          try {
            if (kind === 'source') {
              await createSource({ code, name, isActive: true }).unwrap()
              toast('Lead source created.')
            } else {
              await createCategory({ code, name, isActive: true }).unwrap()
              toast('Lead category created.')
            }
            setOpen(false)
          } catch (cause) {
            const msg =
              kind === 'source'
                ? getLeadSourceErrorMessage(cause, 'Could not create lead source.')
                : getLeadCategoryErrorMessage(cause, 'Could not create lead category.')
            setFormError(msg)
            toast(msg)
          }
        }}
      />
    </>
  )
}
