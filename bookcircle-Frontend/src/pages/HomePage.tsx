import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Plus } from "lucide-react";
import { useAuth } from "../app/providers/AuthContext";
import { useBooks } from "../features/books/useBooks";
import { buildSearchPath, appRoutes } from "../shared/config/routes";
import { BookGridCard } from "../widgets/BookGridCard";
import { SkeletonCard } from "../shared/ui/SkeletonCard";
import { EmptyState } from "../shared/ui/EmptyState";
import { ErrorState } from "../shared/ui/ErrorState";
import { InputField } from "../shared/ui/InputField";

const GENRES = [
  "Literary Fiction",
  "Science Fiction",
  "Technology",
  "Design",
  "Psychology",
  "Fantasy",
  "Self-Improvement",
  "Psychological Thriller",
];

const getGenreImageUrl = (genre: string): string => {
  const seed = genre.toLowerCase().replace(/\s+/g, "");
  return `https://picsum.photos/seed/genre_${seed}/400/500`;
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const {
    data: books,
    isLoading,
    error,
    refetch,
  } = useBooks({
    searchTerm: searchQuery || undefined,
    genre: selectedGenre || undefined,
  });

  const isOwnerOrAdmin = user?.role === "Owner" || user?.role === "Admin";

  const handleGenreClick = (genre: string) => {
    setSelectedGenre((prev) => (prev === genre ? null : genre));
  };

  const handleClearGenre = () => {
    setSelectedGenre(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      navigate(buildSearchPath(trimmed));
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = inputValue.trim();
      if (trimmed) {
        navigate(buildSearchPath(trimmed));
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setInputValue("");
  };

  const handleFabClick = () => {
    navigate(appRoutes.addBook);
  };

  const hasActiveFilters = selectedGenre !== null || searchQuery !== "";

  return (
    <div className="pb-8 lg:pb-2">
      {/* Hero */}
      <section className="py-12">
        <h1 className="mb-4 text-display font-extrabold leading-tight tracking-tight text-on-surface">
          Your Personal{" "}
          <span className="font-serif italic text-primary">Curated</span>{" "}
          Library.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          Discover and borrow from an exclusive collective of literary works.
          Explore by genre or search for your next great read.
        </p>
      </section>

      {/* Search bar */}
      <section className="mb-10">
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <InputField
            placeholder="Search books, authors, ISBN…"
            value={inputValue}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            icon={<Search className="h-4 w-4" />}
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-outline transition-colors hover:text-on-surface"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
        {searchQuery && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-on-surface-variant">
              Showing results for{" "}
              <strong className="text-on-surface">"{searchQuery}"</strong>
            </span>
            <button
              type="button"
              onClick={handleClearSearch}
              className="flex items-center gap-1 rounded-full border border-outline-variant/30 px-3 py-1 text-xs font-semibold text-outline transition-colors hover:border-error/40 hover:text-error"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          </div>
        )}
      </section>

      {/* Genre tiles */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
            Browse by Genre
          </h2>
          {selectedGenre && (
            <button
              type="button"
              onClick={handleClearGenre}
              className="flex items-center gap-1.5 rounded-full border border-outline-variant/30 px-3 py-1 text-xs font-semibold text-outline transition-colors hover:border-error/40 hover:text-error"
            >
              <X className="h-3 w-3" />
              Clear filter
            </button>
          )}
        </div>

        <div
          className="hide-scrollbar -mx-1.5 flex gap-4 overflow-x-auto px-1.5 pb-4 sm:-mx-2 sm:px-2"
          style={{ scrollbarWidth: "none" }}
        >
          {GENRES.map((genre) => {
            const isActive = selectedGenre === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreClick(genre)}
                className={[
                  "group relative aspect-[4/5] w-40 flex-none overflow-hidden rounded-xl border transition-all duration-300",
                  isActive
                    ? "border-primary/60 shadow-glow scale-[1.03]"
                    : "border-outline-variant/15 hover:scale-[1.02] hover:border-outline-variant/40",
                ].join(" ")}
                aria-pressed={isActive}
              >
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {isActive && (
                  <div className="absolute inset-0 z-10 bg-primary/15" />
                )}
                <img
                  alt={genre}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={getGenreImageUrl(genre)}
                />
                <span
                  className={[
                    "absolute bottom-3 left-3 right-3 z-20 text-left text-xs font-bold leading-tight",
                    isActive ? "text-primary" : "text-white",
                  ].join(" ")}
                >
                  {genre}
                </span>
                {isActive && (
                  <span className="absolute right-2 top-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <X className="h-3 w-3 text-surface" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Active filter indicator */}
      {selectedGenre && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-on-surface-variant">
            Filtering by genre:{" "}
            <strong className="text-on-surface">{selectedGenre}</strong>
          </span>
        </div>
      )}

      {/* Section header */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-headline font-bold text-on-surface">
            {hasActiveFilters ? "Search Results" : "All Books"}
          </h2>
          {!isLoading && books && books.length > 0 && (
            <span className="text-sm text-outline">
              {books.length} {books.length === 1 ? "book" : "books"}
            </span>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <ErrorState message={error} onRetry={refetch} className="py-24" />
        )}

        {/* Empty state */}
        {!isLoading && !error && books && books.length === 0 && (
          <EmptyState
            icon={<Search className="h-8 w-8 text-outline" />}
            title="No books found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters or search terms to find what you're looking for."
                : "No books are available right now. Check back soon!"
            }
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    handleClearSearch();
                    handleClearGenre();
                  }}
                  className="mt-2 rounded-full border border-outline-variant/30 px-5 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary"
                >
                  Clear all filters
                </button>
              ) : undefined
            }
          />
        )}

        {/* Book grid */}
        {!isLoading && !error && books && books.length > 0 && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-4">
            {books.map((book) => (
              <BookGridCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* FAB — Owner / Admin only */}
      {isOwnerOrAdmin && (
        <button
          type="button"
          onClick={handleFabClick}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-primary-container to-secondary-container px-5 py-4 text-white shadow-ambient transition-all duration-200 hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
          aria-label="Lend your library"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden whitespace-nowrap font-bold md:inline">
            Lend Your Library
          </span>
        </button>
      )}
    </div>
  );
};
