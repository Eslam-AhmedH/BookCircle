import axiosInstance from './axiosInstance'
import type { ICommentService } from '../interfaces/ICommentService'
import type { Comment } from '../../entities/comment'

export const commentService: ICommentService = {

  async getComments(bookId: number): Promise<Comment[]> {
    const response = await axiosInstance.get(`/api/books/${bookId}/comments`)
    return response.data
  },

  async addComment(
    bookId: number,
    content: string,
    parentId?: number
  ): Promise<Comment> {
    const response = await axiosInstance.post(
      `/api/books/${bookId}/comments`,
      {
        content,
        parentId: parentId ?? null,
      }
    )
    return response.data
  },

  async deleteComment(commentId: number): Promise<void> {
    await axiosInstance.delete(`/api/comments/${commentId}`)
  },
}