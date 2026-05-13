import { Link } from "react-router-dom"
import { Clock, Mail, ArrowLeft, BookOpen } from "lucide-react"
import { appRoutes } from "../shared/config/routes"

export const PendingApprovalPage = () => {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section className="w-full">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-container to-secondary-container shadow-ambient">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-primary">
            BookCircle
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Curate your reading journey.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8 shadow-soft">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary-container/20 blur-xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                <Clock className="h-9 w-9 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-headline font-bold leading-tight text-on-surface">
              Account Pending Approval
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Your Owner account has been submitted. An admin will review and
              approve your application. You will be notified by email.
            </p>
          </div>

          {/* Steps */}
          <div className="mb-8 space-y-3">
            <div className="flex items-start gap-4 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Application submitted
                </p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  Your account details have been received.
                </p>
              </div>
              <div className="ml-auto mt-0.5 flex-shrink-0">
                <span className="inline-flex rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                  Done
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 opacity-60">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                <span className="text-xs font-bold text-outline">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Admin review
                </p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  An admin is reviewing your application.
                </p>
              </div>
              <div className="ml-auto mt-0.5 flex-shrink-0">
                <span className="inline-flex rounded-md bg-tertiary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-tertiary">
                  Pending
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 opacity-40">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                <span className="text-xs font-bold text-outline">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Access granted
                </p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  Start sharing your book collection.
                </p>
              </div>
            </div>
          </div>

          {/* Email notice */}
          <div className="flex items-center gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3">
            <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Keep an eye on your inbox — we'll email you once your account is
              approved.
            </p>
          </div>
        </div>

        {/* Back to login */}
        <div className="mt-8 text-center">
          <Link
            to={appRoutes.login}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  )
}
