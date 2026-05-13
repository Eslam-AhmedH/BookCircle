export interface Comment {
  id: number
  bookId: number
  userId: string
  userName: string
  userAvatarUrl?: string
  content: string
  createdAt: string
  parentId: number | null // null = top-level, number = reply to comment id
}
