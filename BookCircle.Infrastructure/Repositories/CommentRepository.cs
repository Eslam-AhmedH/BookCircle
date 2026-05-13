using BookCircle.Core.Entities;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookCircle.Infrastructure.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly AppDbContext _context;

    public CommentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Comment>> GetByBookIdAsync(int bookId)
        => await _context.Comments
            .Include(c => c.User)
            .Where(c => c.BookId == bookId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

    public async Task<Comment?> GetByIdAsync(int id)
        => await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Replies)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task AddAsync(Comment comment)
        => await _context.Comments.AddAsync(comment);

    public void Delete(Comment comment)
        => _context.Comments.Remove(comment);
}
