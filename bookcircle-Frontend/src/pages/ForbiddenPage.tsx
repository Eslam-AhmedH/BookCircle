import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, ShieldOff } from "lucide-react"
import { useAuth } from "../app/providers/AuthContext"
import { Button } from "../shared/ui/Button"
import { appRoutes } from "../shared/config/routes"

export const ForbiddenPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleGoHome = () => {
    navigate(isAuthenticated ? appRoutes.home : appRoutes.login)
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="relative mb-6 flex items-center justify-center">
        <span className="absolute text-[12rem] font-black leading-none text-error/5 select-none">
          403
        </span>
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-surface-container-high shadow-ambient">
          <ShieldOff className="h-10 w-10 text-error" />
        </div>
      </div>

      <p className="mb-3 text-[clamp(5rem,14vw,8rem)] font-black leading-none tracking-tight text-error drop-shadow-[0_0_60px_rgba(255,180,171,0.20)]">
        403
      </p>

      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
        Access Forbidden
      </h1>

      <p className="mb-10 max-w-md text-base leading-relaxed text-on-surface-variant">
        You don&apos;t have permission to view this page. If you believe this is
        a mistake, please contact your administrator or go back to safety.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button variant="primary" size="lg" onClick={handleGoHome}>
          <Home className="h-4 w-4" />
          Go Home
        </Button>
        <Button variant="secondary" size="lg" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>

      <div className="mt-16 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-outline">
        <span>BookCircle</span>
        <span className="h-1 w-1 rounded-full bg-outline" />
        <span>Error 403</span>
      </div>
    </div>
  )
}
