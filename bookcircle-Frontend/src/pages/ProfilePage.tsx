import { useNavigate } from "react-router-dom";
import {
  Settings,
  Plus,
  BookOpen,
  List,
  BookMarked,
  Pencil,
  TrendingUp,
  Library,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Book } from "../entities/book";
import type { ReadingList } from "../entities/reading-list";
import type { UserRole } from "../entities/user";
import { useAuth } from "../app/providers/AuthContext";
import { useOwnerBooks } from "../features/books/useBooks";
import { useReadingLists } from "../features/reading-list/useReadingList";
import { useMyRequests } from "../features/requests/useRequests";
import { navPaths, buildEditBookPath } from "../shared/config/routes";
import { Button } from "../shared/ui/Button";
import { StatusChip } from "../shared/ui/StatusChip";
import { SkeletonRow } from "../shared/ui/SkeletonCard";
import { ErrorState } from "../shared/ui/ErrorState";
import { EmptyState } from "../shared/ui/EmptyState";

// ─────────────────────────────────────────────────────────────────────────────
// Role badge styles
// ─────────────────────────────────────────────────────────────────────────────

const roleBadgeStyles: Record<UserRole, string> = {
  Admin: "bg-primary/15 text-primary",
  Owner: "bg-secondary-container/40 text-on-surface",
  Reader: "bg-outline-variant/30 text-on-surface-variant",
};

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  iconColorClass: string;
  bgColorClass: string;
}

const StatCard = ({
  label,
  value,
  icon,
  iconColorClass,
  bgColorClass,
}: StatCardProps) => (
  <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-5 shadow-ambient">
    <div
      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${bgColorClass}`}
    >
      <span className={iconColorClass}>{icon}</span>
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
        {label}
      </p>
      <p className="text-2xl font-extrabold tabular-nums text-on-surface">
        {value}
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// OwnerSection — first 3 books with edit links
// ─────────────────────────────────────────────────────────────────────────────

interface OwnerSectionProps {
  books: Book[];
  isLoading: boolean;
  error: unknown;
  onRefetch: () => void;
  onManageCollection: () => void;
  onAddBook: () => void;
  onEditBook: (id: number) => void;
}

const OwnerSection = ({
  books,
  isLoading,
  error,
  onRefetch,
  onManageCollection,
  onAddBook,
  onEditBook,
}: OwnerSectionProps) => {
  const previewBooks = books.slice(0, 3);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
            My Collection
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
            Recent Books
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onAddBook}>
            <Plus className="h-4 w-4" />
            Add New Book
          </Button>
          <Button onClick={onManageCollection}>
            <Library className="h-4 w-4" />
            Manage Collection
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && !!error && (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "Failed to load your books."
          }
          onRetry={onRefetch}
        />
      )}

      {/* Empty */}
      {!isLoading && !error && books.length === 0 && (
        <EmptyState
          icon={<BookOpen className="h-7 w-7 text-on-surface-variant" />}
          title="No books in your collection"
          description="Start sharing your library with the BookCircle community and connect with passionate readers."
          action={
            <Button onClick={onAddBook}>
              <Plus className="h-4 w-4" />
              Add Your First Book
            </Button>
          }
        />
      )}

      {/* Book list — first 3 items */}
      {!isLoading && !error && previewBooks.length > 0 && (
        <div className="flex flex-col gap-3">
          {previewBooks.map((book) => (
            <article
              key={book.id}
              className="group flex items-center gap-5 rounded-xl bg-surface-container-low p-4 transition-colors duration-200 hover:bg-surface-container-high"
            >
              {/* Cover thumbnail */}
              <div className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg shadow-soft">
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Book meta */}
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-bold text-on-surface">
                    {book.title}
                  </h3>
                  <StatusChip status={book.status} />
                  {!book.isApproved && (
                    <span className="inline-flex items-center rounded-md bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-tertiary">
                      Pending
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-on-surface-variant">
                  {book.author}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-primary">
                  ${book.borrowPrice.toFixed(2)} / borrow
                </p>
              </div>

              {/* Edit link — revealed on hover */}
              <button
                type="button"
                onClick={() => onEditBook(book.id)}
                aria-label={`Edit ${book.title}`}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-high text-on-surface-variant opacity-0 transition-all duration-200 group-hover:opacity-100 hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </article>
          ))}

          {/* Show more button when collection exceeds 3 */}
          {books.length > 3 && (
            <button
              type="button"
              onClick={onManageCollection}
              className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-low py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            >
              View all {books.length} books in your collection →
            </button>
          )}
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ReaderSection — reading lists with navigation CTAs
// ─────────────────────────────────────────────────────────────────────────────

interface ReaderSectionProps {
  readingLists: ReadingList[];
  isLoading: boolean;
  error: unknown;
  onRefetch: () => void;
  onReadingLists: () => void;
  onMyBorrows: () => void;
}

const ReaderSection = ({
  readingLists,
  isLoading,
  error,
  onRefetch,
  onReadingLists,
  onMyBorrows,
}: ReaderSectionProps) => (
  <section className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
          My Library
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
          Reading Lists
        </h2>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onMyBorrows}>
          <BookMarked className="h-4 w-4" />
          My Borrows
        </Button>
        <Button onClick={onReadingLists}>
          <List className="h-4 w-4" />
          My Reading Lists
        </Button>
      </div>
    </div>

    {/* Loading */}
    {isLoading && (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    )}

    {/* Error */}
    {!isLoading && !!error && (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : "Failed to load your reading lists."
        }
        onRetry={onRefetch}
      />
    )}

    {/* Empty */}
    {!isLoading && !error && readingLists.length === 0 && (
      <EmptyState
        icon={<List className="h-7 w-7 text-on-surface-variant" />}
        title="No reading lists yet"
        description="Organize your reading journey by creating your first curated list."
        action={
          <Button onClick={onReadingLists}>
            <Plus className="h-4 w-4" />
            Create a List
          </Button>
        }
      />
    )}

    {/* List items */}
    {!isLoading && !error && readingLists.length > 0 && (
      <div className="flex flex-col gap-3">
        {readingLists.map((list) => (
          <article
            key={list.id}
            className="flex items-center gap-4 rounded-xl bg-surface-container-low p-4 transition-colors duration-200 hover:bg-surface-container-high"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <List className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-on-surface">
                {list.name}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Created{" "}
                {new Date(list.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="flex-shrink-0 text-on-surface-variant/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </article>
        ))}

        {/* Manage all CTA */}
        <button
          type="button"
          onClick={onReadingLists}
          className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-low py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
        >
          Manage all reading lists →
        </button>
      </div>
    )}
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// ProfilePage — main export
// ─────────────────────────────────────────────────────────────────────────────

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwnerOrAdmin = user?.role === "Owner" || user?.role === "Admin";

  // All hooks called unconditionally — Rules of Hooks
  const {
    data: ownerBooks,
    isLoading: ownerBooksLoading,
    error: ownerBooksError,
    refetch: refetchOwnerBooks,
  } = useOwnerBooks(user?.id ?? "");

  const {
    data: readingLists,
    isLoading: readingListsLoading,
    error: readingListsError,
    refetch: refetchReadingLists,
  } = useReadingLists();

  const { data: myRequests } = useMyRequests();

  // Early return — guard unauthenticated state
  if (!user) return null;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleEditProfile = () => navigate(navPaths.settings);
  const handleManageCollection = () => navigate(navPaths.ownerDashboard);
  const handleAddBook = () => navigate(navPaths.addBook);
  const handleReadingLists = () => navigate(navPaths.readingList);
  const handleMyBorrows = () => navigate(navPaths.myBorrows);
  const handleEditBook = (id: number) => navigate(buildEditBookPath(id));

  // ── Derived stats ──────────────────────────────────────────────────────────

  const books = ownerBooks ?? [];
  const lists = readingLists ?? [];

  const totalOwnerBooks = books.length;
  const availableBooks = books.filter((b) => b.status === "Available").length;
  const borrowedBooks = books.filter((b) => b.status === "Borrowed").length;
  const totalLists = lists.length;
  const activeBorrows =
    myRequests?.filter((r) => r.status === "Accepted").length ?? 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10 py-8">
      {/* ── Profile Header ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          {/* Avatar */}
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover shadow-soft ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-container/30 shadow-soft ring-2 ring-primary/20">
              <span className="text-3xl font-extrabold text-primary">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Name + email + role */}
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
                {user.fullName}
              </h1>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${roleBadgeStyles[user.role]}`}
              >
                {user.role}
              </span>
            </div>
            <p className="truncate text-sm text-on-surface-variant">
              {user.email}
            </p>
          </div>
        </div>

        {/* Edit Profile CTA */}
        <Button
          variant="secondary"
          onClick={handleEditProfile}
          className="flex-shrink-0 self-start"
        >
          <Settings className="h-4 w-4" />
          Edit Profile
        </Button>
      </section>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <section
        className={`grid gap-4 ${
          isOwnerOrAdmin ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
        }`}
      >
        {isOwnerOrAdmin ? (
          <>
            <StatCard
              label="Total Books"
              value={totalOwnerBooks}
              icon={<Library className="h-5 w-5" />}
              iconColorClass="text-primary"
              bgColorClass="bg-primary/10"
            />
            <StatCard
              label="Available"
              value={availableBooks}
              icon={<BookOpen className="h-5 w-5" />}
              iconColorClass="text-primary-fixed"
              bgColorClass="bg-primary-fixed/10"
            />
            <StatCard
              label="Borrowed Out"
              value={borrowedBooks}
              icon={<TrendingUp className="h-5 w-5" />}
              iconColorClass="text-tertiary"
              bgColorClass="bg-tertiary/10"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Reading Lists"
              value={totalLists}
              icon={<List className="h-5 w-5" />}
              iconColorClass="text-primary"
              bgColorClass="bg-primary/10"
            />
            <StatCard
              label="Active Borrows"
              value={activeBorrows}
              icon={<BookMarked className="h-5 w-5" />}
              iconColorClass="text-tertiary"
              bgColorClass="bg-tertiary/10"
            />
          </>
        )}
      </section>

      {/* ── Role-specific Content Section ──────────────────────────────────── */}
      {isOwnerOrAdmin ? (
        <OwnerSection
          books={books}
          isLoading={ownerBooksLoading}
          error={ownerBooksError}
          onRefetch={refetchOwnerBooks}
          onManageCollection={handleManageCollection}
          onAddBook={handleAddBook}
          onEditBook={handleEditBook}
        />
      ) : (
        <ReaderSection
          readingLists={lists}
          isLoading={readingListsLoading}
          error={readingListsError}
          onRefetch={refetchReadingLists}
          onReadingLists={handleReadingLists}
          onMyBorrows={handleMyBorrows}
        />
      )}
    </div>
  );
};
