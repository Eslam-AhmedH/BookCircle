import type { Book } from "../../entities/book";
import type { UserProfile } from "../../entities/user";

export interface IAdminService {
  getPendingUsers(): Promise<UserProfile[]>;
  approveUser(userId: string): Promise<void>;
  rejectUser(userId: string): Promise<void>;
  getPendingBooks(): Promise<Book[]>;
  approveBook(bookId: number): Promise<void>;
  rejectBook(bookId: number): Promise<void>;
}
