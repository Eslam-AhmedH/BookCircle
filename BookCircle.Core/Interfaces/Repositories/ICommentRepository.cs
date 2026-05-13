using BookCircle.Core.Entities;

namespace BookCircle.Core.Interfaces.Repositories;

public interface ICommentRepository
{
    Task<IEnumerable<Comment>> GetByBookIdAsync(int bookId);
    Task<Comment?> GetByIdAsync(int id);
    Task AddAsync(Comment comment);
    void Delete(Comment comment);
}
