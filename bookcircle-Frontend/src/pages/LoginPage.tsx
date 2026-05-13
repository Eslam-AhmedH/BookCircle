import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, BookOpen, Compass, ArrowUpRight } from "lucide-react";
import { authService } from "../services";
import { useAuth } from "../app/providers/AuthContext";
import { appRoutes } from "../shared/config/routes";
import { Button } from "../shared/ui/Button";
import { InputField } from "../shared/ui/InputField";

export const LoginPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { token, user } = await authService.login({ email, password });
      auth.login(token, user);
      navigate(appRoutes.home);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="mb-6">
            <h2 className="text-xl font-bold text-on-surface">Welcome back</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error message */}
          {errorMsg !== null && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-error/20 bg-error/10 px-4 py-3">
              <span className="text-sm font-medium text-error">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <InputField
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
            />

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      fill="currentColor"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <Link
              to={appRoutes.guestBooks}
              className="group flex w-full items-center justify-between rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary-container/10 to-secondary-container/10 px-4 py-3 text-on-surface transition-all duration-200 hover:border-primary/40 hover:shadow-glow"
              aria-label="Continue as guest and browse available books"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Compass className="h-4 w-4" />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-bold">Continue as Guest</span>
                  <span className="block text-xs text-on-surface-variant">
                    Browse books without signing in
                  </span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-primary transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </form>
        </div>

        {/* Register link */}
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Don't have an account?{" "}
          <Link
            className="font-bold text-primary hover:underline"
            to={appRoutes.register}
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
};
