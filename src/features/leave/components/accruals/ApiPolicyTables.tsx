/**

 * Server accrual and carry-forward policy tables

 * (GET /leave-policies/accrual, /leave-policies/carry-forward).

 */



import { Button } from '@/components/ui/button'



import { useListAccrualPoliciesQuery, useListCarryForwardPoliciesQuery } from '../../api/leaveApi'

import { formatExpiryMonths, formatPolicyEffectiveRange } from '../../utils/formatPolicyDateRange'

import { ApiPolicyCard, policyLimitLabel, policyTd } from './ApiPolicyCard'
import { policyStickyTd } from './policyTableLayout'

import { PolicyLeaveTypeCell, PolicyStatusCell, policyTypeParts } from './PolicyTableCells'



const POLICY_LIMIT = 100



type CardExtras = {

  canManage?: boolean

  onAdd?: () => void

}



export function ApiAccrualPoliciesCard({ canManage, onAdd }: CardExtras = {}) {

  const query = useListAccrualPoliciesQuery({ page: 1, limit: POLICY_LIMIT })

  return (

    <ApiPolicyCard

      title="Accrual policies"

      query={query}

      emptyMessage="No accrual policies are configured."

      head={['Leave type', 'Frequency', 'Amount', 'Annual limit', 'Max balance', 'Effective', 'Status']}

      headerAction={

        canManage && onAdd ? (

          <Button type="button" size="sm" onClick={onAdd}>

            Add accrual policy

          </Button>

        ) : null

      }

      row={(item) => {

        const type = policyTypeParts(item.leaveType, item.leaveTypeId)

        const effective = formatPolicyEffectiveRange(item.effectiveFrom, item.effectiveTo)

        return (

          <>

            <td className={policyStickyTd()}>

              <PolicyLeaveTypeCell code={type.code} name={type.name} />

            </td>

            <td className={policyTd('left', 'font-normal')}>{item.frequency === 'MONTHLY' ? 'Monthly' : 'Yearly'}</td>

            <td className={policyTd('left', 'font-normal tabular-nums')}>{item.accrualAmount}</td>

            <td className={policyTd('left', 'font-normal tabular-nums')}>{policyLimitLabel(item.annualAllocationLimit)}</td>

            <td className={policyTd('left', 'font-normal tabular-nums')}>{policyLimitLabel(item.maxAccumulatedBalance)}</td>

            <td className={policyTd('left', 'font-normal whitespace-nowrap')} title={effective}>

              {effective}

            </td>

            <td className={policyTd('left', 'font-normal')}>

              <PolicyStatusCell active={item.isActive} />

            </td>

          </>

        )

      }}

    />

  )

}



export function ApiCarryForwardPoliciesCard({ canManage, onAdd }: CardExtras = {}) {

  const query = useListCarryForwardPoliciesQuery({ page: 1, limit: POLICY_LIMIT })

  return (

    <ApiPolicyCard

      title="Carry-forward policies"

      query={query}

      emptyMessage="No carry-forward policies are configured."

      head={['Leave type', 'Carry forward', 'Max days', 'Expires after', 'Effective year', 'Status']}

      headerAction={

        canManage && onAdd ? (

          <Button type="button" size="sm" onClick={onAdd}>

            Add carry-forward policy

          </Button>

        ) : null

      }

      row={(item) => {

        const type = policyTypeParts(item.leaveType, item.leaveTypeId)

        return (

          <>

            <td className={policyStickyTd()}>

              <PolicyLeaveTypeCell code={type.code} name={type.name} />

            </td>

            <td className={policyTd('left', 'font-normal')}>{item.enabled ? 'Enabled' : 'Disabled'}</td>

            <td className={policyTd('left', 'font-normal tabular-nums')}>{item.maxCarryForwardDays}</td>

            <td className={policyTd('left', 'font-normal')}>{formatExpiryMonths(item.expiryMonths)}</td>

            <td className={policyTd('left', 'font-normal tabular-nums')}>{item.effectiveYear}</td>

            <td className={policyTd('left', 'font-normal')}>

              <PolicyStatusCell active={item.isActive} />

            </td>

          </>

        )

      }}

    />

  )

}
