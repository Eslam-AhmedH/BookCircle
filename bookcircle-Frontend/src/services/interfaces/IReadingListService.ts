import type { ReadingList, ReadingListItem } from '../../entities/reading-list'

export interface IReadingListService {
  getLists(): Promise<ReadingList[]>
  getListItems(listId: number): Promise<ReadingListItem[]>
  createList(name: string): Promise<ReadingList>
  addBook(listId: number, bookId: number): Promise<ReadingListItem>
  removeBook(listId: number, bookId: number): Promise<void>
}
