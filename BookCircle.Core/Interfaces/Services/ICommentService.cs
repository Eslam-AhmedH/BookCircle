using BookCircle.Core.DTOs.Comments;

namespace BookCircle.Core.Interfaces.Services;

public interface ICommentService
{
    Task<IEnumerable<CommentDto>> GetByBookIdAsync(int bookId);
    Task<CommentDto> CreateAsync(int bookId, string userId, CreateCommentDto dto);
    Task DeleteAsync(int commentId, string userId, string userRole);
}
