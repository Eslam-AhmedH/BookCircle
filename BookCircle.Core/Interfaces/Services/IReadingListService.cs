using BookCircle.Core.DTOs.ReadingLists;

namespace BookCircle.Core.Interfaces.Services;

public interface IReadingListService
{
    Task<IEnumerable<ReadingListDto>> GetByUserIdAsync(string userId);
    Task<ReadingListDto> CreateAsync(string userId, CreateReadingListDto dto);
    Task<IEnumerable<ReadingListItemDto>> GetItemsAsync(int listId, string userId);
    Task<ReadingListItemDto> AddItemAsync(int listId, string userId, AddReadingListItemDto dto);
    Task RemoveItemAsync(int listId, int bookId, string userId);
    Task AddCollaboratorAsync(int listId, string ownerId, AddCollaboratorDto dto);
    Task RemoveCollaboratorAsync(int listId, string ownerId, RemoveCollaboratorDto dto);
}
