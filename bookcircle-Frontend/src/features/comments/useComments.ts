import { useAsync } from '../../shared/lib/useAsync'
import { commentService } from '../../services'

export const useComments = (bookId: number) =>
  useAsync(() => commentService.getComments(bookId), [bookId])
