import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  Mail,
  Lock,
  ChevronRight,
  BookMarked,
} from "lucide-react";
import { authService } from "../services";
import { useAuth } from "../app/providers/AuthContext";
import { appRoutes } from "../shared/config/routes";
import { Button } from "../shared/ui/Button";
import { InputField } from "../shared/ui/InputField";
import type { UserRole } from "../entities/user";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Reader");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await authService.register({
        fullName,
        email,
        password,
        role: selectedRole,
      });

      if (result.needsApproval) {
        navigate(appRoutes.pendingApproval);
        return;
      }

      auth.login(result.token, result.user);
      navigate(appRoutes.home);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-lg items-center px-5 py-16">
      <section className="w-full">
        {/* Logo */}
        <div className="mb-9 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-container to-secondary-container shadow-ambient">
            <BookOpen className="h-5 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-primary">
            BookCircle
          </h2>
          <p className="mt-0 text-sm text-on-surface-variant">
            Curate your reading journey.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-8 shadow-2xl">
          <div className="mb-7">
            <h3 className="text-xl font-bold text-on-surface">
              Create an account
            </h3>
            <p className="mt-0 text-sm text-on-surface-variant">
              Join the community of readers and curators.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 px-4 py-3">
              <span className="mt-1 flex-shrink-0 text-error">&#9888;</span>
              <p className="text-sm font-medium text-error">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div className="space-y-1">
              <p className="px-0 text-label font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                I want to
              </p>
              <div className="grid grid-cols-1 gap-3">
                {/* Reader Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("Reader")}
                  className={[
                    "relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all duration-200",
                    selectedRole === "Reader"
                      ? "border-primary/60 bg-primary/10 shadow-glow"
                      : "border-outline-variant/20 bg-surface-container-lowest hover:border-outline-variant/40 hover:bg-surface-container-high",
                  ].join(" ")}
                >
                  {selectedRole === "Reader" && (
                    <span className="absolute right-2 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <ChevronRight className="h-2 w-3 text-surface" />
                    </span>
                  )}
                  <div
                    className={[
                      "flex h-8 w-9 items-center justify-center rounded-lg",
                      selectedRole === "Reader"
                        ? "bg-primary/20"
                        : "bg-surface-container-high",
                    ].join(" ")}
                  >
                    <BookOpen
                      className={[
                        "h-3 w-4",
                        selectedRole === "Reader"
                          ? "text-primary"
                          : "text-outline",
                      ].join(" ")}
                    />
                  </div>
                  <div>
                    <p
                      className={[
                        "text-sm font-bold",
                        selectedRole === "Reader"
                          ? "text-primary"
                          : "text-on-surface",
                      ].join(" ")}
                    >
                      Reader
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                      Browse and borrow books
                    </p>
                  </div>
                </button>

                {/* Owner Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("Owner")}
                  className={[
                    "relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all duration-200",
                    selectedRole === "Owner"
                      ? "border-primary/60 bg-primary/10 shadow-glow"
                      : "border-outline-variant/20 bg-surface-container-lowest hover:border-outline-variant/40 hover:bg-surface-container-high",
                  ].join(" ")}
                >
                  {selectedRole === "Owner" && (
                    <span className="absolute right-2 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <ChevronRight className="h-2 w-3 text-surface" />
                    </span>
                  )}
                  <div
                    className={[
                      "flex h-8 w-9 items-center justify-center rounded-lg",
                      selectedRole === "Owner"
                        ? "bg-primary/20"
                        : "bg-surface-container-high",
                    ].join(" ")}
                  >
                    <BookMarked
                      className={[
                        "h-3 w-4",
                        selectedRole === "Owner"
                          ? "text-primary"
                          : "text-outline",
                      ].join(" ")}
                    />
                  </div>
                  <div>
                    <p
                      className={[
                        "text-sm font-bold",
                        selectedRole === "Owner"
                          ? "text-primary"
                          : "text-on-surface",
                      ].join(" ")}
                    >
                      Owner
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                      Share your collection — requires admin approval
                    </p>
                  </div>
                </button>
              </div>

              {/* Owner approval notice */}
              {selectedRole === "Owner" && (
                <p className="rounded-lg border border-tertiary/21 bg-tertiary/10 px-3 py-2 text-xs text-tertiary">
                  &#9433;&#160; Owner accounts require admin approval before you
                  can list books.
                </p>
              )}
            </div>

            {/* Fields */}
            <InputField
              label="Full Name"
              type="text"
              placeholder="Alex Thorne"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              icon={<User className="h-3 w-4" />}
            />

            <InputField
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              icon={<Mail className="h-3 w-4" />}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={7}
              autoComplete="new-password"
              icon={<Lock className="h-3 w-4" />}
            />

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="inline-block h-3 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-7 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link
            to={appRoutes.login}
            className="font-bold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};
