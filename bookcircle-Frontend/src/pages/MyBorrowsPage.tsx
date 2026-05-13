import { useState, useEffect } from "react"
import { BookOpen, Clock, CheckCircle, XCircle } from "lucide-react"
import { useMyRequests } from "../features/requests/useRequests"
import { StatusChip } from "../shared/ui/StatusChip"
import { EmptyState } from "../shared/ui/EmptyState"
import { ErrorState } from "../shared/ui/ErrorState"
import { SectionHeader } from "../shared/ui/SectionHeader"
import { SkeletonRow } from "../shared/ui/SkeletonCard"
import type { BorrowRequest } from "../entities/borrow-request"

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  colorClass: string
}

const StatCard = ({ icon, label, value, colorClass }: StatCardProps) => (
  <div className="flex items-center gap-4 rounded-xl bg-surface-container-high p-5">
    <div
      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colorClass}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-extrabold text-on-surface">{value}</p>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
        {label}
      </p>
    </div>
  </div>
)

interface RequestRowProps {
  request: BorrowRequest
}

const RequestRow = ({ request }: RequestRowProps) => (
  <tr className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-high/50">
    <td className="py-4 pl-4 pr-6">
      <div className="flex items-center gap-4">
        <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded-md bg-surface-container-high">
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-5 w-5 text-outline" />
          </div>
        </div>
        <div>
          <p className="font-bold text-on-surface leading-snug">
            {request.bookTitle}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Book #{request.bookId}
          </p>
        </div>
      </div>
    </td>
    <td className="px-4 py-4">
      <p className="text-sm text-on-surface-variant">
        {formatDate(request.requestedAt)}
      </p>
    </td>
    <td className="px-4 py-4">
      <div className="flex items-center gap-2">
        <StatusChip status={request.status} />
        {request.status === "Accepted" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-fixed">
            <CheckCircle className="h-3 w-3" />
            Borrowing
          </span>
        )}
      </div>
    </td>
  </tr>
)

interface RequestCardProps {
  request: BorrowRequest
}

const RequestCard = ({ request }: RequestCardProps) => (
  <div className="rounded-xl bg-surface-container-high p-4 transition-all hover:-translate-y-0.5">
    <div className="flex items-start gap-3">
      <div className="flex h-14 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-container-low">
        <BookOpen className="h-5 w-5 text-outline" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-on-surface leading-snug truncate">
          {request.bookTitle}
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">
          Requested {formatDate(request.requestedAt)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <StatusChip status={request.status} />
          {request.status === "Accepted" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-fixed">
              <CheckCircle className="h-3 w-3" />
              Borrowing
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
)

export const MyBorrowsPage = () => {
  const { data, isLoading, error, refetch } = useMyRequests()
  const [requests, setRequests] = useState<BorrowRequest[]>([])

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRequests(data)
    }
  }, [data])

  const totalRequests = requests.length
  const pendingCount = requests.filter((r) => r.status === "Pending").length
  const acceptedCount = requests.filter((r) => r.status === "Accepted").length
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length

  const sortedRequests = [...requests].sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
  )

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="mb-10 h-24 animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-white/[0.06]"
            />
          ))}
        </div>
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="py-8">
      <header className="mb-10">
        <SectionHeader
          label="Reader"
          title="My Borrow Requests"
          description="Track all your book borrow requests and their current status."
        />
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-on-surface-variant" />}
          label="Total Requests"
          value={totalRequests}
          colorClass="bg-surface-container-low"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-tertiary" />}
          label="Pending"
          value={pendingCount}
          colorClass="bg-tertiary-container/20"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-primary-fixed" />}
          label="Accepted"
          value={acceptedCount}
          colorClass="bg-primary-fixed/10"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-error" />}
          label="Rejected"
          value={rejectedCount}
          colorClass="bg-error/10"
        />
      </div>

      {sortedRequests.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7 text-primary" />}
          title="No borrow requests yet"
          description="Browse books and send a borrow request to start reading."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-low md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/15">
                  <th className="py-3 pl-4 pr-6 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    Book
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    Requested
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRequests.map((request) => (
                  <RequestRow key={request.id} request={request} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {sortedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
