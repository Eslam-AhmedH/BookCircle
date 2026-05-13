import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";
import type { Book } from "../entities/book";
import { booksService } from "../services";
import { useAuth } from "../app/providers/AuthContext";
import { useToast } from "../app/providers/ToastContext";
import { useOwnerBooks } from "../features/books/useBooks";
import { navPaths, buildEditBookPath } from "../shared/config/routes";
import { Button } from "../shared/ui/Button";
import { SectionHeader } from "../shared/ui/SectionHeader";
import { EmptyState } from "../shared/ui/EmptyState";
import { ErrorState } from "../shared/ui/ErrorState";
import { StatusChip } from "../shared/ui/StatusChip";
import { SkeletonCard } from "../shared/ui/SkeletonCard";

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: number;
  bgClass: string;
  iconColorClass: string;
  icon: React.ReactNode;
}

const StatCard = ({
  label,
  value,
  bgClass,
  iconColorClass,
  icon,
}: StatCardProps) => (
  <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-5 shadow-ambient">
    <div
      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${bgClass}`}
    >
      <span className={iconColorClass}>{icon}</span>
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
        {label}
      </p>
      <p className="text-3xl font-extrabold tabular-nums text-on-surface">
        {value}
      </p>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Book Card — horizontal layout
// ---------------------------------------------------------------------------

interface BookCardProps {
  book: Book;
  isDeleting: boolean;
  isBorrowed: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const BookCard = ({
  book,
  isDeleting,
  isBorrowed,
  onEdit,
  onDelete,
}: BookCardProps) => (
  <article className="group flex items-center gap-5 rounded-xl bg-surface-container-low p-4 shadow-soft transition-all duration-200 hover:bg-surface-container-high">
    {/* Cover thumbnail */}
    <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg shadow-ambient">
      <img
        src={book.coverImageUrl}
        alt={book.title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>

    {/* Book details */}
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="max-w-[24ch] truncate text-base font-bold text-on-surface">
          {book.title}
        </h3>
        <StatusChip status={book.status} />
        {book.isApproved ? (
          <span className="inline-flex items-center rounded-md bg-primary-fixed/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-fixed">
            Approved
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-tertiary">
            Pending Review
          </span>
        )}
      </div>

      <p className="mb-1.5 truncate text-sm font-medium text-on-surface-variant">
        {book.author}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/60">
        <span>{book.genre}</span>
        <span>·</span>
        <span className="font-semibold text-primary">
          ${book.borrowPrice.toFixed(2)} / borrow
        </span>
      </div>
    </div>

    {/*
 Action buttons — revealed on hover */}
    <div className="flex flex-shrink-0 items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${book.title}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-high text-on-surface-variant transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting || isBorrowed}
        title={
          isBorrowed
            ? "Cannot delete — book is currently borrowed"
            : "Delete book"
        }
        aria-label={`Delete ${book.title}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-high text-on-surface-variant transition-all hover:border-error/40 hover:bg-error/10 hover:text-error active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-surface-variant/30 border-t-on-surface-variant" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  </article>
);

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

const DashboardSkeleton = () => (
  <div className="py-8">
    {/* Header skeleton */}
    <div className="mb-10 flex items-start justify-between">
      <div className="space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-12 w-64 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 w-48 animate-pulse rounded bg-white/[0.06]" />
      </div>
      <div className="h-12 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
    </div>

    {/* Stats skeleton */}
    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl bg-white/[0.06]"
        />
      ))}
    </div>

    {/* Cards skeleton */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const {
    data: fetchedBooks,
    isLoading,
    error,
    refetch,
  } = useOwnerBooks(user?.id ?? "");

  const [books, setBooks] = useState<Book[] | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // Sync fetched data into local mutable state
  useEffect(() => {
    if (fetchedBooks) {
      setBooks(fetchedBooks);
    }
  }, [fetchedBooks]);

  const displayBooks: Book[] = books ?? fetchedBooks ?? [];

  // Derived stats
  const totalCount = displayBooks.length;
  const availableCount = displayBooks.filter(
    (b) => b.status === "Available",
  ).length;
  const borrowedCount = displayBooks.filter(
    (b) => b.status === "Borrowed",
  ).length;

  // --------------- Handlers ---------------

  const handleAddBook = () => {
    navigate(navPaths.addBook);
  };

  const handleEdit = (id: number) => {
    navigate(buildEditBookPath(id));
  };

  const handleDelete = async (book: Book) => {
    if (book.status === "Borrowed") {
      showToast("Cannot delete a book that is currently borrowed.", "error");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    // Optimistically remove from list
    setBooks((prev) => (prev ?? []).filter((b) => b.id !== book.id));
    setDeletingIds((prev) => new Set(prev).add(book.id));

    try {
      await booksService.delete(book.id);
      showToast(
        `"${book.title}" has been removed from your collection.`,
        "success",
      );
    } catch {
      // Rollback — re-insert in original position by id order
      setBooks((prev) => {
        const restored = prev ? [...prev, book] : [book];
        return restored.sort((a, b) => a.id - b.id);
      });
      showToast("Failed to delete the book. Please try again.", "error");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(book.id);
        return next;
      });
    }
  };

  // --------------- Render states ---------------

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="py-8">
        <SectionHeader label="My Shelf" title="Owner Dashboard" />
        <ErrorState
          message={error || "Failed to load your books. Please try again."}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (displayBooks.length === 0) {
    return (
      <div className="py-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            label="My Shelf"
            title="Owner Dashboard"
            description="You haven't listed any books yet. Start sharing your collection with the community."
          />
          <Button onClick={handleAddBook} className="flex-shrink-0">
            <Plus className="h-4 w-4" />
            Add New Book
          </Button>
        </div>
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-on-surface-variant" />}
          title="Your collection is empty"
          description="List your books with the BookCircle community and start lending your library to passionate readers."
          action={
            <Button onClick={handleAddBook} size="lg">
              <Plus className="h-4 w-4" />
              Add Your First Book
            </Button>
          }
        />
      </div>
    );
  }

  // --------------- Full dashboard ---------------

  return (
    <div className="py-6 lg:py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <SectionHeader
          label="My Shelf"
          title="Owner Dashboard"
          description={`Managing ${totalCount} book${totalCount !== 1 ? "s" : ""} in your personal collection.`}
        />
        <Button onClick={handleAddBook} className="flex-shrink-0">
          <Plus className="h-4 w-4" />
          Add New Book
        </Button>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:mb-10 sm:grid-cols-3">
        <StatCard
          label="Total Books"
          value={totalCount}
          bgClass="bg-primary/10"
          iconColorClass="text-primary"
          icon={<LayoutGrid className="h-5 w-5" />}
        />
        <StatCard
          label="Available"
          value={availableCount}
          bgClass="bg-primary-fixed/10"
          iconColorClass="text-primary-fixed"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          label="Borrowed"
          value={borrowedCount}
          bgClass="bg-tertiary/10"
          iconColorClass="text-tertiary"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Book list */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
            Your Books ({totalCount})
          </h2>
          {totalCount > 0 && (
            <p className="text-xs text-on-surface-variant/40">
              Hover a card to reveal actions
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {displayBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isDeleting={deletingIds.has(book.id)}
              isBorrowed={book.status === "Borrowed"}
              onEdit={() => handleEdit(book.id)}
              onDelete={() => handleDelete(book)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
