import { booksService } from "../../services";
import { useAsync } from "../../shared/lib/useAsync";
import { useSocketEvent } from "../socket/useSocket";
import type { BooksQueryParams } from "../../services/interfaces/IBooksService";

export const useBooks = (params?: BooksQueryParams) => {
  const stableKey = JSON.stringify(params ?? {});
  const state = useAsync(() => booksService.getAll(params), [stableKey]);
  
  useSocketEvent("book_status_changed", () => {
    void state.refetch(true);
  });
  
  return state;
};

export const useBook = (id: number) => {
  const state = useAsync(() => booksService.getById(id), [id]);
  
  useSocketEvent("book_status_changed", (payload: any) => {
    if (payload.bookId === id) {
      void state.refetch(true);
    }
  });
  
  return state;
};

export const useOwnerBooks = (ownerId: string) => {
  const state = useAsync(() => booksService.getOwnerBooks(ownerId), [ownerId]);
  
  useSocketEvent("book_status_changed", () => {
    void state.refetch(true);
  });
  
  return state;
};
