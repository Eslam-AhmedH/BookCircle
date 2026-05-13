using BookCircle.Core.Entities;

namespace BookCircle.Core.Interfaces.Repositories;

public interface IReadingListRepository
{
    Task<IEnumerable<ReadingList>> GetByUserIdAsync(string userId);
    Task<ReadingList?> GetByIdAsync(int id);
    Task<IEnumerable<ReadingListItem>> GetItemsByListIdAsync(int listId);
    Task<ReadingListItem?> GetItemAsync(int listId, int bookId);
    Task<bool> ItemExistsAsync(int listId, int bookId);
    Task AddListAsync(ReadingList list);
    Task AddItemAsync(ReadingListItem item);
    void DeleteItem(ReadingListItem item);
}
