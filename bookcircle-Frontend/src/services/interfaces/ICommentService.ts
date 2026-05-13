import type { Comment } from '../../entities/comment'

export interface ICommentService {
  getComments(bookId: number): Promise<Comment[]>
  addComment(bookId: number, content: string, parentId?: number): Promise<Comment>
  deleteComment(commentId: number): Promise<void>
}
