using BookCircle.Core.Entities;
using BookCircle.Core.Enums;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookCircle.Infrastructure.Repositories;

public class BorrowRequestRepository : IBorrowRequestRepository
{
    private readonly AppDbContext _context;

    public BorrowRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BorrowRequest>> GetIncomingAsync(string ownerId)
        => await _context.BorrowRequests
            .Include(r => r.Book).ThenInclude(b => b.Owner)
            .Include(r => r.Requester)
            .Where(r => r.Book.OwnerId == ownerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<BorrowRequest>> GetMineAsync(string requesterId)
        => await _context.BorrowRequests
            .Include(r => r.Book).ThenInclude(b => b.Owner)
            .Include(r => r.Requester)
            .Where(r => r.RequesterId == requesterId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<BorrowRequest?> GetByIdAsync(int id)
        => await _context.BorrowRequests
            .Include(r => r.Book).ThenInclude(b => b.Owner)
            .Include(r => r.Requester)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<bool> HasPendingRequestAsync(int bookId, string requesterId)
        => await _context.BorrowRequests
            .AnyAsync(r =>
                r.BookId == bookId &&
                r.RequesterId == requesterId &&
                r.Status == BorrowRequestStatus.Pending);

    public async Task AddAsync(BorrowRequest request)
        => await _context.BorrowRequests.AddAsync(request);

    public void Update(BorrowRequest request)
        => _context.BorrowRequests.Update(request);
}
