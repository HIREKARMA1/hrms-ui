/**
 * Encashment policies from GET /leave-encashments/policies (server Accruals tab).
 */

import { useMemo } from 'react'

import { Button } from '@/components/ui/button'

import { useGetEncashmentPoliciesQuery } from '../../api/leaveEncashmentsApi'
import { useCanFetchEncashmentPolicies } from '../../hooks/useCanFetchEncashmentPolicies'
import type { EncashmentPolicyTableRow } from '../../types/api/leaveEncashmentPolicies.types'
import { mapApiEncashmentPoliciesToTableRows } from '../../utils/mapApiEncashmentPolicies'
import { ApiPolicyCard, type PolicyQueryView, policyTd } from './ApiPolicyCard'
import { policyStickyTd } from './policyTableLayout'
import { PolicyLeaveTypeCell, PolicyStatusCell } from './PolicyTableCells'

type Props = {
  canManage?: boolean
  onAdd?: () => void
}

export function ApiEncashmentPoliciesCard({ canManage, onAdd }: Props = {}) {
  const canFetch = useCanFetchEncashmentPolicies()
  const query = useGetEncashmentPoliciesQuery(undefined, { skip: !canFetch })

  const view = useMemo((): PolicyQueryView<EncashmentPolicyTableRow> => {
    const rows = query.data && !query.isError ? mapApiEncashmentPoliciesToTableRows(query.data) : []
    return {
      data: query.data && !query.isError ? { items: rows, pagination: { total: rows.length } } : undefined,
      isFetching: query.isFetching,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
    }
  }, [query.data, query.error, query.isError, query.isFetching, query.refetch])

  if (!canFetch) return null

  return (
    <ApiPolicyCard
      title="Encashment policies"
      query={view}
      minTableClassName="min-w-[56rem]"
      emptyMessage="No encashment policies are configured."
      head={[
        { label: 'Leave type', className: 'w-[16%]' },
        { label: 'Rate / day', className: 'w-[14%]' },
        { label: 'Min days (balance)', className: 'w-[12%]' },
        { label: 'Max / request', className: 'w-[11%]' },
        { label: 'Max / year', className: 'w-[10%]' },
        { label: 'Effective', className: 'min-w-[9.5rem] w-[18%]' },
        { label: 'Status', className: 'w-[9%]' },
      ]}
      headerAction={
        canManage && onAdd ? (
          <Button type="button" size="sm" onClick={onAdd}>
            Add encashment policy
          </Button>
        ) : null
      }
      row={(row) => (
        <>
          <td className={policyStickyTd()}>
            <PolicyLeaveTypeCell code={row.leaveTypeCode === '—' ? '' : row.leaveTypeCode} name={row.leaveTypeName} />
          </td>
          <td className={policyTd('left', 'font-normal tabular-nums')}>{row.ratePerDay}</td>
          <td className={policyTd('left', 'font-normal')}>{row.minDays}</td>
          <td className={policyTd('left', 'font-normal')}>{row.maxPerRequest}</td>
          <td className={policyTd('left', 'font-normal')}>{row.maxPerYear}</td>
          <td className={policyTd('left', 'font-normal whitespace-nowrap')} title={row.effective}>
            {row.effective}
          </td>
          <td className={policyTd('left', 'font-normal')}>
            <PolicyStatusCell active={row.active} />
          </td>
        </>
      )}
    />
  )
}