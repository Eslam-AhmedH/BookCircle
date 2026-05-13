import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Plus, X, BookMarked, List } from "lucide-react";
import {
  useReadingLists,
  useReadingListItems,
} from "../features/reading-list/useReadingList";
import { readingListService } from "../services";
import { useToast } from "../app/providers/ToastContext";
import { StatusChip } from "../shared/ui/StatusChip";
import { Button } from "../shared/ui/Button";
import { InputField } from "../shared/ui/InputField";
import { EmptyState } from "../shared/ui/EmptyState";
import { ErrorState } from "../shared/ui/ErrorState";
import { SkeletonCard } from "../shared/ui/SkeletonCard";
import { SectionHeader } from "../shared/ui/SectionHeader";
import { buildBookPath } from "../shared/config/routes";
import type { ReadingList, ReadingListItem } from "../entities/reading-list";
import { cn } from "../shared/lib/cn";

const SKELETON_KEYS = [
  "sk-a",
  "sk-b",
  "sk-c",
  "sk-d",
  "sk-e",
  "sk-f",
  "sk-g",
  "sk-h",
];

export const ReadingListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    data: listsData,
    isLoading: listsLoading,
    error: listsError,
    refetch: refetchLists,
  } = useReadingLists();

// Only track locally-created lists as delta — no useEffect mirror
  const [createdLists, setCreatedLists] = useState<ReadingList[]>([]);
// Explicit user selection; null means "default to first"
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
// Optimistic removes: track removed bookIds per-selection
  const [removedBookIds, setRemovedBookIds] = useState<Set<number>>(new Set());
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

// Derived: merge server lists with locally-created ones — no useEffect needed
  const allLists = useMemo(
    () => [...(listsData ?? []), ...createdLists],
    [listsData, createdLists],
  );

// Derived: resolve which list is active
  const effectiveSelectedId: number | null =
    selectedListId ?? allLists[0]?.id ?? null;

  const {
    data: itemsData,
    isLoading: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
  } = useReadingListItems(effectiveSelectedId);

// Derived: apply optimistic removes to the fetched items — no setState mirror
  const localItems = useMemo(
    () => (itemsData ?? []).filter((item) => !removedBookIds.has(item.bookId)),
    [itemsData, removedBookIds],
  );

// Click-outside: only registers a listener, never calls setState synchronously
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectList = (id: number) => {
    setSelectedListId(id);
    setRemovedBookIds(new Set());
    setOpenDropdownId(null);
  };

  const handleToggleDropdown = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setOpenDropdownId((prev) => (prev === itemId ? null : itemId));
  };

  const handleRemoveBook = async (
    e: React.MouseEvent,
    item: ReadingListItem,
  ) => {
    e.stopPropagation();
    if (effectiveSelectedId === null) return;
    setOpenDropdownId(null);
// Optimistic: add to removed set immediately
    setRemovedBookIds((prev) => new Set([...prev, item.bookId]));
    try {
      await readingListService.removeBook(effectiveSelectedId, item.bookId);
      showToast(`"${item.title}" removed from list`, "success");
    } catch {
// Rollback on failure
      setRemovedBookIds((prev) => {
        const next = new Set(prev);
        next.delete(item.bookId);
        return next;
      });
      showToast("Failed to remove book. Please try again.", "error");
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newListName.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      const created = await readingListService.createList(trimmed);
      setCreatedLists((prev) => [...prev, created]);
      setSelectedListId(created.id);
      setRemovedBookIds(new Set());
      setNewListName("");
      setIsCreating(false);
      showToast(`"${created.name}" list created!`, "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to create list.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewListName("");
  };

  const handleBookNavigate = (bookId: number) => {
    navigate(buildBookPath(bookId));
  };

// ── Loading state ─────────────────────────────────────────────────────────
  if (listsLoading) {
    return (
      <div className="py-7">
        <div className="mb-11 h-20 animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="mb-7 flex gap-3">
          {["tab-a", "tab-b", "tab-c"].map((k) => (
            <div
              key={k}
              className="h-9 w-28 animate-pulse rounded-full bg-white/[0.06]"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SKELETON_KEYS.map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      </div>
    );
  }

// ── Error state ───────────────────────────────────────────────────────────
  if (listsError) {
    return (
      <div className="py-7">
        <ErrorState message={listsError} onRetry={refetchLists} />
      </div>
    );
  }

// ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="py-7">
      <header className="mb-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          label="Reader"
          title="Reading Lists"
          description="Your personal sanctuaries of upcoming stories. Curate, organize, and prepare for your next literary journey."
        />
        {!isCreating && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4" />
            New List
          </Button>
        )}
      </header>

      {/* Create list form */}
      {isCreating && (
        <div className="mb-7 rounded-xl border border-outline-variant/20 bg-surface-container-high p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            Create New List
          </p>
          <form onSubmit={handleCreateList} className="flex items-end gap-3">
            <div className="flex-1">
              <InputField
                label="List Name"
                placeholder="e.g. Summer Reads, Must Read…"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || !newListName.trim()}
            >
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
            <button
              type="button"
              onClick={handleCancelCreate}
              className="flex h-12 w-12 items-center justify-center rounded-lg text-outline transition-colors hover:bg-white/5 hover:text-on-surface"
              aria-label="Cancel create list"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Empty: no lists at all */}
      {allLists.length === 0 ? (
        <EmptyState
          icon={<List className="h-7 w-7 text-primary" />}
          title="No reading lists yet"
          description="Create your first reading list to start organizing books you want to read."
          action={
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4" />
              Create Your First List
            </Button>
          }
        />
      ) : (
        <>
          {/* List tab selector */}
          <div className="mb-7 flex flex-wrap gap-2">
            {allLists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => handleSelectList(list.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition-all duration-200",
                  effectiveSelectedId === list.id
                    ? "bg-primary-container text-white shadow-ambient"
                    : "border border-outline-variant/20 bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                {list.name}
              </button>
            ))}
          </div>

          {/* Items area */}
          {itemsLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {SKELETON_KEYS.slice(0, 5).map((k) => (
                <SkeletonCard key={k} />
              ))}
            </div>
          ) : itemsError ? (
            <ErrorState message={itemsError} onRetry={refetchItems} />
          ) : localItems.length === 0 ? (
            <EmptyState
              icon={<BookMarked className="h-7 w-7 text-primary" />}
              title="This list is empty"
              description="Browse books and add them to this list to keep track of what you want to read."
              action={
                <Button variant="secondary" onClick={() => navigate("/home")}>
                  Browse Books
                </Button>
              }
            />
          ) : (
            <section
              ref={dropdownRef}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {localItems.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-visible rounded-xl bg-surface-container-high px-5 pb-6 pt-10 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Cover — proper button for a11y */}
                  <button
                    type="button"
                    className="absolute -top-7 left-1/2 h-44 w-32 -translate-x-1/2 overflow-hidden rounded-sm shadow-2xl transition-transform duration-500 group-hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                    onClick={() => handleBookNavigate(item.bookId)}
                    aria-label={`Open details for ${item.title}`}
                  >
                    <img
                      className="h-full w-full object-cover"
                      src={item.coverImageUrl}
                      alt={item.title}
                    />
                  </button>

                  <div className="mt-32 text-center">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      {item.genre}
                    </span>

                    {/* Title — proper button, not h3 with role */}
                    <button
                      type="button"
                      className="mb-1 line-clamp-1 w-full text-center text-lg font-bold text-white transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
                      onClick={() => handleBookNavigate(item.bookId)}
                    >
                      {item.title}
                    </button>

                    <p className="mb-6 text-sm text-white/40">{item.author}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-outline-variant/15 pt-4">
                      <StatusChip status={item.status} />

                      {/* Options dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                          aria-label={`Options for ${item.title}`}
                          aria-expanded={openDropdownId === item.id}
                          onClick={(e) => handleToggleDropdown(e, item.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openDropdownId === item.id && (
                          <div className="absolute bottom-full right-0 z-50 mb-1 min-w-[160px] overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-high shadow-ambient">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-error transition-colors hover:bg-error/10"
                              onClick={(e) => handleRemoveBook(e, item)}
                            >
                              <X className="h-4 w-4" />
                              Remove from List
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
};
