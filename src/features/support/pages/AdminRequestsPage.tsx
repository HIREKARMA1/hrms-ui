import { Headphones } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AdminRequestReplyDialog } from '../components/AdminRequestReplyDialog'
import { AdminRequestsTable } from '../components/AdminRequestsTable'
import { SupportMockBanner } from '../components/SupportMockBanner'
import { useAdminSupportRequests } from '../hooks/useAdminSupportRequests'
import { deleteAdminSupportRequest } from '../services/adminSupportStore'
import type { AdminRequestStatus, AdminSupportRequest } from '../types/adminSupportRequest'

export function AdminRequestsPage() {
  const requests = useAdminSupportRequests()
  const [statusFilter, setStatusFilter] = useState<AdminRequestStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return requests.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (!q) return true
      return (
        item.email.toLowerCase().includes(q) ||
        item.employeeId?.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      )
    })
  }, [requests, search, statusFilter])

  const activeRequest =
    requests.find((item) => item.id === activeRequestId) ?? null

  const openCount = requests.filter((item) => item.status === 'open').length

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const openReply = (request: AdminSupportRequest) => {
    setActiveRequestId(request.id)
    setDialogOpen(true)
  }

  const handleDelete = (request: AdminSupportRequest) => {
    const confirmed = window.confirm(
      `Delete request ${request.id} for ${request.email}? This cannot be undone.`,
    )
    if (!confirmed) return

    const deleted = deleteAdminSupportRequest(request.id)
    if (!deleted) {
      setToast('Could not delete this request.')
      return
    }

    if (activeRequestId === request.id) {
      setActiveRequestId(null)
      setDialogOpen(false)
    }
    setToast(`Request ${request.id} deleted (demo).`)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-1">
      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-center text-sm text-slate-700 shadow-lg"
        >
          {toast}
        </div>
      ) : null}

      <header className="border-b border-hrms-border pb-4 pt-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Headphones className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Request
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Employee sign-in and access help from the contact form.
                {openCount > 0 ? (
                  <span className="ml-1 font-semibold text-amber-700">
                    {openCount} open
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 max-w-2xl">
          <SupportMockBanner scope="hr" />
        </div>
      </header>

      <AdminRequestsTable
        requests={filtered}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
        onReply={openReply}
        onDelete={handleDelete}
      />

      <AdminRequestReplyDialog
        request={activeRequest}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onReplied={(email) =>
          setToast(`Reply recorded (demo). Would be sent to ${email}.`)
        }
      />
    </div>
  )
}

export default AdminRequestsPage