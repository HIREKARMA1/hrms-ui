/**
 * Simple dialog: pick Source or Category, type a name, save.
 * Code is derived from the name for the backend API.
 */

import { useEffect, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import {
  LEADS_DIALOG_HEADER_BAND,
  LEADS_DIALOG_SHELL,
} from '../shared/leadsUi'
import {
  PayrollDialogBody,
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogFooter,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '@/features/payroll/components/shared/PayrollDialog'

export type TaxonomyKind = 'source' | 'category'

type LeadTaxonomyFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  allowSource: boolean
  allowCategory: boolean
  submitting: boolean
  error: string | null
  onSubmit: (values: { kind: TaxonomyKind; name: string; code: string }) => Promise<void>
}

/** Backend code: UPPER_SNAKE, max 50 chars. */
export function codeFromName(name: string): string {
  const raw = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return (raw || 'ITEM').slice(0, 50)
}

export function LeadTaxonomyForm({
  open,
  onOpenChange,
  allowSource,
  allowCategory,
  submitting,
  error,
  onSubmit,
}: LeadTaxonomyFormProps) {
  const defaultKind: TaxonomyKind = allowSource ? 'source' : 'category'
  const [kind, setKind] = useState<TaxonomyKind>(defaultKind)
  const [name, setName] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setKind(allowSource ? 'source' : 'category')
      setName('')
      setLocalError(null)
    }
  }, [open, allowSource])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setLocalError('Name is required.')
      return
    }
    setLocalError(null)
    await onSubmit({
      kind,
      name: trimmed,
      code: codeFromName(trimmed),
    })
  }

  const showKindPicker = allowSource && allowCategory

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="sm"
          className={cn('flex max-h-[min(90vh,420px)] flex-col p-0', LEADS_DIALOG_SHELL)}
        >
          <div className={LEADS_DIALOG_HEADER_BAND}>
            <PayrollDialogHeader
              title="Add source or category"
              description="Enter a name — it will appear in the lead form dropdowns."
            />
          </div>
          <form onSubmit={(e) => void handleSubmit(e)} className="flex min-h-0 flex-1 flex-col">
            <PayrollDialogBody className="space-y-4">
              {(localError || error) && (
                <p className="text-sm text-hrms-danger">{localError || error}</p>
              )}
              {showKindPicker ? (
                <div>
                  <Label>Type</Label>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setKind('source')}
                      className={cn(
                        'flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                        kind === 'source'
                          ? 'border-[#0F766E] bg-[#CCFBF1] text-[#0F766E]'
                          : 'border-hrms-border bg-white text-hrms-navy hover:bg-hrms-page',
                      )}
                    >
                      Source
                    </button>
                    <button
                      type="button"
                      onClick={() => setKind('category')}
                      className={cn(
                        'flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                        kind === 'category'
                          ? 'border-[#0F766E] bg-[#CCFBF1] text-[#0F766E]'
                          : 'border-hrms-border bg-white text-hrms-navy hover:bg-hrms-page',
                      )}
                    >
                      Category
                    </button>
                  </div>
                </div>
              ) : null}
              <div>
                <Label htmlFor="taxonomy-name">Name</Label>
                <Input
                  id="taxonomy-name"
                  className="mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={kind === 'source' ? 'e.g. Website' : 'e.g. Enterprise'}
                  maxLength={200}
                  autoFocus
                  required
                />
              </div>
            </PayrollDialogBody>
            <PayrollDialogFooter>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Add'}
                </Button>
              </div>
            </PayrollDialogFooter>
          </form>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}
