import axiosInstance from './axiosInstance'
import type {
  IBooksService,
  BooksQueryParams,
  CreateBookData,
} from '../interfaces/IBooksService'
import type { Book } from '../../entities/book'

export const booksService: IBooksService = {

  async getAll(params?: BooksQueryParams): Promise<Book[]> {
    const response = await axiosInstance.get('/api/books', {
      params: {
        q: params?.searchTerm,
        genre: params?.genre,
        status: params?.status,
        language: params?.language,
        maxPrice: params?.maxPrice,
        page: 1,
        limit: 100,
      },
    })
    return response.data.items ?? response.data
  },

  async getOwnerBooks(ownerId: string): Promise<Book[]> {
    const response = await axiosInstance.get(`/api/books/owner/${ownerId}`)
    return response.data
  },

  async getById(id: number): Promise<Book> {
    const response = await axiosInstance.get(`/api/books/${id}`)
    return response.data
  },

  async create(data: CreateBookData): Promise<Book> {
    const placeholderImage = `https://picsum.photos/seed/${encodeURIComponent(data.title)}/300/450`
    
    // If coverImage is a string (URL), use it. Otherwise fallback to placeholder.
    const finalImageUrl = typeof data.coverImage === 'string' && data.coverImage.trim() !== '' 
      ? data.coverImage 
      : placeholderImage;

    const response = await axiosInstance.post('/api/books', {
      title: data.title,
      author: data.author,
      genre: data.genre,
      isbn: data.isbn,
      language: data.language,
      publicationDate: data.publicationDate,
      borrowPrice: data.borrowPrice,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      description: data.description,
      coverImageUrl: finalImageUrl,
    })
    return response.data
  },

  async update(id: number, data: Partial<CreateBookData>): Promise<Book> {
    const payload: any = {
      title: data.title,
      author: data.author,
      genre: data.genre,
      isbn: data.isbn,
      language: data.language,
      publicationDate: data.publicationDate,
      borrowPrice: data.borrowPrice,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      description: data.description,
    };
    
    if (typeof data.coverImage === 'string' && data.coverImage.trim() !== '') {
        payload.coverImageUrl = data.coverImage;
    }
      
    const response = await axiosInstance.patch(`/api/books/${id}`, payload)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/api/books/${id}`)
  },

  async react(
      id: number,
      reaction: 'Like' | 'Dislike'
  ): Promise<{ likes: number; dislikes: number }> {
    const response = await axiosInstance.post(`/api/books/${id}/reactions`, {
      reaction,
    })
    return response.data
  },
}
