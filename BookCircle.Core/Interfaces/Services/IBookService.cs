using BookCircle.Core.DTOs.Books;
using BookCircle.Core.DTOs.Common;

namespace BookCircle.Core.Interfaces.Services;

public interface IBookService
{
    Task<PaginatedResult<BookDto>> GetAllAsync(BookQueryParams queryParams);
    Task<BookDto> GetByIdAsync(int id);
    Task<IEnumerable<BookDto>> GetByOwnerIdAsync(string ownerId, string requestingUserId, string requestingUserRole);
    Task<BookDto> CreateAsync(string ownerId, CreateBookDto dto);
    Task<BookDto> UpdateAsync(int id, string userId, string userRole, UpdateBookDto dto);
    Task DeleteAsync(int id, string userId, string userRole);
    Task<ReactionResponseDto> ReactAsync(int bookId, string userId, string reaction);
}
