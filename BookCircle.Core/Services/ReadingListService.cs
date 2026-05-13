using BookCircle.Core.DTOs.ReadingLists;
using BookCircle.Core.Entities;
using BookCircle.Core.Interfaces;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Core.Interfaces.Services;

namespace BookCircle.Core.Services;

public class ReadingListService : IReadingListService
{
    private readonly IReadingListRepository _readingListRepo;
    private readonly IBookRepository _bookRepo;
    private readonly IUnitOfWork _uow;

    public ReadingListService(
        IReadingListRepository readingListRepo,
        IBookRepository bookRepo,
        IUnitOfWork uow)
    {
        _readingListRepo = readingListRepo;
        _bookRepo = bookRepo;
        _uow = uow;
    }

    public async Task<IEnumerable<ReadingListDto>> GetByUserIdAsync(string userId)
    {
        var lists = await _readingListRepo.GetByUserIdAsync(userId);
        return lists.Select(MapToDto);
    }

    public async Task<ReadingListDto> CreateAsync(string userId, CreateReadingListDto dto)
    {
        var list = new ReadingList
        {
            UserId = userId,
            Name = dto.Name,
            CreatedAt = DateTime.UtcNow
        };

        await _readingListRepo.AddListAsync(list);
        await _uow.SaveChangesAsync();
        return MapToDto(list);
    }

    public async Task<IEnumerable<ReadingListItemDto>> GetItemsAsync(
        int listId, string userId)
    {
        var list = await _readingListRepo.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException($"Reading list with ID {listId} not found");

        var isCollaborator = list.Collaborators.Any(c => c.UserId == userId);
        if (list.UserId != userId && !isCollaborator)
            throw new UnauthorizedAccessException(
                "You are not authorized to view this reading list");

        var items = await _readingListRepo.GetItemsByListIdAsync(listId);
        return items.Select(MapItemToDto);
    }

    public async Task<ReadingListItemDto> AddItemAsync(
        int listId, string userId, AddReadingListItemDto dto)
    {
        var list = await _readingListRepo.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException($"Reading list with ID {listId} not found");

        var isCollaborator = list.Collaborators.Any(c => c.UserId == userId);
        if (list.UserId != userId && !isCollaborator)
            throw new UnauthorizedAccessException(
                "You are not authorized to modify this reading list");

        var book = await _bookRepo.GetByIdAsync(dto.BookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {dto.BookId} not found");

        var exists = await _readingListRepo.ItemExistsAsync(listId, dto.BookId);
        if (exists)
            throw new InvalidOperationException(
                "This book is already in the reading list");

        var item = new ReadingListItem
        {
            ReadingListId = listId,
            BookId = dto.BookId,
            AddedAt = DateTime.UtcNow
        };

        await _readingListRepo.AddItemAsync(item);
        await _uow.SaveChangesAsync();
        item.Book = book;
        return MapItemToDto(item);
    }

    public async Task RemoveItemAsync(int listId, int bookId, string userId)
    {
        var list = await _readingListRepo.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException($"Reading list with ID {listId} not found");

        var isCollaborator = list.Collaborators.Any(c => c.UserId == userId);
        if (list.UserId != userId && !isCollaborator)
            throw new UnauthorizedAccessException(
                "You are not authorized to modify this reading list");

        var item = await _readingListRepo.GetItemAsync(listId, bookId);
        if (item == null)
            throw new KeyNotFoundException("This book is not in the reading list");

        _readingListRepo.DeleteItem(item);
        await _uow.SaveChangesAsync();
    }

    public async Task AddCollaboratorAsync(int listId, string ownerId, AddCollaboratorDto dto)
    {
        var list = await _readingListRepo.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException($"Reading list with ID {listId} not found");

        if (list.UserId != ownerId)
            throw new UnauthorizedAccessException("Only the owner can add collaborators");

        if (list.Collaborators.Any(c => c.UserId == dto.UserId))
            throw new InvalidOperationException("This user is already a collaborator");

        var collaborator = new ReadingListCollaborator
        {
            ReadingListId = listId,
            UserId = dto.UserId
        };

        list.Collaborators.Add(collaborator);
        await _uow.SaveChangesAsync();
    }

    public async Task RemoveCollaboratorAsync(int listId, string ownerId, RemoveCollaboratorDto dto)
    {
        var list = await _readingListRepo.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException($"Reading list with ID {listId} not found");

        if (list.UserId != ownerId)
            throw new UnauthorizedAccessException("Only the owner can remove collaborators");

        var collaborator = list.Collaborators.FirstOrDefault(c => c.UserId == dto.UserId);
        if (collaborator == null)
            throw new KeyNotFoundException("This user is not a collaborator");

        list.Collaborators.Remove(collaborator);
        await _uow.SaveChangesAsync();
    }

    private static ReadingListDto MapToDto(ReadingList rl) => new()
    {
        Id = rl.Id,
        UserId = rl.UserId,
        Name = rl.Name,
        ItemCount = rl.Items?.Count ?? 0,
        CreatedAt = rl.CreatedAt
    };

    private static ReadingListItemDto MapItemToDto(ReadingListItem i) => new()
    {
        Id = i.Id,
        ReadingListId = i.ReadingListId,
        BookId = i.BookId,

        // Flat properties (no "Book" prefix)
        Title = i.Book?.Title ?? string.Empty,
        Author = i.Book?.Author ?? string.Empty,
        Genre = i.Book?.Genre ?? string.Empty,
        CoverImageUrl = i.Book?.CoverImageUrl,
        Status = i.Book?.Status.ToString() ?? string.Empty,

        AddedAt = i.AddedAt
    };
}
