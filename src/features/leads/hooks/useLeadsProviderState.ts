/**
 * Provider state for LeadsProvider — wired to RTK Query leads API.
 */

import { useCallback, useMemo, useState } from 'react'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { EMPLOYEE_MAX_TAKE, useListEmployeesQuery } from '@/features/employees/api/employeesApi'

import {
  LEADS_MAX_LIMIT,
  getLeadErrorMessage,
  useAddLeadNoteMutation,
  useAssignLeadMutation,
  useCheckLeadDuplicatesMutation,
  useCreateLeadMutation,
  useDeleteLeadMutation,
  useGetLeadAnalyticsQuery,
  useLazyGetLeadQuery,
  useListLeadsQuery,
  useUpdateLeadMutation,
  useUpdateLeadPriorityMutation,
  useUpdateLeadStatusMutation,
} from '../api/leadsApi'
import type { LeadsListQuery } from '../context/leadsContext'
import type { Lead, LeadDuplicateMatch, LeadInput, LeadPriority, LeadStatus } from '../types/lead'
import {
  buildCreateLeadBody,
  buildUpdateLeadBody,
  leadPriorityToApi,
  leadStatusToApi,
  mapBackendLeadToUi,
} from '../utils/mapLeadFromApi'
import { summarizeLeads } from '../utils/summarizeLeads'

const DEFAULT_QUERY: LeadsListQuery = {
  page: 1,
  limit: LEADS_MAX_LIMIT,
  search: '',
  status: 'All',
  priority: 'All',
}

export function useLeadsProviderState() {
  const { user } = useAuthenticatedUser()
  const [listQuery, setListQueryState] = useState<LeadsListQuery>(DEFAULT_QUERY)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const listArgs = useMemo(
    () => ({
      page: listQuery.page,
      limit: listQuery.limit,
      search: listQuery.search.trim() || undefined,
      status: listQuery.status === 'All' ? undefined : leadStatusToApi(listQuery.status),
      priority:
        listQuery.priority === 'All' ? undefined : leadPriorityToApi(listQuery.priority),
      assignedEmployeeId: listQuery.assignedEmployeeId,
    }),
    [listQuery],
  )

  const {
    data: page,
    isLoading,
    isFetching,
    error: listError,
    refetch,
  } = useListLeadsQuery(listArgs)

  const canViewAnalytics = Boolean(user?.permissions?.includes('leads:analytics'))
  const { data: analytics, isLoading: analyticsLoading } = useGetLeadAnalyticsQuery(
    undefined,
    { skip: !canViewAnalytics },
  )

  const [createLeadMutation] = useCreateLeadMutation()
  const [updateLeadMutation] = useUpdateLeadMutation()
  const [deleteLeadMutation] = useDeleteLeadMutation()
  const [assignLeadMutation] = useAssignLeadMutation()
  const [updateStatusMutation] = useUpdateLeadStatusMutation()
  const [updatePriorityMutation] = useUpdateLeadPriorityMutation()
  const [addNoteMutation] = useAddLeadNoteMutation()
  const [checkDuplicatesMutation] = useCheckLeadDuplicatesMutation()
  const [fetchLead] = useLazyGetLeadQuery()

  // Prefetch employees for assignee labels when the viewer can list them.
  useListEmployeesQuery(
    { skip: 0, take: EMPLOYEE_MAX_TAKE },
    { skip: !user?.permissions?.includes('employees:read') },
  )

  const leads = useMemo(
    () => (page?.items ?? []).map(mapBackendLeadToUi),
    [page?.items],
  )

  const summary = useMemo(() => summarizeLeads(leads), [leads])

  const pagination = page?.pagination ?? {
    page: listQuery.page,
    limit: listQuery.limit,
    total: 0,
    totalPages: 0,
  }

  const setListQuery = useCallback((patch: Partial<LeadsListQuery>) => {
    setListQueryState((current) => ({
      ...current,
      ...patch,
      page: patch.page ?? (patch.search !== undefined || patch.status || patch.priority ? 1 : current.page),
    }))
  }, [])

  const createLead = useCallback(
    async (input: LeadInput) => {
      const created = await createLeadMutation(buildCreateLeadBody(input)).unwrap()
      let result = created
      if (
        input.assignedEmployeeId &&
        input.assignedEmployeeId !== created.assignedEmployee?.id
      ) {
        result = await assignLeadMutation({
          id: created.id,
          body: { employeeId: input.assignedEmployeeId },
        }).unwrap()
      }
      return mapBackendLeadToUi(result)
    },
    [assignLeadMutation, createLeadMutation],
  )

  const updateLead = useCallback(
    async (id: string, input: LeadInput) => {
      let result = await updateLeadMutation({
        id,
        body: buildUpdateLeadBody(input),
      }).unwrap()

      const current = mapBackendLeadToUi(result)
      if (input.priority !== current.priority) {
        result = await updatePriorityMutation({
          id,
          body: { priority: leadPriorityToApi(input.priority) },
        }).unwrap()
      }
      if (input.status !== current.status) {
        result = await updateStatusMutation({
          id,
          body: { status: leadStatusToApi(input.status) },
        }).unwrap()
      }
      if (
        input.assignedEmployeeId &&
        input.assignedEmployeeId !== result.assignedEmployee?.id
      ) {
        result = await assignLeadMutation({
          id,
          body: { employeeId: input.assignedEmployeeId },
        }).unwrap()
      }
      return mapBackendLeadToUi(result)
    },
    [assignLeadMutation, updateLeadMutation, updatePriorityMutation, updateStatusMutation],
  )

  const updateLeadStatus = useCallback(
    async (id: string, status: LeadStatus) => {
      const result = await updateStatusMutation({
        id,
        body: { status: leadStatusToApi(status) },
      }).unwrap()
      return mapBackendLeadToUi(result)
    },
    [updateStatusMutation],
  )

  const updateLeadPriority = useCallback(
    async (id: string, priority: LeadPriority) => {
      const result = await updatePriorityMutation({
        id,
        body: { priority: leadPriorityToApi(priority) },
      }).unwrap()
      return mapBackendLeadToUi(result)
    },
    [updatePriorityMutation],
  )

  const assignLead = useCallback(
    async (id: string, employeeId: string) => {
      const result = await assignLeadMutation({
        id,
        body: { employeeId },
      }).unwrap()
      return mapBackendLeadToUi(result)
    },
    [assignLeadMutation],
  )

  const deleteLead = useCallback(
    async (id: string) => {
      await deleteLeadMutation(id).unwrap()
      setSelectedLeadId((current) => (current === id ? null : current))
    },
    [deleteLeadMutation],
  )

  const addNote = useCallback(
    async (leadId: string, text: string) => {
      const result = await addNoteMutation({
        id: leadId,
        body: { body: text.trim() },
      }).unwrap()
      return mapBackendLeadToUi(result)
    },
    [addNoteMutation],
  )

  const addAttachment = useCallback(async (_leadId: string, _fileName: string) => {
    throw new Error(
      'File uploads are not available yet. Set attachmentUrl when creating or updating a lead.',
    )
  }, [])

  const checkDuplicates = useCallback(
    async (
      input: Pick<Lead, 'email' | 'phone' | 'companyName'>,
      excludeId?: string,
    ): Promise<LeadDuplicateMatch[]> => {
      const email = input.email.trim()
      const phone = input.phone.trim()
      if (!email && !phone) return []
      const result = await checkDuplicatesMutation({
        ...(email ? { email: email.toLowerCase() } : {}),
        ...(phone ? { phone } : {}),
      }).unwrap()
      return result.matches
        .filter((match) => match.id !== excludeId)
        .map((match) => ({
          lead: {
            id: match.id,
            leadName: match.fullName,
            companyName: '',
            contactPerson: match.fullName,
            email: match.email,
            phone: match.phone,
            website: '',
            industry: '',
            companySize: '',
            source: '',
            sourceId: '',
            category: '',
            categoryId: null,
            priority: 'Medium' as LeadPriority,
            status: 'New' as LeadStatus,
            estimatedValue: null,
            attachmentUrl: null,
            assignedEmployeeId: null,
            assignedEmployeeName: null,
            assignedByEmployeeId: null,
            assignedByEmployeeName: null,
            createdByEmployeeId: null,
            createdByEmployeeName: null,
            description: '',
            requirements: '',
            notes: [],
            activities: [],
            attachments: [],
            createdAt: '',
            updatedAt: '',
          },
          reasons: [
            email && match.email.toLowerCase() === email.toLowerCase() ? 'email' : null,
            phone && match.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')
              ? 'phone'
              : null,
          ].filter(Boolean) as string[],
        }))
    },
    [checkDuplicatesMutation],
  )

  const getLeadDetail = useCallback(
    async (id: string) => {
      const result = await fetchLead(id).unwrap()
      return mapBackendLeadToUi(result)
    },
    [fetchLead],
  )

  const error = listError
    ? getLeadErrorMessage(listError, 'Failed to load leads')
    : null

  return {
    leads,
    loading: isLoading || (isFetching && !page),
    error,
    summary,
    analytics: analytics ?? null,
    analyticsLoading,
    pagination,
    listQuery,
    setListQuery,
    reload: () => {
      void refetch()
    },
    createLead,
    updateLead,
    updateLeadStatus,
    updateLeadPriority,
    assignLead,
    deleteLead,
    addNote,
    addAttachment,
    checkDuplicates,
    selectedLeadId,
    setSelectedLeadId,
    getLeadDetail,
  }
}
