import { Link, Outlet } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { appRoutes } from '../../shared/config/routes'

export const GuestLayout = () => {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Guest top bar */}
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-outline-variant/10 bg-surface/80 backdrop-blur-glass">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={appRoutes.guestBooks} className="flex items-center gap-2 font-bold text-on-surface">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>BookCircle</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to={appRoutes.login}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface sm:px-4"
            >
              Sign In
            </Link>
            <Link
              to={appRoutes.register}
              className="rounded-lg bg-primary-container px-3 py-2 text-sm font-bold text-white transition-all hover:opacity-90 sm:px-4"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
