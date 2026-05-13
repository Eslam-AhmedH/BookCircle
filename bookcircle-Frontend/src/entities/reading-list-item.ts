export interface ReadingListItem {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: "Available" | "Borrowed";
  imageUrl: string;
}
