using BookCircle.Core.Entities;

namespace BookCircle.Core.Interfaces.Repositories;

public interface IBorrowRequestRepository
{
    Task<IEnumerable<BorrowRequest>> GetIncomingAsync(string ownerId);
    Task<IEnumerable<BorrowRequest>> GetMineAsync(string requesterId);
    Task<BorrowRequest?> GetByIdAsync(int id);
    Task<bool> HasPendingRequestAsync(int bookId, string requesterId);
    Task AddAsync(BorrowRequest request);
    void Update(BorrowRequest request);
}
