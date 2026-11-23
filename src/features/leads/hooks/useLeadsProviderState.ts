/**
 * Provider state for LeadsProvider.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  addLeadAttachment,
  addLeadNote,
  checkLeadDuplicates,
  createLead,
  deleteLead,
  fetchLeads,
  summarizeLeads,
  updateLead,
} from '../services/leadsService'
import type { LeadInput } from '../types/lead'

export function useLeadsProviderState() {
  const [leads, setLeads] = useState<Awaited<ReturnType<typeof fetchLeads>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchLeads()
      .then((data) => {
        setLeads(data)
        setLoading(false)
      })
      .catch((cause: Error) => {
        setError(cause.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => load(), 0)
    return () => window.clearTimeout(handle)
  }, [load])

  const summary = useMemo(() => summarizeLeads(leads), [leads])

  const handleCreate = useCallback(async (input: LeadInput) => {
    const saved = await createLead(input)
    setLeads((current) => [saved, ...current])
    return saved
  }, [])

  const handleUpdate = useCallback(async (id: string, input: LeadInput) => {
    const saved = await updateLead(id, input)
    setLeads((current) => current.map((item) => (item.id === id ? saved : item)))
    return saved
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    await deleteLead(id)
    setLeads((current) => current.filter((item) => item.id !== id))
    setSelectedLeadId((current) => (current === id ? null : current))
  }, [])

  const handleNote = useCallback(async (leadId: string, text: string) => {
    const saved = await addLeadNote(leadId, text)
    setLeads((current) => current.map((item) => (item.id === leadId ? saved : item)))
    return saved
  }, [])

  const handleAttachment = useCallback(async (leadId: string, fileName: string) => {
    const saved = await addLeadAttachment(leadId, fileName)
    setLeads((current) => current.map((item) => (item.id === leadId ? saved : item)))
    return saved
  }, [])

  return {
    leads,
    loading,
    error,
    summary,
    reload: load,
    createLead: handleCreate,
    updateLead: handleUpdate,
    deleteLead: handleDelete,
    addNote: handleNote,
    addAttachment: handleAttachment,
    checkDuplicates: checkLeadDuplicates,
    selectedLeadId,
    setSelectedLeadId,
  }
}