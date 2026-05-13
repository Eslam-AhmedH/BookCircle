using BookCircle.Core.DTOs.Books;
using BookCircle.Core.DTOs.Common;
using BookCircle.Core.Entities;
using BookCircle.Core.Enums;
using BookCircle.Core.Interfaces;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Core.Interfaces.Services;

namespace BookCircle.Core.Services;

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepo;
    private readonly IUnitOfWork _uow;

    public BookService(IBookRepository bookRepo, IUnitOfWork uow)
    {
        _bookRepo = bookRepo;
        _uow = uow;
    }

    public async Task<PaginatedResult<BookDto>> GetAllAsync(BookQueryParams queryParams)
    {
        var (books, total) = await _bookRepo.GetAllAsync(queryParams);
        return new PaginatedResult<BookDto>
        {
            Items = books.Select(MapToDto),
            Page = queryParams.Page,
            Limit = queryParams.Limit,
            Total = total
        };
    }

    public async Task<BookDto> GetByIdAsync(int id)
    {
        var book = await _bookRepo.GetByIdAsync(id);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {id} not found");
        return MapToDto(book);
    }

    public async Task<IEnumerable<BookDto>> GetByOwnerIdAsync(
        string ownerId, string requestingUserId, string requestingUserRole)
    {
        if (requestingUserRole != "Admin" && ownerId != requestingUserId)
            throw new UnauthorizedAccessException("You can only view your own books");

        var books = await _bookRepo.GetByOwnerIdAsync(ownerId);
        return books.Select(MapToDto);
    }

    public async Task<BookDto> CreateAsync(string ownerId, CreateBookDto dto)
    {
        var book = new Book
        {
            OwnerId = ownerId,
            Title = dto.Title,
            Author = dto.Author,
            Genre = dto.Genre,
            Isbn = dto.Isbn,
            Language = dto.Language,
            PublicationDate = dto.PublicationDate,
            BorrowPrice = dto.BorrowPrice,
            AvailableFrom = dto.AvailableFrom,
            AvailableTo = dto.AvailableTo,
            CoverImageUrl = dto.CoverImageUrl,
            Description = dto.Description,
            Status = BookStatus.Available,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };

        await _bookRepo.AddAsync(book);
        await _uow.SaveChangesAsync();
        return MapToDto(book);
    }

    public async Task<BookDto> UpdateAsync(
        int id, string userId, string userRole, UpdateBookDto dto)
    {
        var book = await _bookRepo.GetByIdAsync(id);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {id} not found");

        if (userRole != "Admin" && book.OwnerId != userId)
            throw new UnauthorizedAccessException(
                "You are not authorized to update this book");

        if (dto.Title != null) book.Title = dto.Title;
        if (dto.Author != null) book.Author = dto.Author;
        if (dto.Genre != null) book.Genre = dto.Genre;
        if (dto.Isbn != null) book.Isbn = dto.Isbn;
        if (dto.Language != null) book.Language = dto.Language;
        if (dto.PublicationDate.HasValue) book.PublicationDate = dto.PublicationDate;
        if (dto.BorrowPrice.HasValue) book.BorrowPrice = dto.BorrowPrice.Value;
        if (dto.AvailableFrom.HasValue) book.AvailableFrom = dto.AvailableFrom;
        if (dto.AvailableTo.HasValue) book.AvailableTo = dto.AvailableTo;
        if (dto.CoverImageUrl != null) book.CoverImageUrl = dto.CoverImageUrl;
        if (dto.Description != null) book.Description = dto.Description;

        _bookRepo.Update(book);
        await _uow.SaveChangesAsync();
        return MapToDto(book);
    }

    public async Task DeleteAsync(int id, string userId, string userRole)
    {
        var book = await _bookRepo.GetByIdAsync(id);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {id} not found");

        if (book.Status == BookStatus.Borrowed)
            throw new InvalidOperationException(
                "Cannot delete a book that is currently borrowed");

        if (userRole != "Admin" && book.OwnerId != userId)
            throw new UnauthorizedAccessException(
                "You are not authorized to delete this book");

        _bookRepo.Delete(book);
        await _uow.SaveChangesAsync();
    }

    public async Task<ReactionResponseDto> ReactAsync(
        int bookId, string userId, string reaction)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {bookId} not found");

        if (!Enum.TryParse<ReactionType>(reaction, true, out var reactionType))
            throw new ArgumentException("Invalid reaction. Must be Like or Dislike");

        var existing = await _bookRepo.GetReactionAsync(bookId, userId);
        if (existing != null)
        {
            existing.Reaction = reactionType;
            _bookRepo.UpdateReaction(existing);
        }
        else
        {
            _bookRepo.AddReaction(new BookReaction
            {
                BookId = bookId,
                UserId = userId,
                Reaction = reactionType,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _uow.SaveChangesAsync();

        var updatedBook = await _bookRepo.GetByIdAsync(bookId);
        return new ReactionResponseDto
        {
            Likes = updatedBook!.Reactions.Count(r => r.Reaction == ReactionType.Like),
            Dislikes = updatedBook.Reactions.Count(r => r.Reaction == ReactionType.Dislike)
        };
    }

    public static BookDto MapToDto(Book b) => new()
    {
        Id = b.Id,
        OwnerId = b.OwnerId,
        OwnerName = b.Owner?.FullName ?? string.Empty,
        Title = b.Title,
        Author = b.Author,
        Genre = b.Genre,
        Isbn = b.Isbn,
        Language = b.Language,
        PublicationDate = b.PublicationDate,
        BorrowPrice = b.BorrowPrice,
        Status = b.Status.ToString(),
        AvailableFrom = b.AvailableFrom,
        AvailableTo = b.AvailableTo,
        CoverImageUrl = b.CoverImageUrl,
        Description = b.Description,
        IsApproved = b.IsApproved,
        Likes = b.Reactions?.Count(r => r.Reaction == ReactionType.Like) ?? 0,
        Dislikes = b.Reactions?.Count(r => r.Reaction == ReactionType.Dislike) ?? 0,
        CreatedAt = b.CreatedAt
    };
}
