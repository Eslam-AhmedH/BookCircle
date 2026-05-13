using BookCircle.Core.DTOs.BorrowRequests;
using BookCircle.Core.Entities;
using BookCircle.Core.Enums;
using BookCircle.Core.Interfaces;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Identity;

namespace BookCircle.Core.Services;

public class BorrowRequestService : IBorrowRequestService
{
    private readonly IBorrowRequestRepository _borrowRepo;
    private readonly IBookRepository _bookRepo;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _uow;
    private readonly UserManager<User> _userManager;
    private readonly IRealtimeNotifier? _realtimeNotifier;

    public BorrowRequestService(
        IBorrowRequestRepository borrowRepo,
        IBookRepository bookRepo,
        INotificationService notificationService,
        IUnitOfWork uow,
        UserManager<User> userManager,
        IRealtimeNotifier? realtimeNotifier = null)
    {
        _borrowRepo = borrowRepo;
        _bookRepo = bookRepo;
        _notificationService = notificationService;
        _uow = uow;
        _userManager = userManager;
        _realtimeNotifier = realtimeNotifier;

        Console.WriteLine($"🟢 BorrowRequestService created. RealtimeNotifier is {(realtimeNotifier == null ? "NULL ❌" : "INJECTED ✅")}");
    }

    public async Task<IEnumerable<BorrowRequestDto>> GetIncomingAsync(string ownerId)
    {
        var requests = await _borrowRepo.GetIncomingAsync(ownerId);
        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<BorrowRequestDto>> GetMineAsync(string requesterId)
    {
        var requests = await _borrowRepo.GetMineAsync(requesterId);
        return requests.Select(MapToDto);
    }

    public async Task<BorrowRequestDto> CreateAsync(string requesterId, CreateBorrowRequestDto dto)
    {
        Console.WriteLine($"📥 CreateAsync called by user {requesterId} for book {dto.BookId}");

        var book = await _bookRepo.GetByIdAsync(dto.BookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {dto.BookId} not found");

        if (!book.IsApproved)
            throw new InvalidOperationException("Cannot request to borrow an unapproved book");

        if (book.Status != BookStatus.Available)
            throw new InvalidOperationException("This book is currently not available");

        if (book.OwnerId == requesterId)
            throw new InvalidOperationException("You cannot borrow your own book");

        var hasPending = await _borrowRepo.HasPendingRequestAsync(dto.BookId, requesterId);
        if (hasPending)
            throw new InvalidOperationException("You already have a pending request for this book");

        var request = new BorrowRequest
        {
            BookId = dto.BookId,
            RequesterId = requesterId,
            Status = BorrowRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _borrowRepo.AddAsync(request);
        await _uow.SaveChangesAsync();

        var reader = await _userManager.FindByIdAsync(requesterId);
        var readerName = reader?.FullName ?? "Someone";

        Console.WriteLine($"💾 Request saved with ID {request.Id}");
        Console.WriteLine($"📧 Creating notification for owner {book.OwnerId}");

        await _notificationService.CreateAsync(
            book.OwnerId,
            NotificationType.BorrowRequest,
            $"{readerName} requested to borrow your book: \"{book.Title}\"",
            request.Id);

        Console.WriteLine($"🔔 Attempting to send SignalR event to user-{book.OwnerId}");
        if (_realtimeNotifier != null)
        {
            try
            {
                await _realtimeNotifier.SendBorrowRequestNewAsync(
                    book.OwnerId, request.Id, book.Id, book.Title, readerName);
                Console.WriteLine("✅ SignalR event sent successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ SignalR send failed: {ex.Message}");
            }
        }
        else
        {
            Console.WriteLine("❌ _realtimeNotifier is NULL - SignalR not registered in DI!");
        }

        return MapToDto(request);
    }

    public async Task<BorrowRequestDto> RespondAsync(int id, string ownerId, string ownerRole, RespondBorrowRequestDto dto)
    {
        var request = await _borrowRepo.GetByIdAsync(id);
        if (request == null)
            throw new KeyNotFoundException($"Borrow request with ID {id} not found");

        if (ownerRole != "Admin" && request.Book.OwnerId != ownerId)
            throw new UnauthorizedAccessException("You are not authorized");

        if (request.Status != BorrowRequestStatus.Pending)
            throw new InvalidOperationException("This request has already been responded to");

        if (!Enum.TryParse<BorrowRequestStatus>(dto.Status, true, out var newStatus))
            throw new ArgumentException("Invalid status");

        request.Status = newStatus;
        request.RespondedAt = DateTime.UtcNow;

        if (newStatus == BorrowRequestStatus.Accepted)
        {
            var book = await _bookRepo.GetByIdAsync(request.BookId);
            if (book != null)
            {
                book.Status = BookStatus.Borrowed;
                _bookRepo.Update(book);

                if (_realtimeNotifier != null)
                    await _realtimeNotifier.SendBookStatusChangedAsync(book.Id, "Borrowed");
            }
        }

        _borrowRepo.Update(request);
        await _uow.SaveChangesAsync();

        var notificationType = newStatus == BorrowRequestStatus.Accepted
            ? NotificationType.BorrowAccepted : NotificationType.BorrowRejected;

        var message = newStatus == BorrowRequestStatus.Accepted
            ? $"Your borrow request for \"{request.Book.Title}\" was accepted!"
            : $"Your borrow request for \"{request.Book.Title}\" was rejected.";

        await _notificationService.CreateAsync(
            request.RequesterId, notificationType, message, request.Id);

        if (_realtimeNotifier != null)
        {
            if (newStatus == BorrowRequestStatus.Accepted)
                await _realtimeNotifier.SendBorrowRequestAcceptedAsync(
                    request.RequesterId, request.Id, request.Book.Id, request.Book.Title);
            else
                await _realtimeNotifier.SendBorrowRequestRejectedAsync(
                    request.RequesterId, request.Id, request.Book.Id, request.Book.Title);
        }

        return MapToDto(request);
    }

    public async Task<BorrowRequestDto> ReturnAsync(int id, string ownerId, string ownerRole)
    {
        var request = await _borrowRepo.GetByIdAsync(id);
        if (request == null)
            throw new KeyNotFoundException($"Borrow request with ID {id} not found");

        if (ownerRole != "Admin" && request.Book.OwnerId != ownerId)
            throw new UnauthorizedAccessException("You are not authorized");

        if (request.Status != BorrowRequestStatus.Accepted)
            throw new InvalidOperationException("Only accepted borrow requests can be returned");

        request.Status = BorrowRequestStatus.Returned;
        request.RespondedAt = DateTime.UtcNow;

        var book = await _bookRepo.GetByIdAsync(request.BookId);
        if (book != null)
        {
            book.Status = BookStatus.Available;
            _bookRepo.Update(book);

            if (_realtimeNotifier != null)
                await _realtimeNotifier.SendBookStatusChangedAsync(book.Id, "Available");
        }

        _borrowRepo.Update(request);
        await _uow.SaveChangesAsync();

        await _notificationService.CreateAsync(
            request.RequesterId, 
            NotificationType.System, 
            $"You have successfully returned \"{request.Book.Title}\". Thank you!", 
            request.Id);

        return MapToDto(request);
    }

    private static BorrowRequestDto MapToDto(BorrowRequest r) => new()
    {
        Id = r.Id,
        BookId = r.BookId,
        BookTitle = r.Book?.Title ?? string.Empty,
        BookCoverImageUrl = r.Book?.CoverImageUrl,
        ReaderId = r.RequesterId,
        ReaderName = r.Requester?.FullName ?? string.Empty,
        ReaderAvatarUrl = r.Requester?.AvatarUrl,
        OwnerId = r.Book?.OwnerId ?? string.Empty,
        OwnerName = r.Book?.Owner?.FullName ?? string.Empty,
        Status = r.Status.ToString(),
        RequestedAt = r.CreatedAt,
        RespondedAt = r.RespondedAt
    };
}
