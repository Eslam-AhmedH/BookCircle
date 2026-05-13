using BookCircle.Core.DTOs.Auth;
using BookCircle.Core.DTOs.Books;

namespace BookCircle.Core.Interfaces.Services;

public interface IAdminService
{
    Task<IEnumerable<UserDto>> GetPendingUsersAsync();
    Task ApproveUserAsync(string userId);
    Task RejectUserAsync(string userId);
    Task<IEnumerable<BookDto>> GetPendingBooksAsync();
    Task ApproveBookAsync(int bookId);
    Task RejectBookAsync(int bookId);
    Task DeleteUserAsync(string userId);
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
}
