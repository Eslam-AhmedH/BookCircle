export type BookStatus = "Available" | "Borrowed";

export interface Book {
  id: number;
  ownerId: string;
  ownerName: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  language: string;
  publicationDate: string;
  borrowPrice: number;
  status: BookStatus;
  availableFrom: string;
  availableTo: string;
  coverImageUrl: string;
  isApproved: boolean;
  description?: string;
  likes?: number;
  dislikes?: number;
}
