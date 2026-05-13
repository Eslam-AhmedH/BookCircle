export interface ReadingList {
  id: number
  userId: string
  name: string
  createdAt: string
}

export interface ReadingListItem {
  id: number
  readingListId: number
  bookId: number
  title: string
  author: string
  genre: string
  coverImageUrl: string
  status: 'Available' | 'Borrowed'
  addedAt: string
}
