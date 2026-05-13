import { useState, useEffect } from "react";

import { Check, X, Inbox, ArrowLeftRight } from "lucide-react";
import type { BorrowRequest } from "../entities/borrow-request";
import { requestsService } from "../services";
import { useIncomingRequests } from "../features/requests/useRequests";
import { useToast } from "../app/providers/ToastContext";
import { StatusChip } from "../shared/ui/StatusChip";
import { SectionHeader } from "../shared/ui/SectionHeader";
import { EmptyState } from "../shared/ui/EmptyState";
import { ErrorState } from "../shared/ui/ErrorState";
import { SkeletonRow } from "../shared/ui/SkeletonCard";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const Th = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <th
    className={`px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 md:px-8 ${className}`}
  >
    {children}
  </th>
);

const Stat = ({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "primary" | "tertiary" | "outline" | "success";
}) => {
  const colorMap = {
    primary: "font-bold text-primary",
    tertiary: "font-bold text-tertiary",
    outline: "font-bold text-on-surface-variant",
    success: "font-bold text-success",
  };
  return (
    <div className="flex items-center gap-2 rounded-lg border border-outline-variant/10 bg-surface-container-low px-4 py-2">
      <span className={colorMap[tone]}>{value}</span>
      <span className="text-xs uppercase tracking-[0.16em] text-white/40">
        {label}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export const RequestsPage = () => {
  const { showToast } = useToast();
  const {
    data: fetchedRequests,
    isLoading,
    error,
    refetch,
  } = useIncomingRequests();

  const [requests, setRequests] = useState<BorrowRequest[] | null>(null);
  const [processing, setProcessing] = useState<Set<number>>(new Set());

  // Keep local copy in sync with fetched data (only when we don't have one yet)
  useEffect(() => {
    if (fetchedRequests && !requests) {
      setRequests(fetchedRequests);
    }
  }, [fetchedRequests, requests]);

  const displayRequests: BorrowRequest[] = requests ?? fetchedRequests ?? [];

  // Derived stats
  const pendingCount = displayRequests.filter(
    (r) => r.status === "Pending",
  ).length;
  const acceptedCount = displayRequests.filter(
    (r) => r.status === "Accepted",
  ).length;
  const rejectedCount = displayRequests.filter(
    (r) => r.status === "Rejected",
  ).length;
  const returnedCount = displayRequests.filter(
    (r) => r.status === "Returned",
  ).length;

  const handleRespond = async (id: number, status: "Accepted" | "Rejected") => {
    setProcessing((prev) => new Set(prev).add(id));
    try {
      const updated = await requestsService.respond(id, status);
      setRequests((prev) =>
        (prev ?? []).map((r) => (r.id === updated.id ? updated : r)),
      );
      showToast(
        status === "Accepted"
          ? "Request accepted successfully."
          : "Request rejected.",
        status === "Accepted" ? "success" : "info",
      );
    } catch {
      showToast("Failed to update request. Please try again.", "error");
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReturn = async (id: number) => {
    setProcessing((prev) => new Set(prev).add(id));
    try {
      const updated = await requestsService.returnBook(id);
      setRequests((prev) =>
        (prev ?? []).map((r) => (r.id === updated.id ? updated : r)),
      );
      showToast("Book marked as returned successfully.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to mark as returned. Please try again.",
        "error",
      );
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAccept = (id: number) => handleRespond(id, "Accepted");
  const handleReject = (id: number) => handleRespond(id, "Rejected");

  // ------ Loading state ------
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader label="Management" title="Borrow Requests" />
          <div className="flex gap-3">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/[0.06]" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ------ Error state ------
  if (error) {
    return (
      <div className="py-8">
        <SectionHeader label="Management" title="Borrow Requests" />
        <ErrorState
          message={error || "Failed to load borrow requests."}
          onRetry={refetch}
        />
      </div>
    );
  }

  // ------ Empty state ------
  if (displayRequests.length === 0) {
    return (
      <div className="py-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader label="Management" title="Borrow Requests" />
        </div>
        <EmptyState
          icon={<Inbox className="h-8 w-8 text-on-surface-variant" />}
          title="No incoming requests yet"
          description="When readers request to borrow your books, their requests will appear here."
        />
      </div>
    );
  }

  // ------ Full table ------
  return (
    <div className="py-8">
      {/* Header + Stats */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          label="Management"
          title="Borrow Requests"
          description={`You have ${pendingCount} pending request${pendingCount !== 1 ? "s" : ""} awaiting your response.`}
        />
        <div className="flex flex-wrap gap-3">
          <Stat value={pendingCount} label="Pending" tone="tertiary" />
          <Stat value={acceptedCount} label="Accepted" tone="primary" />
          <Stat value={returnedCount} label="Returned" tone="success" />
          <Stat value={rejectedCount} label="Rejected" tone="outline" />
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl bg-surface-container-low shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-surface-container/60">
                <Th>Reader</Th>
                <Th>Book Title</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {displayRequests.map((request) => {
                const isProcessing = processing.has(request.id);
                const isPending = request.status === "Pending";
                const isAccepted = request.status === "Accepted";

                return (
                  <tr
                    key={request.id}
                    className="border-t border-outline-variant/15 transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Reader */}
                    <td className="px-6 py-5 md:px-8">
                      <div className="flex items-center gap-4">
                        {request.readerAvatarUrl ? (
                          <img
                            className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                            src={request.readerAvatarUrl}
                            alt={request.readerName}
                          />
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/30 ring-2 ring-primary/20">
                            <span className="text-sm font-bold text-primary">
                              {request.readerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <p className="font-bold text-on-surface">
                          {request.readerName}
                        </p>
                      </div>
                    </td>

                    {/* Book Title */}
                    <td className="px-6 py-5 font-medium text-on-surface md:px-8">
                      {request.bookTitle}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5 text-sm text-on-surface-variant md:px-8">
                      {new Date(request.requestedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 md:px-8">
                      <StatusChip status={request.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right md:px-8">
                      {isPending ? (
                        <div className="inline-flex items-center gap-2">
                          {/* Accept */}
                          <button
                            type="button"
                            onClick={() => handleAccept(request.id)}
                            disabled={isProcessing}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-container px-4 text-xs font-bold uppercase tracking-[0.12em] text-white transition-all hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`Accept request from ${request.readerName}`}
                          >
                            {isProcessing ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Accept
                          </button>

                          {/* Reject */}
                          <button
                            type="button"
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-high text-on-surface-variant transition-all hover:border-error/50 hover:bg-error/10 hover:text-error active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`Reject request from ${request.readerName}`}
                          >
                            {isProcessing ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-surface-variant/30 border-t-on-surface-variant" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ) : isAccepted ? (
                        <button
                          type="button"
                          onClick={() => handleReturn(request.id)}
                          disabled={isProcessing}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-high px-4 text-xs font-bold tracking-wide text-on-surface transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Mark book returned from ${request.readerName}`}
                        >
                          {isProcessing ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-surface-variant/30 border-t-on-surface-variant" />
                          ) : (
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                          )}
                          Mark Returned
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant/50">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
