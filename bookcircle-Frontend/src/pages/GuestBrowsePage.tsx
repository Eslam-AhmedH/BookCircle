import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, LogIn } from 'lucide-react'
import { useBooks } from '../features/books/useBooks'
import { BookGridCard } from '../widgets/BookGridCard'
import { SkeletonCard } from '../shared/ui/SkeletonCard'
import { EmptyState } from '../shared/ui/EmptyState'
import { ErrorState } from '../shared/ui/ErrorState'
import { InputField } from '../shared/ui/InputField'
import { appRoutes } from '../shared/config/routes'

const GENRES = [
  'Literary Fiction',
  'Science Fiction',
  'Technology',
  'Design',
  'Psychology',
  'Fantasy',
  'Self-Improvement',
  'Psychological Thriller',
]

export const GuestBrowsePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')

  const { data: books, isLoading, error, refetch } = useBooks({
    searchTerm: searchTerm || undefined,
    genre: selectedGenre || undefined,
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(inputValue.trim())
  }

  const handleGenreToggle = (genre: string) => {
    setSelectedGenre(prev => prev === genre ? '' : genre)
  }

  const hasActiveFilters = !!searchTerm || !!selectedGenre

  return (
    <div>
      {/* CTA Banner */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary-container/10 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="mb-1 text-lg font-bold text-on-surface">Want to borrow a book?</h2>
          <p className="text-sm text-on-surface-variant">
            Create a free account to send borrow requests, manage reading lists, and more.
          </p>
        </div>
        <Link
          to={appRoutes.register}
          className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-primary-container px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
        >
          <LogIn className="h-4 w-4" />
          Get Started Free
        </Link>
      </div>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="mb-2 text-headline font-bold text-on-surface">Browse Books</h1>
        <p className="text-sm text-on-surface-variant">
          Discover books available for borrowing in your community.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <InputField
            placeholder="Search by title, author, or ISBN…"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            autoComplete="off"
            icon={<Search className="h-4 w-4" />}
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => { setInputValue(''); setSearchTerm('') }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-outline transition-colors hover:text-on-surface"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* Genre filter pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {GENRES.map(genre => (
          <button
            key={genre}
            type="button"
            onClick={() => handleGenreToggle(genre)}
            className={[
              'rounded-full border px-4 py-1.5 text-xs font-semibold transition-all',
              selectedGenre === genre
                ? 'border-primary/60 bg-primary/10 text-primary'
                : 'border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/40 hover:text-on-surface',
            ].join(' ')}
          >
            {genre}
          </button>
        ))}
        {selectedGenre && (
          <button
            type="button"
            onClick={() => setSelectedGenre('')}
            className="flex items-center gap-1 rounded-full border border-error/20 bg-error/10 px-3 py-1.5 text-xs font-semibold text-error"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={refetch} className="py-24" />
      )}

      {!isLoading && !error && books?.length === 0 && (
        <EmptyState
          icon={<Search className="h-8 w-8 text-outline" />}
          title={hasActiveFilters ? 'No matching books' : 'No books available'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'Check back soon!'
          }
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setInputValue(''); setSelectedGenre('') }}
                className="rounded-full border border-outline-variant/30 px-5 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !error && books && books.length > 0 && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
          {books.map(book => (
            <BookGridCard key={book.id} book={book} guestMode />
          ))}
        </div>
      )}

      {/* Footer sign-in nudge */}
      <div className="mt-16 border-t border-outline-variant/10 pt-10 text-center">
        <p className="mb-4 text-on-surface-variant">Already have an account?</p>
        <Link
          to={appRoutes.login}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/10"
        >
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
      </div>
    </div>
  )
}
