import { baseApi } from '@/services/api/baseApi'

import { unwrapData, type ApiResponse } from '@/services/api/types'



import type {

  ApiEmployeeLeavePolicyDefaultItem,

  EmployeeLeavePolicyDefaultsData,

} from '../types/api/employeeLeavePolicyDefaults.types'

import type {

  ApiEmployeeLeavePolicyHrOverviewItem,

  EmployeeLeavePolicyHrOverviewData,

  EmployeeLeavePolicyHrOverviewQuery,

} from '../types/api/employeeLeavePolicyHrOverview.types'

import type {
  ApiEmployeeLeavePolicyDashboard,
  EmployeeLeavePolicyDashboardQuery,
} from '../types/api/employeeLeavePolicyDashboard.types'
import type {
  ApiEmployeeLeavePolicyItem,
  EmployeeLeavePolicyListData,
  EmployeeLeavePolicyListQuery,
} from '../types/api/employeeLeavePolicyList.types'
import type {
  AssignEmployeeLeaveDefaultsBody,
  AssignEmployeeLeavePolicyBody,
} from '../types/api/employeeLeavePolicyMutations.types'



function normalizeEmployeeLeavePolicyDefaults(raw: unknown): EmployeeLeavePolicyDefaultsData {

  if (Array.isArray(raw)) {

    return { items: raw as ApiEmployeeLeavePolicyDefaultItem[] }

  }

  if (raw && typeof raw === 'object' && 'items' in raw) {

    const items = (raw as { items: unknown }).items

    return { items: Array.isArray(items) ? (items as ApiEmployeeLeavePolicyDefaultItem[]) : [] }

  }

  if (raw && typeof raw === 'object' && 'defaults' in raw) {

    const defaults = (raw as { defaults: unknown }).defaults

    return { items: Array.isArray(defaults) ? (defaults as ApiEmployeeLeavePolicyDefaultItem[]) : [] }

  }

  if (raw && typeof raw === 'object' && 'policies' in raw) {

    const policies = (raw as { policies: unknown }).policies

    return { items: Array.isArray(policies) ? (policies as ApiEmployeeLeavePolicyDefaultItem[]) : [] }

  }

  return { items: [] }

}



function normalizeHrOverviewList(raw: unknown): EmployeeLeavePolicyHrOverviewData {

  const empty = (items: ApiEmployeeLeavePolicyHrOverviewItem[]): EmployeeLeavePolicyHrOverviewData => ({

    items,

    total: items.length,

    page: 1,

    limit: items.length || 20,

  })



  if (Array.isArray(raw)) {

    return empty(raw as ApiEmployeeLeavePolicyHrOverviewItem[])

  }



  if (raw && typeof raw === 'object' && 'items' in raw) {

    const body = raw as EmployeeLeavePolicyHrOverviewData

    const items = Array.isArray(body.items) ? body.items : []

    return {

      items,

      total: typeof body.total === 'number' ? body.total : items.length,

      page: typeof body.page === 'number' ? body.page : 1,

      limit: typeof body.limit === 'number' ? body.limit : items.length || 20,

      totalPages: body.totalPages,

    }

  }



  if (raw && typeof raw === 'object' && 'employees' in raw) {

    const employees = (raw as { employees: ApiEmployeeLeavePolicyHrOverviewItem[] }).employees

    const items = Array.isArray(employees) ? employees : []

    const body = raw as { total?: number; page?: number; limit?: number; totalPages?: number }

    return {

      items,

      total: typeof body.total === 'number' ? body.total : items.length,

      page: typeof body.page === 'number' ? body.page : 1,

      limit: typeof body.limit === 'number' ? body.limit : items.length || 20,

      totalPages: body.totalPages,

    }

  }



  if (raw && typeof raw === 'object' && 'rows' in raw) {

    const rows = (raw as { rows: ApiEmployeeLeavePolicyHrOverviewItem[] }).rows

    const items = Array.isArray(rows) ? rows : []

    const body = raw as { total?: number; page?: number; limit?: number; totalPages?: number }

    return {

      items,

      total: typeof body.total === 'number' ? body.total : items.length,

      page: typeof body.page === 'number' ? body.page : 1,

      limit: typeof body.limit === 'number' ? body.limit : items.length || 20,

      totalPages: body.totalPages,

    }

  }



  return empty([])

}



function normalizeEmployeeLeavePolicyList(raw: unknown): EmployeeLeavePolicyListData {

  const empty = (items: ApiEmployeeLeavePolicyItem[]): EmployeeLeavePolicyListData => ({

    items,

    total: items.length,

    page: 1,

    limit: items.length || 20,

  })



  if (Array.isArray(raw)) {

    return empty(raw as ApiEmployeeLeavePolicyItem[])

  }



  if (raw && typeof raw === 'object' && 'items' in raw) {

    const body = raw as EmployeeLeavePolicyListData

    const items = Array.isArray(body.items) ? body.items : []

    return {

      items,

      total: typeof body.total === 'number' ? body.total : items.length,

      page: typeof body.page === 'number' ? body.page : 1,

      limit: typeof body.limit === 'number' ? body.limit : items.length || 20,

      totalPages: body.totalPages,

    }

  }



  if (raw && typeof raw === 'object' && 'policies' in raw) {

    const policies = (raw as { policies: ApiEmployeeLeavePolicyItem[] }).policies

    const items = Array.isArray(policies) ? policies : []

    const body = raw as { total?: number; page?: number; limit?: number; totalPages?: number }

    return {

      items,

      total: typeof body.total === 'number' ? body.total : items.length,

      page: typeof body.page === 'number' ? body.page : 1,

      limit: typeof body.limit === 'number' ? body.limit : items.length || 20,

      totalPages: body.totalPages,

    }

  }



  return empty([])

}

function normalizeEmployeeLeavePolicyDashboard(raw: unknown): ApiEmployeeLeavePolicyDashboard {
  if (raw && typeof raw === 'object' && 'dashboard' in raw) {
    return (raw as { dashboard: ApiEmployeeLeavePolicyDashboard }).dashboard
  }
  if (raw && typeof raw === 'object') {
    return raw as ApiEmployeeLeavePolicyDashboard
  }
  return {}
}

function employeePolicyInvalidates(employeeId: string) {
  return [
    { type: 'Leave' as const, id: 'EMPLOYEE-POLICY-LIST' },
    { type: 'Leave' as const, id: 'EMPLOYEE-POLICY-HR-OVERVIEW' },
    { type: 'Leave' as const, id: 'EMPLOYEE-POLICY-DASHBOARD' },
    { type: 'Leave' as const, id: `EMPLOYEE-DASHBOARD-${employeeId}` },
    { type: 'Leave' as const, id: `EMPLOYEE-POLICY-${employeeId}` },
    { type: 'Leave' as const, id: 'BALANCE' },
    { type: 'Leave' as const, id: 'LIST' },
  ]
}

export const employeeLeavePoliciesApi = baseApi.injectEndpoints({

  endpoints: (build) => ({

    /** GET /employee-leave-policies/defaults — company entitlement defaults per leave type. */

    getEmployeeLeavePolicyDefaults: build.query<EmployeeLeavePolicyDefaultsData, void>({

      query: () => ({ url: '/employee-leave-policies/defaults' }),

      transformResponse: (response: ApiResponse<unknown>) =>

        normalizeEmployeeLeavePolicyDefaults(unwrapData(response)),

      providesTags: [{ type: 'Leave', id: 'EMPLOYEE-POLICY-DEFAULTS' }],

    }),

    /** GET /employee-leave-policies/hr-overview — paginated employee balance overview (HR). */

    getEmployeeLeavePolicyHrOverview: build.query<

      EmployeeLeavePolicyHrOverviewData,

      EmployeeLeavePolicyHrOverviewQuery | void

    >({

      query: (params) => ({

        url: '/employee-leave-policies/hr-overview',

        params: {

          page: params?.page ?? 1,

          limit: params?.limit ?? 20,

          ...(params?.year != null ? { year: params.year } : {}),

          ...(params?.departmentId ? { departmentId: params.departmentId } : {}),

          ...(params?.search ? { search: params.search } : {}),

        },

      }),

      transformResponse: (response: ApiResponse<unknown>) =>

        normalizeHrOverviewList(unwrapData(response)),

      providesTags: [{ type: 'Leave', id: 'EMPLOYEE-POLICY-HR-OVERVIEW' }],

    }),

    /** GET /employee-leave-policies — assigned policies for an employee (optionally by type/year). */

    getEmployeeLeavePolicies: build.query<EmployeeLeavePolicyListData, EmployeeLeavePolicyListQuery>({

      query: (params) => ({

        url: '/employee-leave-policies',

        params: {

          page: params.page ?? 1,

          limit: params.limit ?? 20,

          ...(params.employeeId ? { employeeId: params.employeeId } : {}),

          ...(params.leaveTypeId ? { leaveTypeId: params.leaveTypeId } : {}),

          ...(params.year != null ? { year: params.year } : {}),

        },

      }),

      transformResponse: (response: ApiResponse<unknown>) =>

        normalizeEmployeeLeavePolicyList(unwrapData(response)),

      providesTags: (result, _error, arg) =>

        result

          ? [

              { type: 'Leave', id: 'EMPLOYEE-POLICY-LIST' },

              ...(arg.employeeId

                ? [{ type: 'Leave' as const, id: `EMPLOYEE-POLICY-${arg.employeeId}` }]

                : []),

            ]

          : [{ type: 'Leave', id: 'EMPLOYEE-POLICY-LIST' }],

    }),

    /** GET /employee-leave-policies/{employeeId}/dashboard — self-service leave dashboard. */
    getEmployeeLeavePolicyDashboard: build.query<
      ApiEmployeeLeavePolicyDashboard,
      EmployeeLeavePolicyDashboardQuery
    >({
      query: ({ employeeId, year }) => ({
        url: `/employee-leave-policies/${encodeURIComponent(employeeId)}/dashboard`,
        params: year != null ? { year } : undefined,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeEmployeeLeavePolicyDashboard(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'Leave', id: 'EMPLOYEE-POLICY-DASHBOARD' },
        { type: 'Leave', id: `EMPLOYEE-DASHBOARD-${arg.employeeId}` },
      ],
    }),

  /** POST /employee-leave-policies — assign or update an employee leave policy. */
  assignEmployeeLeavePolicy: build.mutation<ApiEmployeeLeavePolicyItem, AssignEmployeeLeavePolicyBody>({
    query: (body) => ({ url: '/employee-leave-policies', method: 'POST', body }),
    transformResponse: (response: ApiResponse<unknown>) => {
      const raw = unwrapData(response)
      if (raw && typeof raw === 'object') return raw as ApiEmployeeLeavePolicyItem
      return {}
    },
    invalidatesTags: (_result, _error, arg) => employeePolicyInvalidates(arg.employeeId),
  }),

  /** POST /employee-leave-policies/assign-defaults */
  assignEmployeeLeaveDefaults: build.mutation<unknown, AssignEmployeeLeaveDefaultsBody>({
    query: (body) => ({ url: '/employee-leave-policies/assign-defaults', method: 'POST', body }),
    transformResponse: (response: ApiResponse<unknown>) => unwrapData(response),
    invalidatesTags: (_result, _error, arg) => employeePolicyInvalidates(arg.employeeId),
  }),

  }),

})



export const {

  useGetEmployeeLeavePolicyDefaultsQuery,

  useGetEmployeeLeavePolicyHrOverviewQuery,

  useGetEmployeeLeavePoliciesQuery,
  useGetEmployeeLeavePolicyDashboardQuery,
  useAssignEmployeeLeavePolicyMutation,
  useAssignEmployeeLeaveDefaultsMutation,
} = employeeLeavePoliciesApi
