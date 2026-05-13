import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useBooks } from "../features/books/useBooks";
import { BookGridCard } from "../widgets/BookGridCard";
import { SkeletonCard } from "../shared/ui/SkeletonCard";
import { EmptyState } from "../shared/ui/EmptyState";
import { ErrorState } from "../shared/ui/ErrorState";
import { InputField } from "../shared/ui/InputField";
import { Button } from "../shared/ui/Button";
import type { BookStatus } from "../entities/book";

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

const STATUSES: { label: string; value: BookStatus }[] = [
  { label: "Available", value: "Available" },
  { label: "Borrowed", value: "Borrowed" },
];

const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "German",
  "Arabic",
  "Japanese",
  "Portuguese",
  "Italian",
];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQ = searchParams.get("q") ?? "";
  const initialGenre = searchParams.get("genre") ?? "";
  const initialStatus = searchParams.get("status") ?? "";
  const initialLanguage = searchParams.get("language") ?? "";
  const initialMaxPriceParam = searchParams.get("maxPrice");
  const initialMaxPrice =
    initialMaxPriceParam !== null && !Number.isNaN(Number(initialMaxPriceParam))
      ? Number(initialMaxPriceParam)
      : undefined;

  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const {
    data: books,
    isLoading,
    error,
    refetch,
  } = useBooks({
    searchTerm: searchTerm || undefined,
    genre: selectedGenre || undefined,
    status: selectedStatus || undefined,
    language: selectedLanguage || undefined,
    maxPrice: maxPrice,
  });

  // Keep URL in sync with filter state
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.q = searchTerm;
    if (selectedGenre) params.genre = selectedGenre;
    if (selectedStatus) params.status = selectedStatus;
    if (selectedLanguage) params.language = selectedLanguage;
    if (maxPrice !== undefined) params.maxPrice = String(maxPrice);
    setSearchParams(params, { replace: true });
  }, [
    searchTerm,
    selectedGenre,
    selectedStatus,
    selectedLanguage,
    maxPrice,
    setSearchParams,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(inputValue.trim());
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(inputValue.trim());
    }
  };

  const handleClearSearch = () => {
    setInputValue("");
    setSearchTerm("");
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenre((prev) => (prev === genre ? "" : genre));
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatus((prev) => (prev === status ? "" : status));
  };

  const handleClearGenre = () => {
    setSelectedGenre("");
  };

  const handleClearStatus = () => {
    setSelectedStatus("");
  };

  const handleClearAllFilters = () => {
    setInputValue("");
    setSearchTerm("");
    setSelectedGenre("");
    setSelectedStatus("");
    setSelectedLanguage("");
    setMaxPrice(undefined);
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguage((prev) => (prev === language ? "" : language));
  };

  const handleClearLanguage = () => {
    setSelectedLanguage("");
  };

  const handleToggleMobileFilters = () => {
    setIsMobileFiltersOpen((prev) => !prev);
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedGenre !== "" ||
    selectedStatus !== "" ||
    selectedLanguage !== "" ||
    maxPrice !== undefined;

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (selectedGenre ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (selectedLanguage ? 1 : 0) +
    (maxPrice !== undefined ? 1 : 0);

  return (
    <div className="py-6 lg:py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="mb-2 text-headline font-bold text-on-surface">
          Search Books
        </h1>
        <p className="text-sm text-on-surface-variant">
          Find your next great read from our curated collection.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <InputField
            placeholder="Search by title, author, or ISBN…"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleSearchKeyDown}
            autoComplete="off"
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
      </div>

      {/* Mobile filter toggle */}
      <div className="mb-4 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={handleToggleMobileFilters}
          className="flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-surface">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={[
              "h-4 w-4 transition-transform duration-200",
              isMobileFiltersOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="flex items-center gap-1.5 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-xs font-semibold text-error transition-colors hover:bg-error/20"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* ── Sidebar ── */}
        <aside
          className={[
            "flex-shrink-0 lg:block lg:w-64",
            isMobileFiltersOpen ? "mb-6 block w-full" : "hidden",
          ].join(" ")}
        >
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
            {/* Sidebar header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">
                Filters
              </h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-xs font-semibold text-outline transition-colors hover:text-error"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Genre filter */}
            <div className="mb-8">
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-outline">
                Genre
              </h3>
              <ul className="space-y-0.5">
                {GENRES.map((genre) => {
                  const isChecked = selectedGenre === genre;
                  return (
                    <li key={genre}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-container-high">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() => handleGenreToggle(genre)}
                          aria-label={genre}
                        />
                        {/* Custom checkbox */}
                        <span
                          className={[
                            "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all duration-150",
                            isChecked
                              ? "border-primary bg-primary"
                              : "border-outline-variant/40 bg-surface-container-lowest",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {isChecked && (
                            <svg
                              aria-hidden="true"
                              className="h-2.5 w-2.5 text-surface"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              viewBox="0 0 12 12"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span
                          className={[
                            "text-sm transition-colors",
                            isChecked
                              ? "font-semibold text-primary"
                              : "text-on-surface-variant",
                          ].join(" ")}
                        >
                          {genre}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Status / Availability filter */}
            <div className="mb-8">
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-outline">
                Availability
              </h3>
              <div className="flex flex-col gap-2">
                {STATUSES.map(({ label, value }) => {
                  const isSelected = selectedStatus === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleStatusToggle(value)}
                      aria-pressed={isSelected}
                      className={[
                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all duration-150",
                        isSelected
                          ? value === "Available"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-tertiary/40 bg-tertiary/10 text-tertiary"
                          : "border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant hover:border-outline-variant/40 hover:bg-surface-container-high",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          "h-2 w-2 flex-shrink-0 rounded-full",
                          isSelected
                            ? value === "Available"
                              ? "bg-primary"
                              : "bg-tertiary"
                            : "bg-outline",
                        ].join(" ")}
                      />
                      {label}
                      {isSelected && (
                        <X className="ml-auto h-3 w-3 flex-shrink-0 opacity-70" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language filter */}
            <div className="mb-8">
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-outline">
                Language
              </h3>
              <ul className="space-y-0.5">
                {LANGUAGES.map((language) => {
                  const isChecked = selectedLanguage === language;
                  return (
                    <li key={language}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-container-high">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() => handleLanguageToggle(language)}
                          aria-label={language}
                        />
                        {/* Custom checkbox */}
                        <span
                          className={[
                            "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all duration-150",
                            isChecked
                              ? "border-primary bg-primary"
                              : "border-outline-variant/40 bg-surface-container-lowest",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {isChecked && (
                            <svg
                              aria-hidden="true"
                              className="h-2.5 w-2.5 text-surface"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              viewBox="0 0 12 12"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span
                          className={[
                            "text-sm transition-colors",
                            isChecked
                              ? "font-semibold text-primary"
                              : "text-on-surface-variant",
                          ].join(" ")}
                        >
                          {language}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Max Price filter */}
            <div>
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-outline">
                Max Price
              </h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={0.5}
                  value={maxPrice ?? 20}
                  onChange={(e) =>
                    setMaxPrice(
                      e.target.value === "20"
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>$0</span>
                  <span className="font-bold text-primary">
                    {maxPrice !== undefined
                      ? `$${maxPrice.toFixed(2)}`
                      : "Any price"}
                  </span>
                  <span>$20</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Results panel ── */}
        <div className="min-w-0 flex-1">
          {/* Active filter chips + result count */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {searchTerm && (
                <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface">
                  <Search className="h-3 w-3 text-outline" />"{searchTerm}"
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-outline transition-colors hover:text-error"
                    aria-label="Remove search term"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedGenre && (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {selectedGenre}
                  <button
                    type="button"
                    onClick={handleClearGenre}
                    className="transition-colors hover:text-error"
                    aria-label={`Remove ${selectedGenre} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedStatus && (
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                    selectedStatus === "Available"
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-tertiary/20 bg-tertiary/10 text-tertiary",
                  ].join(" ")}
                >
                  {selectedStatus}
                  <button
                    type="button"
                    onClick={handleClearStatus}
                    className="transition-colors hover:text-error"
                    aria-label={`Remove ${selectedStatus} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedLanguage && (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {selectedLanguage}
                  <button
                    type="button"
                    onClick={handleClearLanguage}
                    className="transition-colors hover:text-error"
                    aria-label={`Remove ${selectedLanguage} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {maxPrice !== undefined && (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Max ${maxPrice.toFixed(2)}
                  <button
                    type="button"
                    onClick={() => setMaxPrice(undefined)}
                    className="transition-colors hover:text-error"
                    aria-label="Remove max price filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {!hasActiveFilters && (
                <p className="text-sm text-on-surface-variant">All books</p>
              )}
            </div>

            {!isLoading && books && books.length > 0 && (
              <p className="flex-shrink-0 text-sm text-outline">
                {books.length} {books.length === 1 ? "result" : "results"}
              </p>
            )}
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
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
              title={
                hasActiveFilters ? "No matching books" : "No books available"
              }
              description={
                hasActiveFilters
                  ? "Try adjusting your search terms or removing some filters to broaden your results."
                  : "The catalogue is currently empty. Check back soon!"
              }
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" onClick={handleClearAllFilters}>
                    <X className="h-4 w-4" />
                    Clear all filters
                  </Button>
                ) : undefined
              }
            />
          )}

          {/* Book grid */}
          {!isLoading && !error && books && books.length > 0 && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {books.map((book) => (
                <BookGridCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
