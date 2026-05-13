import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  LogOut,
  Save,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../app/providers/AuthContext";
import { useToast } from "../app/providers/ToastContext";
import { Button } from "../shared/ui/Button";
import { InputField } from "../shared/ui/InputField";
import { Card } from "../shared/ui/Card";
import { appRoutes } from "../shared/config/routes";
import axiosInstance from "../services/api/axiosInstance";

const FALLBACK_AVATAR = "https://picsum.photos/seed/defaultav/80/80";

const SectionDivider = () => (
  <div className="my-8 h-px w-full bg-outline-variant/15" />
);

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

const SectionTitle = ({ icon, title, description }: SectionTitleProps) => (
  <div className="mb-6 flex items-start gap-3">
    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
      {icon}
    </div>
    <div>
      <h2 className="text-lg font-bold text-on-surface">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-on-surface-variant">{description}</p>
      )}
    </div>
  </div>
);

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setAvatarUrl(user.avatarUrl ?? "");
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return <Navigate to={appRoutes.login} replace />;
  }

  const hasNameChanged = fullName.trim() !== user.fullName;
  const hasAvatarChanged = avatarUrl.trim() !== (user.avatarUrl ?? "");
  const hasChanges = hasNameChanged || hasAvatarChanged;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedAvatar = avatarUrl.trim();
    if (!trimmedName || !hasChanges) return;
    setIsSaving(true);
    try {
      updateUser({ fullName: trimmedName, avatarUrl: trimmedAvatar || undefined });
      showToast("Profile updated!", "success");
    } catch {
      showToast("Failed to update profile. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      logout();
      navigate(appRoutes.login);
    } catch {
      showToast("Failed to log out. Please try again.", "error");
      setIsLoggingOut(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axiosInstance.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setAvatarUrl(response.data.url);
        showToast("Image uploaded successfully", "success");
      } catch (err) {
        showToast("Failed to upload image", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="py-8">
      <header className="mb-10">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
          Account
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
          Settings
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-on-surface-variant">
          Manage your account preferences, profile information, and security
          settings.
        </p>
      </header>

      <div className="mx-auto max-w-2xl">
        {/* Profile overview card */}
        <Card className="mb-8 p-6">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 flex-shrink-0">
              <img
                src={avatarUrl || FALLBACK_AVATAR}
                alt={user.fullName}
                className="h-full w-full rounded-full object-cover ring-2 ring-primary/20"
              />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-container ring-2 ring-surface">
                <Shield className="h-3 w-3 text-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xl font-bold text-on-surface">
                {fullName}
              </h3>
              <p className="mt-0.5 truncate text-sm text-on-surface-variant">
                {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex rounded-full bg-primary-container/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  {user.role}
                </span>
                {user.isApproved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-fixed">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-fixed" />
                    Approved
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Profile */}
        <section>
          <SectionTitle
            icon={<User className="h-4 w-4" />}
            title="Edit Profile"
            description="Update your personal information visible to other members."
          />

          <Card className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              <div className="space-y-1">
                <label className="px-1 text-label font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <InputField
                      label=""
                      icon={<ImageIcon className="h-4 w-4" />}
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Paste image URL here"
                      disabled={isSaving || isUploading}
                    />
                  </div>
                  <div className="flex-shrink-0 pb-2">
                    <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 text-sm font-bold text-on-surface transition-all hover:border-primary/40 hover:text-primary">
                      {isUploading ? (
                         <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      ) : (
                         <ImageIcon className="h-4 w-4" />
                      )}
                      {isUploading ? "Uploading..." : "Browse Device"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isSaving || isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <InputField
                label="Full Name"
                icon={<User className="h-4 w-4" />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                disabled={isSaving}
                maxLength={80}
              />

              <div className="space-y-1">
                <label className="px-1 text-label font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Email Address
                </label>
                <div className="flex h-12 w-full items-center gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 opacity-60">
                  <Mail className="h-4 w-4 flex-shrink-0 text-outline" />
                  <span className="truncate text-sm text-on-surface-variant">
                    {user.email}
                  </span>
                  <span className="ml-auto flex-shrink-0 rounded-md bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-outline">
                    Read-only
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSaving || !hasChanges || !fullName.trim()}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </section>

        <SectionDivider />

        {/* Danger Zone */}
        <section>
          <SectionTitle
            icon={<AlertTriangle className="h-4 w-4" />}
            title="Danger Zone"
            description="Irreversible and destructive actions. Please proceed with caution."
          />

          <div className="overflow-hidden rounded-xl border border-error/25 bg-error/[0.03]">
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-error/10">
                  <LogOut className="h-4 w-4 text-error" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Sign Out</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant">
                    Sign out of your account on this device. Your data will
                    remain intact.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex h-10 flex-shrink-0 items-center justify-center gap-2 rounded-lg border border-error/30 bg-error/10 px-5 text-sm font-bold text-error transition-all hover:bg-error/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-12 pb-4 text-center">
          <p className="text-xs text-outline">
            BookCircle &copy; {new Date().getFullYear()} &mdash; All rights
            reserved
          </p>
        </div>
      </div>
    </div>
  );
};
