import { useNavigate } from "react-router-dom";
import type { Book } from "../entities/book";
import { StatusChip } from "../shared/ui/StatusChip";
import {
  buildBookPath,
  buildGuestBookPath,
} from "../shared/config/routes";

interface BookGridCardProps {
  book: Book;
  guestMode?: boolean;
}

export const BookGridCard = ({
  book,
  guestMode = false,
}: BookGridCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(guestMode ? buildGuestBookPath(book.id) : buildBookPath(book.id));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(
        guestMode ? buildGuestBookPath(book.id) : buildBookPath(book.id),
      );
    }
  };

  return (
    <article
      className="group relative flex cursor-pointer flex-col"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open ${book.title}`}
    >
      <div className="relative mb-6 aspect-[3/4] overflow-visible rounded-lg bg-surface-container-high transition-transform duration-300 group-hover:-translate-y-2">
        <div className="absolute inset-0 rounded-lg opacity-0 shadow-ambient transition-opacity group-hover:opacity-100" />

        <img
          alt={book.title}
          className="absolute -right-4 -top-4 h-full w-full rounded-lg object-cover shadow-2xl"
          src={book.coverImageUrl}
        />

        <div className="absolute left-2 top-2 z-20">
          <StatusChip status={book.status} />
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          {book.genre}
        </p>

        <h3 className="mb-2 text-lg font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">
          {book.title}
        </h3>

        <p className="mb-1 text-sm text-on-surface-variant">
          {book.author}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="font-medium text-on-surface-variant">
            ${book.borrowPrice.toFixed(2)} / week
          </span>
        </div>
      </div>
    </article>
  );
};