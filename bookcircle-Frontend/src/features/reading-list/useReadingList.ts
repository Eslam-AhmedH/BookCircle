import { useAsync } from '../../shared/lib/useAsync'
import { readingListService } from '../../services'

export const useReadingLists = () => {
  return useAsync(() => readingListService.getLists(), [])
}

export const useReadingListItems = (listId: number | null) => {
  return useAsync(
    () =>
      listId !== null
        ? readingListService.getListItems(listId)
        : Promise.resolve([]),
    [listId],
  )
}
