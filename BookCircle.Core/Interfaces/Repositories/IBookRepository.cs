using BookCircle.Core.DTOs.Books;
using BookCircle.Core.Entities;

namespace BookCircle.Core.Interfaces.Repositories;

public interface IBookRepository
{
    Task<(IEnumerable<Book> Books, int Total)> GetAllAsync(BookQueryParams queryParams);
    Task<Book?> GetByIdAsync(int id);
    Task<IEnumerable<Book>> GetByOwnerIdAsync(string ownerId);
    Task<IEnumerable<Book>> GetPendingBooksAsync();
    Task<BookReaction?> GetReactionAsync(int bookId, string userId);
    Task AddAsync(Book book);
    void Update(Book book);
    void Delete(Book book);
    void AddReaction(BookReaction reaction);
    void UpdateReaction(BookReaction reaction);
}
