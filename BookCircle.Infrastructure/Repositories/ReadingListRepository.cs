using BookCircle.Core.Entities;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookCircle.Infrastructure.Repositories;

public class ReadingListRepository : IReadingListRepository
{
    private readonly AppDbContext _context;

    public ReadingListRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ReadingList>> GetByUserIdAsync(string userId)
        => await _context.ReadingLists
            .Include(rl => rl.Items)
            .Include(rl => rl.Collaborators)
            .Where(rl => rl.UserId == userId || rl.Collaborators.Any(c => c.UserId == userId))
            .OrderByDescending(rl => rl.CreatedAt)
            .ToListAsync();

    public async Task<ReadingList?> GetByIdAsync(int id)
        => await _context.ReadingLists
            .Include(rl => rl.Items).ThenInclude(i => i.Book)
            .Include(rl => rl.Collaborators)
            .FirstOrDefaultAsync(rl => rl.Id == id);

    public async Task<IEnumerable<ReadingListItem>> GetItemsByListIdAsync(int listId)
        => await _context.ReadingListItems
            .Include(i => i.Book).ThenInclude(b => b.Owner)
            .Where(i => i.ReadingListId == listId)
            .OrderByDescending(i => i.AddedAt)
            .ToListAsync();

    public async Task<ReadingListItem?> GetItemAsync(int listId, int bookId)
        => await _context.ReadingListItems
            .FirstOrDefaultAsync(i => i.ReadingListId == listId && i.BookId == bookId);

    public async Task<bool> ItemExistsAsync(int listId, int bookId)
        => await _context.ReadingListItems
            .AnyAsync(i => i.ReadingListId == listId && i.BookId == bookId);

    public async Task AddListAsync(ReadingList list)
        => await _context.ReadingLists.AddAsync(list);

    public async Task AddItemAsync(ReadingListItem item)
        => await _context.ReadingListItems.AddAsync(item);

    public void DeleteItem(ReadingListItem item)
        => _context.ReadingListItems.Remove(item);
}
