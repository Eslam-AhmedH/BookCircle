import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  BookOpen,
  Heart,
  ThumbsDown,
  LogIn,
  Calendar,
  Globe,
  Hash,
} from 'lucide-react'
import { useBook } from '../features/books/useBooks'
import { SkeletonBookDetail } from '../shared/ui/SkeletonCard'
import { ErrorState } from '../shared/ui/ErrorState'
import { StatusChip } from '../shared/ui/StatusChip'
import { appRoutes } from '../shared/config/routes'

export const GuestBookDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const numericId = parseInt(id ?? '', 10)

  useEffect(() => {
    if (Number.isNaN(numericId)) navigate(appRoutes.notFound, { replace: true })
  }, [numericId, navigate])

  const { data: book, isLoading, error, refetch } = useBook(
    Number.isNaN(numericId) ? -1 : numericId,
  )

  useEffect(() => {
    if (!isLoading && !error && book === null) navigate(appRoutes.notFound, { replace: true })
  }, [isLoading, error, book, navigate])

  if (Number.isNaN(numericId)) return null
  if (isLoading) return <div className="py-8"><SkeletonBookDetail /></div>
  if (error) return <div className="py-8"><ErrorState message={error} onRetry={refetch} /></div>
  if (!book) return null

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* ── Cover ── */}
        <section className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-xl shadow-soft">
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-on-surface">{book.likes ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2">
              <ThumbsDown className="h-4 w-4 text-on-surface-variant" />
              <span className="text-sm font-bold text-on-surface">{book.dislikes ?? 0}</span>
            </div>
          </div>
        </section>

        {/* ── Details ── */}
        <section className="flex flex-col gap-6 lg:col-span-7">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {book.genre}
            </p>
            <h1 className="mb-2 text-3xl font-extrabold text-on-surface">{book.title}</h1>
            <p className="text-lg text-on-surface-variant">by {book.author}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusChip status={book.status} />
            <span className="text-sm font-bold text-primary">
              ${book.borrowPrice.toFixed(2)} / borrow
            </span>
          </div>

          {book.description && (
            <p className="leading-relaxed text-on-surface-variant">{book.description}</p>
          )}

          <dl className="grid grid-cols-2 gap-4">
            {[
              { icon: <Hash className="h-4 w-4" />, label: 'ISBN', value: book.isbn },
              { icon: <Globe className="h-4 w-4" />, label: 'Language', value: book.language },
              {
                icon: <Calendar className="h-4 w-4" />,
                label: 'Published',
                value: formatDate(book.publicationDate),
              },
              { icon: <BookOpen className="h-4 w-4" />, label: 'Owner', value: book.ownerName },
            ].map(({ icon, label, value }) => (
              <div key={label} className="rounded-xl bg-surface-container-low p-4">
                <dt className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant/60">
                  {icon} {label}
                </dt>
                <dd className="text-sm font-semibold text-on-surface">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Guest borrow CTA */}
          <div className="rounded-2xl border border-primary/20 bg-primary-container/10 p-6">
            <p className="mb-1 font-bold text-on-surface">Interested in borrowing?</p>
            <p className="mb-4 text-sm text-on-surface-variant">
              Sign in or create an account to send a borrow request to {book.ownerName}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={appRoutes.login}
                className="flex items-center gap-2 rounded-xl bg-primary-container px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
              >
                <LogIn className="h-4 w-4" /> Sign In to Borrow
              </Link>
              <Link
                to={appRoutes.register}
                className="flex items-center gap-2 rounded-xl border border-primary/30 px-5 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/10"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
