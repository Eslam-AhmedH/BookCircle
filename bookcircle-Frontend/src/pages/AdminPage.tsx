import { useState, useEffect } from "react";
import { Check, X, Users, BookOpen, ShieldCheck } from "lucide-react";
import type { UserProfile } from "../entities/user";
import type { Book } from "../entities/book";
import { adminService } from "../services";
import { usePendingUsers, usePendingBooks } from "../features/admin/useAdmin";
import { useToast } from "../app/providers/ToastContext";
import { SectionHeader } from "../shared/ui/SectionHeader";
import { EmptyState } from "../shared/ui/EmptyState";
import { ErrorState } from "../shared/ui/ErrorState";
import { SkeletonCard, SkeletonRow } from "../shared/ui/SkeletonCard";

// ---------------------------------------------------------------------------
// Role badge
// ---------------------------------------------------------------------------

const roleBadgeClass: Record<string, string> = {
  Admin: "bg-primary/15 text-primary",
  Owner: "bg-secondary-container/40 text-on-surface",
  Reader: "bg-outline-variant/30 text-on-surface-variant",
};

// ---------------------------------------------------------------------------
// UserCard
// ---------------------------------------------------------------------------

interface UserCardProps {
  user: UserProfile;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const UserCard = ({
  user,
  isProcessing,
  onApprove,
  onReject,
}: UserCardProps) => (
  <article className="flex flex-col gap-4 rounded-xl bg-surface-container-high p-5 shadow-soft transition-colors hover:bg-surface-container-highest">
    <div className="flex items-start gap-4">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.fullName}
          className="h-14 w-14 flex-shrink-0 rounded-full object-cover ring-2 ring-primary/20"
        />
      ) : (
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/30 ring-2 ring-primary/20">
          <span className="text-xl font-bold text-primary">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="truncate font-bold text-on-surface">
            {user.fullName}
          </h3>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
              roleBadgeClass[user.role] ??
              "bg-outline-variant/30 text-on-surface-variant"
            }`}
          >
            {user.role}
          </span>
        </div>
        <p className="truncate text-sm text-on-surface-variant">{user.email}</p>
      </div>
    </div>

    <div className="flex gap-3">
      <button
        type="button"
        onClick={onApprove}
        disabled={isProcessing}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-container py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Approve
      </button>
      <button
        type="button"
        onClick={onReject}
        disabled={isProcessing}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant transition-all hover:border-error/40 hover:bg-error/10 hover:text-error active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-surface-variant/30 border-t-on-surface-variant" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
        Reject
      </button>
    </div>
  </article>
);

// ---------------------------------------------------------------------------
// BookCard
// ---------------------------------------------------------------------------

interface BookCardProps {
  book: Book;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const BookCard = ({
  book,
  isProcessing,
  onApprove,
  onReject,
}: BookCardProps) => (
  <article className="overflow-hidden rounded-xl bg-surface-container-high shadow-soft">
    <div className="relative h-52 overflow-hidden">
      <img
        src={book.coverImageUrl}
        alt={book.title}
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <span className="inline-flex items-center rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm">
          {book.genre}
        </span>
      </div>
    </div>

    <div className="p-4">
      <h3 className="mb-0.5 truncate font-bold text-on-surface">
        {book.title}
      </h3>
      <p className="mb-0.5 truncate text-sm font-medium text-primary">
        by {book.author}
      </p>
      <p className="mb-4 truncate text-xs text-on-surface-variant">
        Submitted by{" "}
        <span className="font-semibold text-on-surface">{book.ownerName}</span>
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onApprove}
          disabled={isProcessing}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary-container to-secondary-container py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={isProcessing}
          aria-label={`Reject ${book.title}`}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant transition-all hover:border-error/40 hover:bg-error/10 hover:text-error active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-surface-variant/30 border-t-on-surface-variant" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  </article>
);

// ---------------------------------------------------------------------------
// Section badge — shows count pill
// ---------------------------------------------------------------------------

const CountPill = ({
  count,
  tone,
}: {
  count: number;
  tone: "primary" | "tertiary";
}) => (
  <span
    className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-xs font-bold ${
      tone === "primary"
        ? "bg-primary/20 text-primary"
        : "bg-tertiary/20 text-tertiary"
    }`}
  >
    {count}
  </span>
);

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export const AdminPage = () => {
  const { showToast } = useToast();

// ── Pending Users ──────────────────────────────────────────────────────────
  const {
    data: fetchedUsers,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = usePendingUsers();

  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (fetchedUsers) setUsers(fetchedUsers);
  }, [fetchedUsers]);

  const displayUsers: UserProfile[] = users ?? fetchedUsers ?? [];

// ── Pending Books ──────────────────────────────────────────────────────────
  const {
    data: fetchedBooks,
    isLoading: booksLoading,
    error: booksError,
    refetch: refetchBooks,
  } = usePendingBooks();

  const [books, setBooks] = useState<Book[] | null>(null);
  const [processingBooks, setProcessingBooks] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (fetchedBooks) setBooks(fetchedBooks);
  }, [fetchedBooks]);

  const displayBooks: Book[] = books ?? fetchedBooks ?? [];

// ── User handlers ──────────────────────────────────────────────────────────

  const handleApproveUser = async (userId: string, userName: string) => {
    setProcessingUsers((prev) => new Set(prev).add(userId));
    try {
      await adminService.approveUser(userId);
      setUsers((prev) => (prev ?? []).filter((u) => u.id !== userId));
      showToast(`${userName} has been approved successfully.`, "success");
    } catch {
      showToast("Failed to approve user. Please try again.", "error");
    } finally {
      setProcessingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleRejectUser = async (userId: string, userName: string) => {
    setProcessingUsers((prev) => new Set(prev).add(userId));
    try {
      await adminService.rejectUser(userId);
      setUsers((prev) => (prev ?? []).filter((u) => u.id !== userId));
      showToast(`${userName}'s application has been rejected.`, "info");
    } catch {
      showToast("Failed to reject user. Please try again.", "error");
    } finally {
      setProcessingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

// ── Book handlers ──────────────────────────────────────────────────────────

  const handleApproveBook = async (bookId: number, bookTitle: string) => {
    setProcessingBooks((prev) => new Set(prev).add(bookId));
    try {
      await adminService.approveBook(bookId);
      setBooks((prev) => (prev ?? []).filter((b) => b.id !== bookId));
      showToast(`"${bookTitle}" has been approved and is now live.`, "success");
    } catch {
      showToast("Failed to approve book. Please try again.", "error");
    } finally {
      setProcessingBooks((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    }
  };

  const handleRejectBook = async (bookId: number, bookTitle: string) => {
    setProcessingBooks((prev) => new Set(prev).add(bookId));
    try {
      await adminService.rejectBook(bookId);
      setBooks((prev) => (prev ?? []).filter((b) => b.id !== bookId));
      showToast(`"${bookTitle}" has been rejected.`, "info");
    } catch {
      showToast("Failed to reject book. Please try again.", "error");
    } finally {
      setProcessingBooks((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    }
  };

// ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="py-8">
      {/* Page header */}
      <div className="mb-12">
        <SectionHeader
          label="Admin Panel"
          title="Moderation Dashboard"
          description="Review and approve pending member applications and book submissions before they go live."
        />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* ═══════════════════ USERS SECTION ═══════════════════ */}
        <section className="flex flex-col gap-6 lg:col-span-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-on-surface">
                  Curator Applications
                </h2>
                {!usersLoading && !usersError && (
                  <p className="text-xs text-on-surface-variant">
                    {displayUsers.length} pending
                  </p>
                )}
              </div>
            </div>
            {!usersLoading && !usersError && displayUsers.length > 0 && (
              <CountPill count={displayUsers.length} tone="primary" />
            )}
          </div>

          {/* Loading */}
          {usersLoading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!usersLoading && usersError && (
            <ErrorState
              message={
                usersError || "Failed to load pending users."
              }
              onRetry={refetchUsers}
            />
          )}

          {/* Empty */}
          {!usersLoading && !usersError && displayUsers.length === 0 && (
            <EmptyState
              icon={<ShieldCheck className="h-7 w-7 text-on-surface-variant" />}
              title="No pending applications"
              description="All member applications have been reviewed. Check back later."
            />
          )}

          {/* Cards */}
          {!usersLoading && !usersError && displayUsers.length > 0 && (
            <div className="flex flex-col gap-4">
              {displayUsers.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  isProcessing={processingUsers.has(u.id)}
                  onApprove={() => handleApproveUser(u.id, u.fullName)}
                  onReject={() => handleRejectUser(u.id, u.fullName)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════ BOOKS SECTION ═══════════════════ */}
        <section className="flex flex-col gap-6 lg:col-span-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary/10">
                <BookOpen className="h-5 w-5 text-tertiary" />
              </div>
              <div>
                <h2 className="font-bold text-on-surface">Book Post Queue</h2>
                {!booksLoading && !booksError && (
                  <p className="text-xs text-on-surface-variant">
                    {displayBooks.length} awaiting review
                  </p>
                )}
              </div>
            </div>
            {!booksLoading && !booksError && displayBooks.length > 0 && (
              <CountPill count={displayBooks.length} tone="tertiary" />
            )}
          </div>

          {/* Loading */}
          {booksLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!booksLoading && booksError && (
            <ErrorState
              message={
                booksError || "Failed to load pending books."
              }
              onRetry={refetchBooks}
            />
          )}

          {/* Empty */}
          {!booksLoading && !booksError && displayBooks.length === 0 && (
            <EmptyState
              icon={<BookOpen className="h-7 w-7 text-on-surface-variant" />}
              title="No books in queue"
              description="All book submissions have been reviewed. New submissions will appear here automatically."
            />
          )}

          {/* Cards */}
          {!booksLoading && !booksError && displayBooks.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {displayBooks.map((b) => (
                <BookCard
                  key={b.id}
                  book={b}
                  isProcessing={processingBooks.has(b.id)}
                  onApprove={() => handleApproveBook(b.id, b.title)}
                  onReject={() => handleRejectBook(b.id, b.title)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
