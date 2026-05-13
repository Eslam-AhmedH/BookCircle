import type { Book } from "../../entities/book";

export interface BooksQueryParams {
  searchTerm?: string;
  genre?: string;
  status?: string;
  language?: string;
  maxPrice?: number;
}

export interface CreateBookData {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  language: string;
  publicationDate: string;
  borrowPrice: number;
  availableFrom: string;
  availableTo: string;
  description?: string;
  coverImage?: File | null;
}

export interface IBooksService {
  getAll(params?: BooksQueryParams): Promise<Book[]>;
  getOwnerBooks(ownerId: string): Promise<Book[]>;
  getById(id: number): Promise<Book>;
  create(data: CreateBookData): Promise<Book>;
  update(id: number, data: Partial<CreateBookData>): Promise<Book>;
  delete(id: number): Promise<void>;
  react(
    id: number,
    reaction: "Like" | "Dislike",
  ): Promise<{ likes: number; dislikes: number }>;
}
