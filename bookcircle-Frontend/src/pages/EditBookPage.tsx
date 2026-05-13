import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, BookOpen, ArrowLeft, Link as LinkIcon, Image as ImageIcon, UploadCloud } from "lucide-react";
import { booksService } from "../services";
import { useAuth } from "../app/providers/AuthContext";
import { useToast } from "../app/providers/ToastContext";
import { useBook } from "../features/books/useBooks";
import { navPaths } from "../shared/config/routes";
import { Button } from "../shared/ui/Button";
import { InputField } from "../shared/ui/InputField";
import { ErrorState } from "../shared/ui/ErrorState";
import { SkeletonText } from "../shared/ui/SkeletonCard";
import axiosInstance from "../services/api/axiosInstance";

const GENRES = [
  "Literary Fiction",
  "Fantasy",
  "Science Fiction",
  "Technology",
  "Design",
  "Psychology",
  "Self-Improvement",
  "Psychological Thriller",
] as const;

const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "German",
  "Arabic",
  "Other",
] as const;

interface FormState {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  language: string;
  publicationDate: string;
  borrowPrice: string;
  availableFrom: string;
  availableTo: string;
  description: string;
  coverImageUrl: string;
}

const EditBookSkeleton = () => (
  <div className="mx-auto flex max-w-6xl flex-col gap-10 py-8 lg:flex-row lg:gap-14">
    <aside className="flex-shrink-0 lg:w-72">
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
        <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-white/[0.06]" />
      </div>
    </aside>
    <section className="min-w-0 flex-1">
      <div className="mb-10 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-12 w-2/3 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.06]" />
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <SkeletonText lines={1} />
          <div className="mt-2 h-12 animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <SkeletonText lines={1} />
            <div className="mt-2 h-12 animate-pulse rounded-lg bg-white/[0.06]" />
          </div>
        ))}
        <div className="md:col-span-2">
          <SkeletonText lines={1} />
          <div className="mt-2 h-32 animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
      </div>
    </section>
  </div>
);

export const EditBookPage = () => {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id ?? "0", 10);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: book, isLoading, error, refetch } = useBook(bookId);

  const [form, setForm] = useState<FormState>({
    title: "",
    author: "",
    genre: GENRES[0],
    isbn: "",
    language: LANGUAGES[0],
    publicationDate: "",
    borrowPrice: "",
    availableFrom: "",
    availableTo: "",
    description: "",
    coverImageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (!book || prefilled) return;
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      language: book.language,
      publicationDate: book.publicationDate,
      borrowPrice: String(book.borrowPrice),
      availableFrom: book.availableFrom,
      availableTo: book.availableTo,
      description: book.description ?? "",
      coverImageUrl: book.coverImageUrl ?? "",
    });
    setPrefilled(true);
  }, [book, prefilled]);

  const handleFieldChange =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrorMsg(null);
    };

  const handleRemoveCover = () => {
    setForm(prev => ({ ...prev, coverImageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        setForm((prev) => ({ ...prev, coverImageUrl: response.data.url }));
        showToast("Cover image uploaded successfully", "success");
      } catch (err) {
        showToast("Failed to upload image", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate(navPaths.ownerDashboard);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!form.isbn.trim()) {
      setErrorMsg("ISBN is required.");
      return;
    }
    const price = parseFloat(form.borrowPrice);
    if (isNaN(price) || price <= 0) {
      setErrorMsg("Borrow price must be greater than 0.");
      return;
    }
    if (
      form.availableFrom &&
      form.availableTo &&
      form.availableTo < form.availableFrom
    ) {
      setErrorMsg("Available To date must be on or after Available From date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await booksService.update(bookId, {
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre,
        isbn: form.isbn.trim(),
        language: form.language,
        publicationDate: form.publicationDate,
        borrowPrice: price,
        availableFrom: form.availableFrom,
        availableTo: form.availableTo,
        description: form.description.trim(),
        coverImage: form.coverImageUrl.trim() || undefined,
      } as any);
      showToast("Book updated successfully!", "success");
      navigate(navPaths.ownerDashboard);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update book. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <EditBookSkeleton />;

  if (error || !book) {
    return (
      <div className="py-8">
        <ErrorState message={error || "Book not found."} onRetry={refetch} />
      </div>
    );
  }

  if (user && user.role !== "Admin" && book.ownerId !== user.id) {
    return (
      <div className="py-8">
        <ErrorState message="You can only edit your own books." />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 py-8 lg:flex-row lg:gap-14">
      {/* Left — Cover Upload Panel */}
      <aside className="flex-shrink-0 lg:w-72">
        <div className="sticky top-8 flex flex-col gap-4">
          <p className="px-1 text-label font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Book Cover
          </p>

          {form.coverImageUrl ? (
            <div className="group relative overflow-hidden rounded-xl shadow-soft">
              <img
                src={form.coverImageUrl}
                alt="Cover preview"
                className="aspect-[3/4] w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(form.title || 'book')}/300/450`;
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-error/90 text-white transition-transform hover:scale-110"
                  aria-label="Remove cover image"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="cover-upload"
              className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low transition-colors ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-primary/60 hover:bg-surface-container-high'}`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                {isUploading ? (
                   <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                ) : (
                   <UploadCloud className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-semibold text-primary">
                  {isUploading ? "Uploading..." : "Click to Browse"}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Select a photo from your device
                </p>
              </div>
            </label>
          )}

          <input
            id="cover-upload"
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isSubmitting || isUploading}
          />

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-outline-variant/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-outline">
              OR
            </span>
            <div className="h-px flex-1 bg-outline-variant/20" />
          </div>

          <InputField
            label="Cover Image URL"
            type="url"
            placeholder="https://example.com/cover.jpg"
            value={form.coverImageUrl}
            onChange={handleFieldChange("coverImageUrl")}
            disabled={isSubmitting || isUploading}
            icon={<LinkIcon className="h-4 w-4" />}
          />

          <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 mt-2">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold text-on-surface">Cover Tip</p>
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Updating your cover to a high-quality image can increase your
              book's appeal. Click the box above to select from your device, or paste a direct URL below.
            </p>
          </div>
        </div>
      </aside>

      {/* Right — Form */}
      <section className="min-w-0 flex-1">
        <header className="mb-10">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
            Owner Portal
          </p>
          <h1 className="mb-3 text-5xl font-extrabold tracking-tight text-on-surface">
            Edit Book
          </h1>
          <p className="max-w-lg text-on-surface-variant">
            Update the details for{" "}
            <span className="font-semibold text-on-surface">{book.title}</span>.
            Changes will be reflected immediately.
          </p>
        </header>

        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-error/30 bg-error/10 px-4 py-3">
            <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-error" />
            <p className="text-sm text-error">{errorMsg}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2"
        >
          {/* Title */}
          <div className="md:col-span-2">
            <InputField
              label="Title"
              placeholder="e.g. The Shadow of the Wind"
              value={form.title}
              onChange={handleFieldChange("title")}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Author */}
          <div className="md:col-span-2">
            <InputField
              label="Author"
              placeholder="e.g. Carlos Ruiz Zafón"
              value={form.author}
              onChange={handleFieldChange("author")}
              disabled={isSubmitting}
            />
          </div>

          {/* Genre */}
          <div>
            <label className="mb-2 block px-1 text-label font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Genre
            </label>
            <select
              value={form.genre}
              onChange={handleFieldChange("genre")}
              disabled={isSubmitting}
              className="h-12 w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 text-on-surface transition-all duration-200 focus:border-primary focus:outline-none focus:shadow-glow disabled:opacity-50"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* ISBN */}
          <div>
            <InputField
              label="ISBN-13"
              placeholder="978-XXXXXXXXXX"
              value={form.isbn}
              onChange={handleFieldChange("isbn")}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Language */}
          <div>
            <label className="mb-2 block px-1 text-label font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Language
            </label>
            <select
              value={form.language}
              onChange={handleFieldChange("language")}
              disabled={isSubmitting}
              className="h-12 w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 text-on-surface transition-all duration-200 focus:border-primary focus:outline-none focus:shadow-glow disabled:opacity-50"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Publication Date */}
          <div>
            <InputField
              label="Publication Date"
              type="date"
              value={form.publicationDate}
              onChange={handleFieldChange("publicationDate")}
              disabled={isSubmitting}
            />
          </div>

          {/* Borrow Price */}
          <div>
            <InputField
              label="Borrow Price ($)"
              type="number"
              min={0}
              step={0.5}
              placeholder="e.g. 2.50"
              value={form.borrowPrice}
              onChange={handleFieldChange("borrowPrice")}
              disabled={isSubmitting}
            />
          </div>

          {/* Available From */}
          <div>
            <InputField
              label="Available From"
              type="date"
              value={form.availableFrom}
              onChange={handleFieldChange("availableFrom")}
              disabled={isSubmitting}
            />
          </div>

          {/* Available To */}
          <div>
            <InputField
              label="Available To"
              type="date"
              value={form.availableTo}
              onChange={handleFieldChange("availableTo")}
              min={form.availableFrom || undefined}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block px-1 text-label font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Description
            </label>
            <textarea
              rows={5}
              placeholder="A captivating synopsis that draws readers in..."
              value={form.description}
              onChange={handleFieldChange("description")}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-outline transition-all duration-200 focus:border-primary focus:outline-none focus:shadow-glow disabled:opacity-50"
            />
          </div>

          {/* Approval notice */}
          {!book.isApproved && (
            <div className="flex items-start gap-3 rounded-lg border border-tertiary/20 bg-tertiary/10 px-4 py-3 md:col-span-2">
              <span className="material-symbols-outlined mt-0.5 text-base text-tertiary">
                info
              </span>
              <p className="text-sm text-tertiary">
                This book is still pending admin approval. You can update its
                details while it awaits review.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-outline-variant/15 pt-6 md:col-span-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="font-semibold text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[160px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};
