using BookCircle.Core.DTOs.Comments;
using BookCircle.Core.Entities;
using BookCircle.Core.Enums;
using BookCircle.Core.Interfaces;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Identity;

namespace BookCircle.Core.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepo;
    private readonly IBookRepository _bookRepo;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _uow;
    private readonly UserManager<User> _userManager;
    private readonly IRealtimeNotifier? _realtimeNotifier;

    public CommentService(
        ICommentRepository commentRepo,
        IBookRepository bookRepo,
        INotificationService notificationService,
        IUnitOfWork uow,
        UserManager<User> userManager,
        IRealtimeNotifier? realtimeNotifier = null)
    {
        _commentRepo = commentRepo;
        _bookRepo = bookRepo;
        _notificationService = notificationService;
        _uow = uow;
        _userManager = userManager;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<IEnumerable<CommentDto>> GetByBookIdAsync(int bookId)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {bookId} not found");

        var comments = await _commentRepo.GetByBookIdAsync(bookId);
        return comments.Select(MapToDto);
    }

    public async Task<CommentDto> CreateAsync(
        int bookId, string userId, CreateCommentDto dto)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {bookId} not found");

        Comment? parent = null;
        if (dto.ParentId.HasValue)
        {
            parent = await _commentRepo.GetByIdAsync(dto.ParentId.Value);
            if (parent == null)
                throw new KeyNotFoundException("Parent comment not found");

            if (parent.ParentId.HasValue)
                throw new InvalidOperationException(
                    "Cannot reply to a reply. Only one level of replies is allowed");

            if (parent.BookId != bookId)
                throw new InvalidOperationException(
                    "Parent comment does not belong to this book");
        }

        var comment = new Comment
        {
            BookId = bookId,
            UserId = userId,
            Content = dto.Content,
            ParentId = dto.ParentId,
            CreatedAt = DateTime.UtcNow
        };

        await _commentRepo.AddAsync(comment);
        await _uow.SaveChangesAsync();

        var commenter = await _userManager.FindByIdAsync(userId);
        var commenterName = commenter?.FullName ?? "Someone";

        if (book.OwnerId != userId)
        {
            await _notificationService.CreateAsync(
                book.OwnerId,
                NotificationType.NewComment,
                $"{commenterName} commented on your book \"{book.Title}\"",
                comment.Id);

            // 🔔 Realtime event for owner
            if (_realtimeNotifier != null)
            {
                await _realtimeNotifier.SendCommentNewAsync(
                    book.OwnerId, comment.Id, bookId,
                    commenterName, dto.Content, dto.ParentId);
            }
        }

        // 🔔 Realtime event for parent comment owner (reply notification)
        if (parent != null && parent.UserId != userId && _realtimeNotifier != null)
        {
            await _realtimeNotifier.SendCommentReplyAsync(
                parent.UserId, comment.Id, bookId, parent.Id,
                commenterName, dto.Content);
        }

        return MapToDto(comment);
    }

    public async Task DeleteAsync(int commentId, string userId, string userRole)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId);
        if (comment == null)
            throw new KeyNotFoundException($"Comment with ID {commentId} not found");

        if (userRole != "Admin" && comment.UserId != userId)
            throw new UnauthorizedAccessException(
                "You are not authorized to delete this comment");

        _commentRepo.Delete(comment);
        await _uow.SaveChangesAsync();
    }

    private static CommentDto MapToDto(Comment c) => new()
    {
        Id = c.Id,
        BookId = c.BookId,
        UserId = c.UserId,
        UserName = c.User?.FullName ?? string.Empty,
        UserAvatarUrl = c.User?.AvatarUrl,
        Content = c.Content,
        CreatedAt = c.CreatedAt,
        ParentId = c.ParentId
    };
}