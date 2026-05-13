import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ReadingList } from "../entities/reading-list";
import type { Comment } from "../entities/comment";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookmarkPlus,
  Send,
  ChevronDown,
  Check,
  Calendar,
  Globe,
  Hash,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../app/providers/AuthContext";
import { useToast } from "../app/providers/ToastContext";
import { useBook } from "../features/books/useBooks";
import { useReadingLists } from "../features/reading-list/useReadingList";
import { useComments } from "../features/comments/useComments";
import { useSocketEvent } from "../features/socket/useSocket";
import {
  booksService,
  requestsService,
  readingListService,
  commentService,
} from "../services";
import { appRoutes } from "../shared/config/routes";
import { Button } from "../shared/ui/Button";
import { StatusChip } from "../shared/ui/StatusChip";
import { SkeletonBookDetail } from "../shared/ui/SkeletonCard";
import { ErrorState } from "../shared/ui/ErrorState";

const Meta = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-outline">
      {icon}
      {label}
    </p>
    <p className="font-medium text-on-surface">{value}</p>
  </div>
);

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const numericId = parseInt(id ?? "", 10);

  useEffect(() => {
    if (Number.isNaN(numericId)) {
      navigate(appRoutes.notFound, { replace: true });
    }
  }, [numericId, navigate]);

  const {
    data: book,
    isLoading,
    error,
    refetch,
  } = useBook(Number.isNaN(numericId) ? -1 : numericId);

  const { data: rawReadingLists } = useReadingLists();
  const readingLists = rawReadingLists as ReadingList[] | null;

  const [likes, setLikes] = useState<number | null>(null);
  const [dislikes, setDislikes] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [savingListId, setSavingListId] = useState<number | null>(null);
  const [savedListIds, setSavedListIds] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: fetchedComments, refetch: refetchComments } = useComments(
    Number.isNaN(numericId) ? -1 : numericId,
  );

  const saveDropdownRef = useRef<HTMLDivElement>(null);

  // Sync likes/dislikes from book data once loaded
  useEffect(() => {
    if (book) {
      setLikes(book.likes ?? 0);
      setDislikes(book.dislikes ?? 0);
    }
  }, [book]);

  // Redirect to 404 if book not found after loading
  useEffect(() => {
    if (!isLoading && !error && book === null) {
      navigate(appRoutes.notFound, { replace: true });
    }
  }, [isLoading, error, book, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        saveDropdownRef.current &&
        !saveDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSaveOpen(false);
      }
    };
    if (isSaveOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSaveOpen]);

  useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  const handleNewComment = useCallback(
    (payload: {
      commentId: number;
      bookId: number;
      userName: string;
      content: string;
      parentId: number | null;
    }) => {
      if (payload.bookId !== numericId) return;
      void refetchComments();
    },
    [numericId, refetchComments],
  );

  useSocketEvent("comment_new", handleNewComment);

  if (Number.isNaN(numericId)) return null;

  if (isLoading) {
    return (
      <div className="py-8">
        <SkeletonBookDetail />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!book) return null;

  const currentLikes = likes ?? book.likes ?? 0;
  const currentDislikes = dislikes ?? book.dislikes ?? 0;

  const handleLike = async () => {
    if (!isAuthenticated || hasLiked) return;
    const prevLikes = currentLikes;
    const prevDisliked = hasDisliked;
    const prevDislikes = currentDislikes;

    setHasLiked(true);
    setLikes(currentLikes + 1);
    if (hasDisliked) {
      setHasDisliked(false);
      setDislikes(Math.max(0, currentDislikes - 1));
    }

    try {
      const result = await booksService.react(book.id, "Like");
      setLikes(result.likes);
      setDislikes(result.dislikes);
    } catch {
      setHasLiked(false);
      setLikes(prevLikes);
      setHasDisliked(prevDisliked);
      setDislikes(prevDislikes);
      showToast("Failed to register reaction.", "error");
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated || hasDisliked) return;
    const prevDislikes = currentDislikes;
    const prevLiked = hasLiked;
    const prevLikes = currentLikes;

    setHasDisliked(true);
    setDislikes(currentDislikes + 1);
    if (hasLiked) {
      setHasLiked(false);
      setLikes(Math.max(0, currentLikes - 1));
    }

    try {
      const result = await booksService.react(book.id, "Dislike");
      setLikes(result.likes);
      setDislikes(result.dislikes);
    } catch {
      setHasDisliked(false);
      setDislikes(prevDislikes);
      setHasLiked(prevLiked);
      setLikes(prevLikes);
      showToast("Failed to register reaction.", "error");
    }
  };

  const handleBorrowRequest = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      await requestsService.sendRequest(book.id);
      showToast("Borrow request sent!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to send request.",
        "error",
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleToggleSaveDropdown = () => {
    setIsSaveOpen((prev) => !prev);
  };

  const handleSaveToList = async (listId: number) => {
    if (savingListId !== null) return;
    setSavingListId(listId);
    try {
      await readingListService.addBook(listId, book.id);
      setSavedListIds((prev) => new Set(prev).add(listId));
      showToast("Book saved to list!", "success");
      setIsSaveOpen(false);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save to list.",
        "error",
      );
    } finally {
      setSavingListId(null);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied!", "success");
    } catch {
      showToast("Could not copy link.", "error");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const newComment = await commentService.addComment(book.id, text);
      setComments((prev) => (prev ? [...prev, newComment] : [newComment]));
      setNewCommentText("");
      showToast("Comment posted!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to post comment.",
        "error",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const newReply = await commentService.addComment(book.id, text, parentId);
      setComments((prev) => (prev ? [...prev, newReply] : [newReply]));
      setReplyText("");
      setReplyingTo(null);
      showToast("Reply posted!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to post reply.",
        "error",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const isReader = user?.role === "Reader";
  const canReact = isAuthenticated;
  const canSave = isAuthenticated && isReader;
  const allComments = comments ?? [];
  const topLevelComments = allComments.filter((c) => c.parentId === null);

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* ── Left: Cover + Reactions ── */}
        <section className="lg:col-span-5">
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-primary-container/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-xl shadow-soft">
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="aspect-[3/4] w-full object-cover"
              />
              {/* Status chip on image */}
              <div className="absolute left-4 top-4">
                <StatusChip status={book.status} />
              </div>
            </div>
          </div>

          {/* Reaction buttons */}
          {canReact && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLike}
                disabled={hasLiked}
                className={[
                  "flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition-all duration-200",
                  hasLiked
                    ? "border-primary/40 bg-primary/15 text-primary cursor-default"
                    : "border-outline-variant/20 bg-surface-container-high text-on-surface-variant hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
                ].join(" ")}
                aria-label={`Like — ${currentLikes}`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{currentLikes.toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={handleDislike}
                disabled={hasDisliked}
                className={[
                  "flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition-all duration-200",
                  hasDisliked
                    ? "border-error/30 bg-error/10 text-error cursor-default"
                    : "border-outline-variant/20 bg-surface-container-high text-on-surface-variant hover:border-error/20 hover:bg-error/5 hover:text-error",
                ].join(" ")}
                aria-label={`Dislike — ${currentDislikes}`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{currentDislikes.toLocaleString()}</span>
              </button>
            </div>
          )}

          {/* Pricing */}
          <div className="mt-6 rounded-xl border border-outline-variant/15 bg-surface-container-low p-5 text-center">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-outline">
              Borrow price
            </p>
            <p className="text-2xl font-extrabold text-primary">
              ${book.borrowPrice.toFixed(2)}
              <span className="ml-1 text-sm font-medium text-on-surface-variant">
                / week
              </span>
            </p>
            {book.availableFrom && book.availableTo && (
              <p className="mt-2 text-xs text-outline">
                Available{" "}
                {new Date(book.availableFrom).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {new Date(book.availableTo).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </section>

        {/* ── Right: Details ── */}
        <section className="space-y-8 lg:col-span-7">
          {/* Genre + Status */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-tertiary-container/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-tertiary">
              {book.genre}
            </span>
            <StatusChip status={book.status} className="rounded-full" />
          </div>

          {/* Title + Author */}
          <div>
            <h1 className="mb-3 text-4xl font-extrabold leading-tight tracking-tight text-on-surface md:text-5xl">
              {book.title}
            </h1>
            <p className="text-xl font-medium text-on-surface-variant">
              by{" "}
              <span className="font-bold text-on-surface">{book.author}</span>
            </p>
          </div>

          {/* Description */}
          {book.description && (
            <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
              {book.description}
            </p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
            <Meta
              label="Language"
              value={book.language}
              icon={<Globe className="h-3 w-3" />}
            />
            <Meta
              label="ISBN"
              value={book.isbn}
              icon={<Hash className="h-3 w-3" />}
            />
            <Meta
              label="Publication Date"
              value={new Date(book.publicationDate).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
              icon={<Calendar className="h-3 w-3" />}
            />
            <Meta
              label="Owner"
              value={book.ownerName}
              icon={<User className="h-3 w-3" />}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Borrow Request — Reader only, Available books */}
            {isReader && book.status === "Available" && (
              <Button
                className="flex-1"
                size="lg"
                onClick={handleBorrowRequest}
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Request
                  </>
                )}
              </Button>
            )}

            {/* Save to Reading List — Reader only */}
            {canSave && (
              <div className="relative" ref={saveDropdownRef}>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleToggleSaveDropdown}
                  className="gap-2"
                  aria-haspopup="listbox"
                  aria-expanded={isSaveOpen}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Save to List
                  <ChevronDown
                    className={[
                      "h-3 w-3 transition-transform duration-200",
                      isSaveOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </Button>

                {isSaveOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-2 min-w-[220px] overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-high shadow-soft">
                    <div className="flex items-center justify-between border-b border-outline-variant/10 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-outline">
                        Your Lists
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsSaveOpen(false)}
                        className="rounded p-0.5 text-outline transition-colors hover:text-on-surface"
                        aria-label="Close"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {!readingLists || readingLists.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-on-surface-variant">
                          No reading lists yet.
                        </p>
                        <p className="mt-1 text-xs text-outline">
                          Create one from your Reading List page.
                        </p>
                      </div>
                    ) : (
                      <ul className="py-1">
                        {readingLists.map((list) => {
                          const isSaved = savedListIds.has(list.id);
                          const isSaving = savingListId === list.id;
                          return (
                            <li key={list.id}>
                              <button
                                type="button"
                                onClick={() => handleSaveToList(list.id)}
                                disabled={isSaved || isSaving}
                                className={[
                                  "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                                  isSaved
                                    ? "cursor-default text-primary"
                                    : "text-on-surface hover:bg-surface-container-highest",
                                ].join(" ")}
                              >
                                {isSaving ? (
                                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-outline/30 border-t-primary" />
                                ) : isSaved ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  <BookmarkPlus className="h-4 w-4 text-outline" />
                                )}
                                <span className="font-medium">{list.name}</span>
                                {isSaved && (
                                  <span className="ml-auto text-xs text-primary">
                                    Saved
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Share button — always visible */}
            <Button
              variant="secondary"
              size="lg"
              onClick={handleShare}
              aria-label="Share book"
              className="sm:w-14 sm:px-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Not authenticated nudge */}
          {!isAuthenticated && (
            <p className="rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
              <a
                href={appRoutes.login}
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </a>{" "}
              to borrow, save, or react to books.
            </p>
          )}
        </section>
      </div>

      {/* ── Comments Section ── */}
      <section className="mt-16 border-t border-outline-variant/15 pt-10">
        <h2 className="mb-8 text-xl font-bold text-on-surface">
          Comments{" "}
          <span className="ml-2 text-sm font-normal text-on-surface-variant">
            ({allComments.length})
          </span>
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="mb-10">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/30">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share your thoughts on this book..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/40 focus:outline-none focus:shadow-glow"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim() || isSubmittingComment}
                    className="rounded-lg bg-primary-container px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 rounded-xl border border-outline-variant/15 bg-surface-container-low p-5 text-center">
            <p className="mb-3 text-sm text-on-surface-variant">
              Sign in to join the discussion.
            </p>
            <a
              href={appRoutes.login}
              className="rounded-lg bg-primary-container px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
            >
              Sign In
            </a>
          </div>
        )}

        <div className="space-y-6">
          {topLevelComments.map((comment) => {
            const replies = allComments.filter((c) => c.parentId === comment.id);
            const isReplying = replyingTo === comment.id;
            return (
              <div key={comment.id} className="group">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/20">
                    {comment.userAvatarUrl ? (
                      <img
                        src={comment.userAvatarUrl}
                        alt={comment.userName}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        {comment.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 rounded-xl bg-surface-container-low p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-on-surface">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-on-surface-variant/50">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {comment.content}
                    </p>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(isReplying ? null : comment.id);
                          if (isReplying) {
                            setReplyText("");
                          }
                        }}
                        className="mt-2 text-xs font-semibold text-outline transition-colors hover:text-primary"
                      >
                        {isReplying ? "Cancel" : "Reply"}
                      </button>
                    )}
                  </div>
                </div>

                {isReplying && (
                  <form
                    onSubmit={(e) => handleSubmitReply(e, comment.id)}
                    className="ml-12 mt-3 flex gap-3"
                  >
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.userName}...`}
                        rows={2}
                        autoFocus
                        className="w-full resize-none rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/40 focus:outline-none"
                      />
                      <div className="mt-1.5 flex justify-end">
                        <button
                          type="submit"
                          disabled={!replyText.trim() || isSubmittingComment}
                          className="rounded-lg bg-primary-container px-4 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        >
                          {isSubmittingComment ? "Posting..." : "Reply"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {replies.length > 0 && (
                  <div className="ml-12 mt-3 space-y-3 border-l-2 border-outline-variant/10 pl-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/20">
                          {reply.userAvatarUrl ? (
                            <img
                              src={reply.userAvatarUrl}
                              alt={reply.userName}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {reply.userName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 rounded-xl bg-surface-container p-3">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs font-bold text-on-surface">
                              {reply.userName}
                            </span>
                            <span className="text-xs text-on-surface-variant/40">
                              {new Date(reply.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-on-surface-variant">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {topLevelComments.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-on-surface-variant">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
